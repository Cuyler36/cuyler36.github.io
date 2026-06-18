(function () {
  'use strict'

  const CHUNK_SIZE = 4 * 1024 * 1024

  const root = document.querySelector('.acdx-tool')
  if (!root) return

  const scriptUrl = document.currentScript.src
  const workerUrl = scriptUrl.replace(/acdx-ui\.js(?:\?.*)?$/, 'acdx-worker.js')
  const metadataUrl = root.dataset.metadataUrl

  const els = {
    version: document.getElementById('acdx-version-select'),
    selectedRelease: document.getElementById('acdx-selected-release'),
    dropZone: document.getElementById('acdx-drop-zone'),
    sourceFile: document.getElementById('acdx-source-file'),
    status: document.getElementById('acdx-status'),
    progressWrap: document.getElementById('acdx-progress-wrap'),
    progressBar: document.getElementById('acdx-progress-bar'),
    apply: document.getElementById('acdx-apply-button'),
    download: document.getElementById('acdx-download-link'),
    sources: document.getElementById('acdx-source-list'),
    changelog: document.getElementById('acdx-changelog')
  }

  const state = {
    metadata: null,
    selectedRelease: null,
    selectedFile: null,
    matchedSourceKey: null,
    matchedSource: null,
    currentDownloadUrl: null,
    worker: null
  }

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

  function escapeHtml (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function formatBytes (bytes) {
    if (!Number.isFinite(bytes)) return 'unknown size'
    const units = ['B', 'KB', 'MB', 'GB']
    let value = bytes
    let unit = 0
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024
      unit++
    }
    return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`
  }

  function normalizeHash (value) {
    return String(value || '').trim().toLowerCase()
  }

  function hasUsableHash (source) {
    return Boolean(normalizeHash(source.sha1))
  }

  function setStatus (message, type) {
    els.status.textContent = message
    els.status.classList.toggle('success', type === 'success')
    els.status.classList.toggle('error', type === 'error')
  }

  function setProgress (percent, label) {
    const visible = typeof percent === 'number'
    els.progressWrap.classList.toggle('hidden', !visible)
    els.progressWrap.setAttribute('aria-hidden', visible ? 'false' : 'true')
    if (visible) {
      els.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`
      if (label) setStatus(label)
    }
  }

  function resetDownload () {
    if (state.currentDownloadUrl) URL.revokeObjectURL(state.currentDownloadUrl)
    state.currentDownloadUrl = null
    els.download.classList.add('hidden')
    els.download.removeAttribute('href')
  }

  function getReleaseByVersion (version) {
    return state.metadata.releases.find(release => release.version === version)
  }

  function getPatchForMatch () {
    if (!state.selectedRelease || !state.matchedSourceKey) return null
    return state.selectedRelease.patches[state.matchedSourceKey] || null
  }

  function updateApplyButton () {
    els.apply.disabled = !(state.selectedFile && state.matchedSourceKey && getPatchForMatch())
  }

  function renderVersionOptions () {
    els.version.innerHTML = ''
    state.metadata.releases.forEach(release => {
      const option = document.createElement('option')
      option.value = release.version
      option.textContent = release.label || release.version
      els.version.appendChild(option)
    })

    const latest = getReleaseByVersion(state.metadata.latest)
    state.selectedRelease = latest || state.metadata.releases[0] || null
    if (state.selectedRelease) els.version.value = state.selectedRelease.version
  }

  function renderSelectedRelease () {
    const release = state.selectedRelease
    if (!release) {
      els.selectedRelease.textContent = 'No releases are configured yet.'
      return
    }

    els.selectedRelease.innerHTML = `
      <h3>${escapeHtml(release.label || release.version)}</h3>
      <p class="acdx-muted">${escapeHtml(release.date || 'Undated release')}</p>
      <p>${escapeHtml(release.summary || 'No summary provided.')}</p>
    `
  }

  function renderSources () {
    const entries = Object.entries(state.metadata.sources || {})
    if (entries.length === 0) {
      els.sources.innerHTML = '<p class="acdx-muted">No source images are configured.</p>'
      return
    }

    els.sources.innerHTML = entries.map(([key, source]) => `
      <article class="acdx-card">
        <h3>${escapeHtml(source.label || key)}</h3>
        <p class="acdx-muted">${escapeHtml(source.format || 'image')} ${source.region ? `- ${escapeHtml(source.region)}` : ''}</p>
        <span>Size: ${source.size ? formatBytes(source.size) : 'metadata needed'}</span>
        ${source.sha1 ? `<span class="acdx-hash">SHA-1: ${escapeHtml(source.sha1)}</span>` : '<span class="acdx-muted">SHA-1 metadata needed</span>'}
        ${source.notes ? `<p>${escapeHtml(source.notes)}</p>` : ''}
      </article>
    `).join('')
  }

  function renderChangelog () {
    const releases = state.metadata.releases || []
    els.changelog.innerHTML = releases.map(release => `
      <article class="acdx-card">
        <h3>${escapeHtml(release.label || release.version)}</h3>
        <p class="acdx-muted">${escapeHtml(release.date || 'Undated release')}</p>
        <ul>
          ${(release.changelog || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
    `).join('')
  }

  async function hashFileSha1 (file) {
    const sha1 = new Sha1()
    let offset = 0
    while (offset < file.size) {
      const chunk = new Uint8Array(await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer())
      sha1.update(chunk)
      offset += chunk.length
      setProgress((offset / file.size) * 100, `Hashing source image... ${Math.round((offset / file.size) * 100)}%`)
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    return sha1.digestHex()
  }

  async function validateSelectedFile (file) {
    resetDownload()
    state.selectedFile = file
    state.matchedSourceKey = null
    state.matchedSource = null
    updateApplyButton()

    if (!file) {
      setStatus('Load a supported source image to begin.')
      setProgress(null)
      return
    }

    setStatus(`Selected ${file.name} (${formatBytes(file.size)}). Checking size...`)

    const entries = Object.entries(state.metadata.sources || {})
    const sizeMatches = entries.filter(([, source]) => Number.isFinite(source.size) && source.size === file.size)
    if (sizeMatches.length === 0) {
      setStatus('This file size does not match any configured source image.', 'error')
      setProgress(null)
      return
    }

    const hashableMatches = sizeMatches.filter(([, source]) => hasUsableHash(source))
    if (hashableMatches.length === 0) {
      setStatus('This source size is recognized, but its hash metadata has not been configured yet.', 'error')
      setProgress(null)
      return
    }

    const sha1 = await hashFileSha1(file)
    setProgress(null)

    const matched = hashableMatches.find(([, source]) => normalizeHash(source.sha1) === sha1)
    if (!matched) {
      setStatus(`No supported source matched SHA-1 ${sha1}.`, 'error')
      return
    }

    state.matchedSourceKey = matched[0]
    state.matchedSource = matched[1]

    const patch = getPatchForMatch()
    if (!patch) {
      setStatus(`${state.matchedSource.label} is valid, but ${state.selectedRelease.label || state.selectedRelease.version} does not provide a patch for it.`, 'error')
      updateApplyButton()
      return
    }

    setStatus(`Valid source: ${state.matchedSource.label}. Ready to apply ${state.selectedRelease.label || state.selectedRelease.version}.`, 'success')
    updateApplyButton()
  }

  function handleVersionChange () {
    state.selectedRelease = getReleaseByVersion(els.version.value)
    renderSelectedRelease()
    renderChangelog()
    resetDownload()
    updateApplyButton()

    if (state.selectedFile && state.matchedSourceKey) {
      const patch = getPatchForMatch()
      if (patch) {
        setStatus(`Valid source: ${state.matchedSource.label}. Ready to apply ${state.selectedRelease.label || state.selectedRelease.version}.`, 'success')
      } else {
        setStatus(`${state.matchedSource.label} is valid, but this release does not provide a patch for it.`, 'error')
      }
    }
  }

  function bindDragAndDrop () {
    ;['dragenter', 'dragover'].forEach(eventName => {
      els.dropZone.addEventListener(eventName, event => {
        event.preventDefault()
        els.dropZone.classList.add('drag-over')
      })
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      els.dropZone.addEventListener(eventName, event => {
        event.preventDefault()
        els.dropZone.classList.remove('drag-over')
      })
    })

    els.dropZone.addEventListener('drop', event => {
      const file = event.dataTransfer.files && event.dataTransfer.files[0]
      if (file) {
        els.sourceFile.files = event.dataTransfer.files
        validateSelectedFile(file).catch(handleError)
      }
    })
  }

  function handleError (error) {
    setProgress(null)
    setStatus(error.message || String(error), 'error')
    updateApplyButton()
  }

  async function applyPatch () {
    const patch = getPatchForMatch()
    if (!state.selectedFile || !patch) return

    resetDownload()
    els.apply.disabled = true
    setProgress(0, 'Preparing patch worker...')

    if (state.worker) state.worker.terminate()
    state.worker = new Worker(workerUrl, { type: 'module' })

    state.worker.onmessage = event => {
      const message = event.data
      if (message.type === 'progress') {
        setProgress(message.percent, message.message)
      } else if (message.type === 'complete') {
        const blob = new Blob([message.output], { type: 'application/octet-stream' })
        state.currentDownloadUrl = URL.createObjectURL(blob)
        els.download.href = state.currentDownloadUrl
        els.download.download = message.outputName
        els.download.classList.remove('hidden')
        setProgress(null)
        setStatus(`Patch complete. Output SHA-1: ${message.sha1 || 'not checked'}.`, 'success')
        updateApplyButton()
        state.worker.terminate()
        state.worker = null
      } else if (message.type === 'error') {
        handleError(new Error(message.message))
        state.worker.terminate()
        state.worker = null
      }
    }

    state.worker.onerror = event => {
      handleError(new Error(event.message || 'Patch worker failed.'))
      if (state.worker) {
        state.worker.terminate()
        state.worker = null
      }
    }

    state.worker.postMessage({
      type: 'patch',
      sourceFile: state.selectedFile,
      patchUrl: new URL(patch.url, window.location.href).href,
      outputName: patch.outputName || `ACDX-${state.selectedRelease.version}.iso`,
      expectedOutputSize: patch.outputSize || null,
      expectedOutputSha1: patch.outputSha1 || ''
    })
  }

  async function init () {
    const response = await fetch(metadataUrl, { cache: 'no-cache' })
    if (!response.ok) throw new Error(`Failed to load release metadata (${response.status}).`)
    state.metadata = await response.json()

    renderVersionOptions()
    renderSelectedRelease()
    renderSources()
    renderChangelog()

    els.version.addEventListener('change', handleVersionChange)
    els.sourceFile.addEventListener('change', event => validateSelectedFile(event.target.files[0]).catch(handleError))
    els.apply.addEventListener('click', () => applyPatch().catch(handleError))
    bindDragAndDrop()
    updateApplyButton()
  }

  init().catch(handleError)
})()
