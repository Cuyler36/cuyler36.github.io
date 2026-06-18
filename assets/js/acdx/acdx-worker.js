import createXdelta3Module from './vendor/xdelta3-stream.js'

const BUFFER_SIZE = 4 * 1024 * 1024
const CACHE_SIZE = 32

const reader = new FileReaderSync()

function postProgress (percent, message) {
  self.postMessage({ type: 'progress', percent, message })
}

async function sha1Hex (bytes) {
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function fetchPatch (patchUrl) {
  postProgress(15, 'Downloading xdelta patch...')
  const response = await fetch(patchUrl)
  if (!response.ok) throw new Error(`Failed to download patch (${response.status}).`)
  return response.blob()
}

function readBlobSlice (blob, buffer, offset, size, module) {
  const end = Math.min(blob.size, offset + size)
  const read = end - offset
  if (read <= 0) return 0

  const data = reader.readAsArrayBuffer(blob.slice(offset, end))
  module.HEAP8.set(new Uint8Array(data), buffer)
  return read
}

async function applyPatch (message) {
  const patchBlob = await fetchPatch(message.patchUrl)

  postProgress(25, 'Loading xdelta3 engine...')
  const outputChunks = []
  let outputSize = 0
  let errorMessage = ''
  let lastProgressSize = 0

  const module = await createXdelta3Module({
    locateFile: file => file === 'xdelta3.wasm'
      ? '/assets/js/acdx/vendor/xdelta3-stream.wasm'
      : file,
    print: () => {},
    printErr: () => {}
  })

  module.readSource = (buffer, offset, size) => {
    return readBlobSlice(message.sourceFile, buffer, Number(offset), size, module)
  }
  module.readPatch = (buffer, offset, size) => {
    return readBlobSlice(patchBlob, buffer, Number(offset), size, module)
  }
  module.outputFile = (buffer, size) => {
    const dataView = new Uint8Array(module.HEAP8.buffer, buffer, size)
    const data = new Uint8Array(dataView)
    outputChunks.push(data)
    outputSize += data.byteLength

    if (outputSize - lastProgressSize >= BUFFER_SIZE) {
      lastProgressSize = outputSize
      if (message.expectedOutputSize) {
        postProgress(45 + (outputSize / message.expectedOutputSize) * 40, `Patching... ${Math.round((outputSize / message.expectedOutputSize) * 100)}%`)
      } else {
        postProgress(65, `Patching... wrote ${outputSize} bytes`)
      }
    }
  }
  module.reportError = buffer => {
    errorMessage = module.UTF8ToString(buffer)
  }

  postProgress(45, 'Applying xdelta patch...')
  const result = module.callMain([BUFFER_SIZE.toString(), CACHE_SIZE.toString(), 'false'])
  if (result !== 0) {
    throw new Error(errorMessage || `xdelta patching failed with code ${result}.`)
  }

  if (message.expectedOutputSize && outputSize !== message.expectedOutputSize) {
    throw new Error(`Patched output size mismatch. Expected ${message.expectedOutputSize} bytes, got ${outputSize} bytes.`)
  }

  const outputBuffer = new ArrayBuffer(outputSize)
  const output = new Uint8Array(outputBuffer)
  let offset = 0
  outputChunks.forEach(chunk => {
    output.set(chunk, offset)
    offset += chunk.byteLength
  })

  postProgress(85, 'Verifying patched output...')
  const outputSha1 = await sha1Hex(outputBuffer)
  const expectedSha1 = String(message.expectedOutputSha1 || '').trim().toLowerCase()
  if (expectedSha1 && outputSha1 !== expectedSha1) {
    throw new Error(`Patched output SHA-1 mismatch. Expected ${expectedSha1}, got ${outputSha1}.`)
  }

  postProgress(100, 'Patch complete.')
  self.postMessage({
    type: 'complete',
    output: outputBuffer,
    outputName: message.outputName,
    sha1: outputSha1
  }, [outputBuffer])
}

self.addEventListener('message', event => {
  const message = event.data
  if (!message || message.type !== 'patch') return

  applyPatch(message).catch(error => {
    self.postMessage({
      type: 'error',
      message: error.message || String(error)
    })
  })
})
