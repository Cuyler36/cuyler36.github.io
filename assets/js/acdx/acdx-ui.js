(function () {
  'use strict'

  const root = document.querySelector('.acdx-tool')
  if (!root) return

  const scriptUrl = document.currentScript.src
  const workerUrl = scriptUrl.replace(/acdx-ui\.js(?:\?.*)?$/, 'acdx-worker.js')
  const hashWorkerUrl = scriptUrl.replace(/acdx-ui\.js(?:\?.*)?$/, 'acdx-hash-worker.js')
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
    worker: null,
    hashWorker: null,
    hashRequestId: 0,
    hashReject: null
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

  function cancelHashWorker () {
    state.hashRequestId++
    if (state.hashWorker) {
      state.hashWorker.terminate()
      state.hashWorker = null
    }
    if (state.hashReject) {
      const error = new Error('Hash cancelled.')
      error.name = 'AbortError'
      state.hashReject(error)
      state.hashReject = null
    }
  }

  function getReleaseByVersion (version) {
    return state.metadata.releases.find(release => release.version === version)
  }

  function getOrderedReleases () {
    return (state.metadata.releases || [])
      .map((release, index) => ({ release, index }))
      .sort((a, b) => {
        const aOrder = Number(a.release.orderId)
        const bOrder = Number(b.release.orderId)
        const aHasOrder = Number.isFinite(aOrder)
        const bHasOrder = Number.isFinite(bOrder)

        if (aHasOrder && bHasOrder && aOrder !== bOrder) return bOrder - aOrder
        if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1
        return a.index - b.index
      })
      .map(entry => entry.release)
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
    getOrderedReleases().forEach(release => {
      const option = document.createElement('option')
      option.value = release.version
      option.textContent = release.label || release.version
      els.version.appendChild(option)
    })

    const latest = getReleaseByVersion(state.metadata.latest)
    state.selectedRelease = latest || getOrderedReleases()[0] || null
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
    const releases = getOrderedReleases()
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
    if (state.hashWorker) state.hashWorker.terminate()

    const requestId = ++state.hashRequestId
    state.hashWorker = new Worker(hashWorkerUrl)

    return new Promise((resolve, reject) => {
      state.hashReject = reject

      state.hashWorker.onmessage = event => {
        const message = event.data
        if (!message || message.requestId !== requestId) return

        if (message.type === 'progress') {
          setProgress(message.percent, message.message)
        } else if (message.type === 'complete') {
          state.hashWorker.terminate()
          state.hashWorker = null
          state.hashReject = null
          resolve(message.sha1)
        } else if (message.type === 'error') {
          state.hashWorker.terminate()
          state.hashWorker = null
          state.hashReject = null
          reject(new Error(message.message))
        }
      }

      state.hashWorker.onerror = event => {
        if (state.hashWorker) {
          state.hashWorker.terminate()
          state.hashWorker = null
        }
        state.hashReject = null
        reject(new Error(event.message || 'Hash worker failed.'))
      }

      state.hashWorker.postMessage({
        type: 'hash',
        requestId,
        file,
        deviceMemory: Number(navigator.deviceMemory) || null
      })
    })
  }

  async function validateSelectedFile (file) {
    cancelHashWorker()
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

    let sha1
    try {
      sha1 = await hashFileSha1(file)
    } catch (error) {
      if (error.name === 'AbortError') return
      throw error
    }
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
