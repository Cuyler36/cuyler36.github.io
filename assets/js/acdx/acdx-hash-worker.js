(function () {
  'use strict'

  const CHUNK_SIZE = 16 * 1024 * 1024
  const BYTES_PER_GIB = 1024 * 1024 * 1024
  const MAX_UNKNOWN_MEMORY_NATIVE_HASH_SIZE = 256 * 1024 * 1024
  const MAX_NATIVE_HASH_MEMORY_FRACTION = 0.25

  class Sha1 {
    constructor () {
      this.h0 = 0x67452301
      this.h1 = 0xefcdab89
      this.h2 = 0x98badcfe
      this.h3 = 0x10325476
      this.h4 = 0xc3d2e1f0
      this.block = new Uint8Array(64)
      this.blockLength = 0
      this.bytesHashed = 0
      this.finished = false
      this.words = new Uint32Array(80)
    }

    update (data) {
      if (this.finished) throw new Error('SHA-1 digest already finished')

      let position = 0
      this.bytesHashed += data.length

      if (this.blockLength > 0) {
        while (this.blockLength < 64 && position < data.length) {
          this.block[this.blockLength++] = data[position++]
        }
        if (this.blockLength === 64) {
          this.processBlock(this.block, 0)
          this.blockLength = 0
        }
      }

      while (position + 64 <= data.length) {
        this.processBlock(data, position)
        position += 64
      }

      while (position < data.length) {
        this.block[this.blockLength++] = data[position++]
      }
    }

    digestHex () {
      const bitsHigh = Math.floor(this.bytesHashed / 0x20000000)
      const bitsLow = (this.bytesHashed << 3) >>> 0
      const padLength = this.blockLength < 56 ? 56 - this.blockLength : 120 - this.blockLength
      const padding = new Uint8Array(padLength + 8)
      padding[0] = 0x80
      writeUint32(padding, padLength, bitsHigh)
      writeUint32(padding, padLength + 4, bitsLow)
      this.update(padding)
      this.finished = true

      return [this.h0, this.h1, this.h2, this.h3, this.h4]
        .map(value => value.toString(16).padStart(8, '0'))
        .join('')
    }

    processBlock (data, offset) {
      const words = this.words
      for (let i = 0; i < 16; i++) {
        words[i] = (
          (data[offset++] << 24) |
          (data[offset++] << 16) |
          (data[offset++] << 8) |
          data[offset++]
        ) >>> 0
      }

      for (let i = 16; i < 80; i++) {
        words[i] = rotateLeft(words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16], 1)
      }

      let a = this.h0
      let b = this.h1
      let c = this.h2
      let d = this.h3
      let e = this.h4

      for (let i = 0; i < 80; i++) {
        let f
        let k
        if (i < 20) {
          f = (b & c) | ((~b) & d)
          k = 0x5a827999
        } else if (i < 40) {
          f = b ^ c ^ d
          k = 0x6ed9eba1
        } else if (i < 60) {
          f = (b & c) | (b & d) | (c & d)
          k = 0x8f1bbcdc
        } else {
          f = b ^ c ^ d
          k = 0xca62c1d6
        }

        const temp = (rotateLeft(a, 5) + f + e + k + words[i]) >>> 0
        e = d
        d = c
        c = rotateLeft(b, 30)
        b = a
        a = temp
      }

      this.h0 = (this.h0 + a) >>> 0
      this.h1 = (this.h1 + b) >>> 0
      this.h2 = (this.h2 + c) >>> 0
      this.h3 = (this.h3 + d) >>> 0
      this.h4 = (this.h4 + e) >>> 0
    }
  }

  function rotateLeft (value, bits) {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0
  }

  function writeUint32 (target, offset, value) {
    target[offset] = (value >>> 24) & 0xff
    target[offset + 1] = (value >>> 16) & 0xff
    target[offset + 2] = (value >>> 8) & 0xff
    target[offset + 3] = value & 0xff
  }

  function toHex (buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  function postProgress (requestId, percent, message) {
    self.postMessage({ type: 'progress', requestId, percent, message })
  }

  function postComplete (requestId, sha1) {
    self.postMessage({ type: 'complete', requestId, sha1 })
  }

  function readWholeFile (requestId, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onprogress = event => {
        if (!event.lengthComputable) return
        const readPercent = (event.loaded / event.total) * 100
        postProgress(requestId, readPercent * 0.8, `Reading source image... ${Math.round(readPercent)}%`)
      }
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error || new Error('Failed to read source image.'))

      reader.readAsArrayBuffer(file)
    })
  }

  async function hashWithWebCrypto (requestId, file) {
    const buffer = await readWholeFile(requestId, file)
    postProgress(requestId, 90, 'Hashing source image...')
    return toHex(await crypto.subtle.digest('SHA-1', buffer))
  }

  function canUseNativeHash (file, deviceMemory) {
    if (typeof crypto === 'undefined' || !crypto.subtle) return false
    if (!Number.isFinite(deviceMemory) || deviceMemory <= 0) return file.size <= MAX_UNKNOWN_MEMORY_NATIVE_HASH_SIZE

    const availableBytes = deviceMemory * BYTES_PER_GIB
    return file.size <= availableBytes * MAX_NATIVE_HASH_MEMORY_FRACTION
  }

  function hashWithStreamingFallback (requestId, file) {
    const reader = new FileReaderSync()
    const sha1 = new Sha1()
    let offset = 0

    while (offset < file.size) {
      const end = Math.min(file.size, offset + CHUNK_SIZE)
      const chunk = new Uint8Array(reader.readAsArrayBuffer(file.slice(offset, end)))
      sha1.update(chunk)
      offset = end
      postProgress(requestId, (offset / file.size) * 100, `Hashing source image... ${Math.round((offset / file.size) * 100)}%`)
    }

    return sha1.digestHex()
  }

  async function hashFile (requestId, file, deviceMemory) {
    if (canUseNativeHash(file, deviceMemory)) {
      try {
        postProgress(requestId, 0, 'Reading source image...')
        return await hashWithWebCrypto(requestId, file)
      } catch (error) {
        postProgress(requestId, 0, 'Hashing source image with streaming fallback...')
      }
    } else {
      postProgress(requestId, 0, 'Hashing source image in memory-safe chunks...')
    }

    return hashWithStreamingFallback(requestId, file)
  }

  self.addEventListener('message', event => {
    const message = event.data
    if (!message || message.type !== 'hash') return

    hashFile(message.requestId, message.file, message.deviceMemory === null ? null : Number(message.deviceMemory))
      .then(sha1 => postComplete(message.requestId, sha1))
      .catch(error => {
        self.postMessage({
          type: 'error',
          requestId: message.requestId,
          message: error.message || String(error)
        })
      })
  })
})()
