/**
 * Password generator UI for cuyler36.github.io
 */
(function () {
  'use strict'

  const FONT_URL = 'https://dodo.ac/np/images/8/8a/Animal_Crossing_PAL_Font.svg'
  const DATA_BASE = document.querySelector('script[src*="passwordgen-ui"]')
    ? document.querySelector('script[src*="passwordgen-ui"]').src.replace(/passwordgen-ui\.js.*/, '../../data/passwords/')
    : '/assets/data/passwords/'

  const GAME_CONFIG = {
    ac: {
      label: 'Animal Crossing',
      passwordCols: 14,
      passwordRows: 2,
      charMap: () => character_map,
      codeTypes: [
        { value: CODE_TYPES.Famicom, label: 'Famicom' },
        { value: CODE_TYPES.Popular, label: 'Popular' },
        { value: CODE_TYPES.CardE, label: 'CardE' },
        { value: CODE_TYPES.Magazine, label: 'Magazine' },
        { value: CODE_TYPES.User, label: 'User', selected: true },
        { value: CODE_TYPES.CardEMini, label: 'CardEMini' }
      ],
      strings: [
        { id: 'str0', label: 'Player Name (String #1)', size: 8 },
        { id: 'str1', label: 'Town Name (String #2)', size: 8 }
      ],
      itemsUrl: DATA_BASE + 'ac-items.json',
      villagersUrl: DATA_BASE + 'ac-villagers.json',
      infoDefault: 'This code can only be told to Tom Nook.',
      useItemId: true
    },
    afplus: {
      label: 'Doubutsu no Mori+',
      passwordCols: 11,
      passwordRows: 2,
      charMap: () => afplus_character_set,
      codeTypes: [
        { value: AFPLUS_CODE_TYPES.Famicom, label: 'Famicom' },
        { value: AFPLUS_CODE_TYPES.Popular, label: 'Popular', selected: true },
        { value: AFPLUS_CODE_TYPES.CardE, label: 'CardE' },
        { value: AFPLUS_CODE_TYPES.Magazine, label: 'Magazine' }
      ],
      strings: [
        { id: 'str0', label: 'Player Name', size: 6 },
        { id: 'str1', label: 'Town Name', size: 6 }
      ],
      itemsUrl: null,
      villagersUrl: DATA_BASE + 'ac-villagers.json',
      infoDefault: 'AF+ passwords are 22 hiragana characters (11 per line).',
      useItemId: false,
      idLabel: 'Present Index (hex)'
    },
    afeplus: {
      label: 'Doubutsu no Mori e+',
      passwordCols: 16,
      passwordRows: 2,
      charMap: () => afe_character_map,
      codeTypes: [
        { value: AFE_CODE_TYPES.Famicom, label: 'Famicom' },
        { value: AFE_CODE_TYPES.NPC, label: 'NPC' },
        { value: AFE_CODE_TYPES.CardE, label: 'CardE' },
        { value: AFE_CODE_TYPES.Magazine, label: 'Magazine' },
        { value: AFE_CODE_TYPES.User, label: 'User', selected: true },
        { value: AFE_CODE_TYPES.CardEMini, label: 'CardEMini' }
      ],
      strings: [
        { id: 'str0', label: 'Recipient Town', size: 6 },
        { id: 'str1', label: 'Recipient Name', size: 6 },
        { id: 'str2', label: 'Sender Name', size: 6 }
      ],
      itemsUrl: DATA_BASE + 'ac-items.json',
      villagersUrl: DATA_BASE + 'ac-villagers.json',
      infoDefault: 'AFe+ passwords are 32 characters (16 per line).',
      useItemId: true,
      showEnglishToggle: true
    }
  }

  let currentGame = 'ac'
  let currentMode = 'generate'
  let items = []
  let villagers = []
  let specialVillagers = []
  let stringBuffers = {}
  let stringCanvases = {}
  let passwordBuffer = new Uint8Array(28)
  let selectedCanvas = null
  let selectedBuffer = null
  let selectedCols = 8
  let selectedCharIdx = 0
  const fontImg = new Image()
  fontImg.src = FONT_URL

  function $(id) {
    return document.getElementById(id)
  }

  function clearCanvas (canvas) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function getOffset (el) {
    const rect = el.getBoundingClientRect()
    return { left: rect.left + window.scrollX, top: rect.top + window.scrollY }
  }

  function drawStringToCanvas (buf, canvas, cols, rows) {
    if (!fontImg.complete || !fontImg.naturalWidth) return
    const fw = fontImg.width / 16
    const fh = fontImg.height / 16
    const cw = canvas.width / cols
    const ch = canvas.height / rows
    const ctx = canvas.getContext('2d')
    const map = GAME_CONFIG[currentGame].charMap()
    for (let i = 0; i < buf.length; i++) {
      const code = buf[i]
      let fontIdx = code
      if (currentGame === 'ac') {
        fontIdx = code
      } else {
        fontIdx = character_map.indexOf(map[code])
        if (fontIdx < 0) fontIdx = 0x20
      }
      const fx = fontIdx % 16
      const fy = Math.floor(fontIdx / 16)
      const row = Math.floor(i / cols)
      ctx.drawImage(fontImg, fx * fw, fy * fh, fw, fh, (i % cols) * cw, row * ch, cw, ch)
    }
  }

  function highlightSelected (canvas, cols, rows) {
    if (selectedCanvas !== canvas) return
    const ctx = canvas.getContext('2d')
    const x = selectedCharIdx % cols
    const y = Math.floor(selectedCharIdx / cols)
    const cw = canvas.width / cols
    const ch = canvas.height / rows
    ctx.fillStyle = 'rgba(255,255,0,0.45)'
    ctx.fillRect(x * cw, y * ch, cw, ch)
  }

  function redrawCanvas (canvasId) {
    if (canvasId.endsWith('_mirror')) return
    const canvas = stringCanvases[canvasId]
    const mirror = stringCanvases[canvasId + '_mirror']
    const spec = GAME_CONFIG[currentGame].strings.find(s => s.id === canvasId)
    if (!canvas || !spec) return
    ;[canvas, mirror].forEach(function (target) {
      if (!target) return
      clearCanvas(target)
      if (target === selectedCanvas) highlightSelected(target, spec.size, 1)
      drawStringToCanvas(stringBuffers[canvasId], target, spec.size, 1)
    })
  }

  function selectCanvas (canvasId) {
    Object.keys(stringBuffers).forEach(function (id) {
      if (!id.endsWith('_mirror')) redrawCanvas(id)
    })
    selectedCanvas = stringCanvases[canvasId]
    selectedBuffer = stringBuffers[canvasId]
    selectedCols = GAME_CONFIG[currentGame].strings.find(s => s.id === canvasId).size
    selectedCharIdx = 0
    redrawCanvas(canvasId)
  }

  function addChar (code) {
    if (!selectedBuffer) return
    if (currentGame !== 'ac') {
      const map = GAME_CONFIG[currentGame].charMap()
      const ch = character_map[code]
      code = map.indexOf(ch)
      if (code < 0) return
    }
    selectedBuffer[selectedCharIdx] = code
    const max = selectedBuffer.length - 1
    if (selectedCharIdx < max) selectedCharIdx++
    Object.keys(stringCanvases).forEach(function (id) {
      if (!id.endsWith('_mirror') && stringCanvases[id] === selectedCanvas) redrawCanvas(id)
    })
  }

  function buildStringFields () {
    const wrap = $('string-fields')
    const canvasWrap = $('canvas-fields')
    wrap.innerHTML = ''
    canvasWrap.innerHTML = ''
    stringBuffers = {}
    stringCanvases = {}

    GAME_CONFIG[currentGame].strings.forEach((spec, idx) => {
      stringBuffers[spec.id] = new Uint8Array(spec.size)
      stringBuffers[spec.id].fill(0x20)

      const h = document.createElement('h3')
      h.textContent = spec.label
      wrap.appendChild(h)

      const c = document.createElement('canvas')
      c.className = 'text-canvas'
      c.width = spec.size * 28
      c.height = 40
      c.dataset.fieldId = spec.id
      wrap.appendChild(c)
      stringCanvases[spec.id] = c

      const cloneLabel = document.createElement('p')
      cloneLabel.className = 'help-text'
      cloneLabel.textContent = spec.label
      canvasWrap.appendChild(cloneLabel)
      const clone = c.cloneNode(true)
      clone.width = c.width
      clone.height = c.height
      clone.className = 'text-canvas'
      clone.dataset.fieldId = spec.id
      canvasWrap.appendChild(clone)
      stringCanvases[spec.id + '_mirror'] = clone

      const activate = function (fieldId, canvasEl) {
        return function (e) {
          selectCanvas(fieldId)
          if (e) {
            const ofs = getOffset(canvasEl)
            const cw = canvasEl.width / spec.size
            const x = Math.floor((e.pageX - ofs.left) / cw)
            selectedCharIdx = Math.max(0, Math.min(spec.size - 1, x))
          }
          redrawCanvas(fieldId)
        }
      }

      c.addEventListener('mousedown', activate(spec.id, c))
      clone.addEventListener('mousedown', activate(spec.id, clone))
      if (idx === 0) selectCanvas(spec.id)
    })
  }

  function populateCodeTypes () {
    const sel = $('codetype')
    sel.innerHTML = ''
    GAME_CONFIG[currentGame].codeTypes.forEach(ct => {
      if (ct.hidden) return
      const opt = document.createElement('option')
      opt.value = String(ct.value)
      opt.textContent = ct.label
      if (ct.selected) opt.selected = true
      sel.appendChild(opt)
    })
    onCodeTypeChanged()
  }

  function setVisible (el, show) {
    if (!el) return
    el.classList.toggle('hidden', !show)
  }

  function onCodeTypeChanged () {
    const codeType = Number($('codetype').value)
    const info = $('codeTypeInfoLabel')
    const villagerControls = $('villager-controls')
    const hitrateControls = $('hitrate-controls')
    const nesControls = $('nes-controls')
    const itemControls = $('item-controls')

    setVisible(villagerControls, false)
    setVisible(hitrateControls, false)
    setVisible(nesControls, false)
    setVisible(itemControls, true)

    if (currentGame === 'ac') {
      switch (codeType) {
        case CODE_TYPES.Famicom:
          info.textContent = 'This code can be told to Tom Nook or mailed to any villager in town.'
          setVisible(nesControls, true)
          setVisible(itemControls, false)
          break
        case CODE_TYPES.Popular:
        case CODE_TYPES.CardE:
          info.textContent = codeType === CODE_TYPES.CardE
            ? 'Mail this code to a villager. Mailing to the embedded villager gives the selected NES chance.'
            : 'This code can be told to Tom Nook or mailed to any villager in town.'
          setVisible(villagerControls, true)
          if (codeType === CODE_TYPES.CardE) {
            setVisible($('cardeHitrateHeader'), true)
            setVisible($('cardeHitrateSelect'), true)
          }
          break
        case CODE_TYPES.Magazine:
          info.textContent = 'This code can be told to Tom Nook or mailed to any villager in town.'
          setVisible(hitrateControls, true)
          setVisible($('hitrateHeader'), true)
          setVisible($('hitrateSelect'), true)
          break
        case CODE_TYPES.User:
          info.textContent = 'This code can only be told to Tom Nook.'
          break
        case CODE_TYPES.CardEMini:
          info.textContent = 'This code can only be told to Tom Nook.'
          break
      }
    } else if (currentGame === 'afplus') {
      info.textContent = GAME_CONFIG.afplus.infoDefault
      if (codeType === AFPLUS_CODE_TYPES.Popular || codeType === AFPLUS_CODE_TYPES.CardE) {
        setVisible(villagerControls, true)
      }
      if (codeType === AFPLUS_CODE_TYPES.Famicom) {
        setVisible(itemControls, false)
        setVisible(nesControls, true)
      }
    } else if (currentGame === 'afeplus') {
      info.textContent = GAME_CONFIG.afeplus.infoDefault
      if (codeType === AFE_CODE_TYPES.NPC || codeType === AFE_CODE_TYPES.CardE) {
        setVisible(villagerControls, true)
      }
      if (codeType === AFE_CODE_TYPES.Famicom) {
        setVisible(itemControls, false)
        setVisible(nesControls, true)
      }
    }
  }

  function parseItemId () {
    const codeType = Number($('codetype').value)
    if (
      (currentGame === 'ac' && codeType === CODE_TYPES.Famicom) ||
      (currentGame === 'afplus' && codeType === AFPLUS_CODE_TYPES.Famicom) ||
      (currentGame === 'afeplus' && codeType === AFE_CODE_TYPES.Famicom)
    ) {
      return parseInt($('nesSelect').value, 16)
    }

    if ($('advancedToggle').checked) {
      const raw = $('manualHexId').value.trim()
      if (!/^[0-9A-Fa-f]+$/.test(raw)) throw new Error('Invalid hex ID.')
      return parseInt(raw, 16)
    }

    const val = $('itemSearch').value
    const match = val.match(/\[([0-9A-Fa-f]+)\]/)
    if (!match) throw new Error('Select an item from the list or use Advanced mode.')
    return parseInt(match[1], 16)
  }

  function generatePassword () {
    const codeType = Number($('codetype').value)
    let hitrate = 0
    let npcCode = 0
    let npcType = 0
    let itemId

    try {
      itemId = parseItemId()
    } catch (err) {
      alert(err.message)
      return
    }

    if (currentGame === 'ac') {
      if (codeType === CODE_TYPES.Magazine) {
        hitrate = Number($('hitrateSelect').value)
      } else if (codeType === CODE_TYPES.CardE) {
        hitrate = Number($('cardeHitrateSelect').value)
      }
      if (codeType === CODE_TYPES.Popular || codeType === CODE_TYPES.CardE) {
        if ($('specialToggle').checked) {
          npcType = 1
          npcCode = $('specialVillagerSelect').selectedIndex
        } else {
          npcCode = $('villagerSelect').selectedIndex
        }
      }
      passwordBuffer = MakePassword(
        codeType,
        hitrate,
        stringBuffers.str0,
        stringBuffers.str1,
        itemId,
        npcType,
        npcCode
      )
    } else if (currentGame === 'afplus') {
      if (codeType === AFPLUS_CODE_TYPES.Popular || codeType === AFPLUS_CODE_TYPES.CardE) {
        if ($('specialToggle').checked) {
          npcType = 1
          npcCode = $('specialVillagerSelect').selectedIndex
        } else {
          npcCode = $('villagerSelect').selectedIndex
        }
      }
      passwordBuffer = MakePasswordAFPlus(
        codeType,
        hitrate,
        stringBuffers.str0,
        stringBuffers.str1,
        itemId,
        npcType,
        npcCode
      )
    } else if (currentGame === 'afeplus') {
      const english = $('englishPasswordToggle').checked
      passwordBuffer = MakePasswordAFe(
        codeType,
        hitrate,
        stringBuffers.str0,
        stringBuffers.str1,
        stringBuffers.str2,
        itemId,
        0,
        english
      )
    }

    const cfg = GAME_CONFIG[currentGame]
    const out = $('outPwdCanvas')
    out.width = out.offsetWidth
    out.height = out.offsetHeight
    clearCanvas(out)
    drawStringToCanvas(passwordBuffer, out, cfg.passwordCols, cfg.passwordRows)

    let plain
    if (currentGame === 'ac') plain = ConvertBytesToUnicodeString(passwordBuffer)
    else if (currentGame === 'afplus') plain = ConvertBytesToUnicodeStringAFPlus(passwordBuffer)
    else plain = ConvertBytesToUnicodeStringAFe(passwordBuffer)

    const mid = cfg.passwordCols
    $('plaintext').innerHTML = plain.slice(0, mid) + '<br>' + plain.slice(mid)
  }

  function decodePassword () {
    const raw = $('decodeInput').value.replace(/\s+/g, '')
    const result = $('decodeResult')
    try {
      if (currentGame === 'ac') {
        const data = DecodePassword(raw)
        result.textContent = [
          'Valid: ' + data.Valid,
          'Type: ' + code_types[data.Type],
          'Item ID: 0x' + data.ItemId.toString(16).toUpperCase(),
          'String 0: ' + JSON.stringify(data.String0),
          'String 1: ' + JSON.stringify(data.String1),
          'NPC Code: ' + data.NPCCode,
          'Special NPC: ' + data.SpecialNPC,
          'Hit Rate Index: ' + data.HitRateIndex
        ].join('\n')
      } else if (currentGame === 'afplus') {
        const data = DecodePasswordAFPlus(raw)
        result.textContent = [
          'Type: ' + data.Type,
          'Present Index: 0x' + data.PresentIndex.toString(16).toUpperCase(),
          'String 0: ' + JSON.stringify(data.String0),
          'String 1: ' + JSON.stringify(data.String1),
          'NPC Code: ' + data.NPCCode,
          'Checksum: 0x' + data.Checksum.toString(16).toUpperCase()
        ].join('\n')
      } else {
        result.textContent = 'Decoder for Doubutsu no Mori e+ is not yet available in the browser UI.'
      }
      result.classList.remove('hidden')
    } catch (err) {
      alert(err.message || String(err))
    }
  }

  function switchGame (game) {
    currentGame = game
    document.querySelectorAll('.game-tab').forEach(btn => {
      btn.classList.toggle('btn-primary', btn.dataset.game === game)
      btn.classList.toggle('btn-default', btn.dataset.game !== game)
    })
    $('itemHeader').textContent = GAME_CONFIG[game].useItemId ? 'Item' : (GAME_CONFIG[game].idLabel || 'Present Index')
    setVisible($('afe-english-toggle'), !!GAME_CONFIG[game].showEnglishToggle)
    buildStringFields()
    populateCodeTypes()
    $('codeTypeInfoLabel').textContent = GAME_CONFIG[game].infoDefault
    loadItems()
  }

  function switchMode (mode) {
    currentMode = mode
    document.querySelectorAll('.mode-tab').forEach(btn => {
      btn.classList.toggle('btn-primary', btn.dataset.mode === mode)
      btn.classList.toggle('btn-default', btn.dataset.mode !== mode)
    })
    setVisible($('generate-panel'), mode === 'generate')
    setVisible($('decode-panel'), mode === 'decode')
  }

  async function loadJson (url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to load ' + url)
    return res.json()
  }

  async function loadItems () {
    const cfg = GAME_CONFIG[currentGame]
    const list = $('itemList')
    list.innerHTML = ''
    items = []
    if (!cfg.itemsUrl) {
      $('itemSearch').placeholder = 'Enter present index in Advanced mode (hex)'
      return
    }
    try {
      items = await loadJson(cfg.itemsUrl)
      items.forEach(item => {
        const opt = document.createElement('option')
        opt.value = item.name + ' [' + item.id + ']'
        list.appendChild(opt)
      })
      if (items.length) $('itemSearch').value = items[0].name + ' [' + items[0].id + ']'
    } catch (err) {
      console.warn(err)
      $('itemSearch').placeholder = 'Could not load item list — use Advanced hex mode'
    }
  }

  async function loadVillagers () {
    try {
      const data = await loadJson(GAME_CONFIG.ac.villagersUrl)
      const vSel = $('villagerSelect')
      const sSel = $('specialVillagerSelect')
      vSel.innerHTML = ''
      sSel.innerHTML = ''
      data.villagers.forEach(v => {
        vSel.appendChild(new Option(v.name, v.name))
      })
      data.special.forEach(v => {
        sSel.appendChild(new Option(v.name, v.name))
      })
      villagers = data.villagers
      specialVillagers = data.special
    } catch (err) {
      console.warn('Villager database unavailable', err)
    }
  }

  function bindEvents () {
    document.querySelectorAll('.game-tab').forEach(btn => {
      btn.addEventListener('click', () => switchGame(btn.dataset.game))
    })
    document.querySelectorAll('.mode-tab').forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.dataset.mode))
    })

    $('codetype').addEventListener('change', onCodeTypeChanged)
    $('genButton').addEventListener('click', generatePassword)
    $('decodeButton').addEventListener('click', decodePassword)

    $('advancedToggle').addEventListener('change', e => {
      setVisible($('manualItemDiv'), e.target.checked)
      setVisible($('itemSearchDiv'), !e.target.checked)
    })

    $('specialToggle').addEventListener('change', e => {
      setVisible($('villagerSelect'), !e.target.checked)
      setVisible($('villagerHeader'), !e.target.checked)
      setVisible($('specialVillagerSelect'), e.target.checked)
      setVisible($('specialVillagerHeader'), e.target.checked)
    })

    const genCanvas = $('generatorCanvas')
    genCanvas.addEventListener('mousedown', function (e) {
      if (!selectedBuffer) return
      const ofs = getOffset(genCanvas)
      const cw = genCanvas.width / 16
      const ch = genCanvas.height / 16
      const char = Math.floor((e.pageX - ofs.left) / cw) + Math.floor((e.pageY - ofs.top) / ch) * 16
      addChar(char)
    })

    document.addEventListener('keydown', function (e) {
      if (!selectedBuffer || currentMode !== 'generate') return
      if (e.key === 'Tab') {
        e.preventDefault()
        const ids = GAME_CONFIG[currentGame].strings.map(s => s.id)
        const idx = ids.findIndex(id => stringCanvases[id] === selectedCanvas)
        selectCanvas(ids[(idx + 1) % ids.length])
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (selectedCharIdx > 0) selectedCharIdx--
        Object.keys(stringCanvases).forEach(function (id) {
          if (!id.endsWith('_mirror') && stringCanvases[id] === selectedCanvas) redrawCanvas(id)
        })
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (selectedCharIdx < selectedBuffer.length - 1) selectedCharIdx++
        Object.keys(stringCanvases).forEach(function (id) {
          if (!id.endsWith('_mirror') && stringCanvases[id] === selectedCanvas) redrawCanvas(id)
        })
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (selectedCharIdx > 0) selectedCharIdx--
        selectedBuffer[selectedCharIdx] = 0x20
        Object.keys(stringCanvases).forEach(function (id) {
          if (!id.endsWith('_mirror') && stringCanvases[id] === selectedCanvas) redrawCanvas(id)
        })
        return
      }
      if (e.key.length === 1 && currentGame === 'ac') {
        const code = character_map.indexOf(e.key)
        if (code !== -1) {
          e.preventDefault()
          addChar(code)
        }
      }
    })
  }

  async function init () {
    bindEvents()
    await loadVillagers()
    switchGame('ac')
    switchMode('generate')
    fontImg.onload = function () {
      Object.keys(stringBuffers).forEach(id => {
        if (!id.endsWith('_preview')) redrawCanvas(id)
      })
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
