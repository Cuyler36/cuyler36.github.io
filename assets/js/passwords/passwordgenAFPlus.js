/* Doubutsu no Mori+ password generator (ported from ACPasswordLibrary.Core.DnMPlus) */

const AFPLUS_CODE_TYPES = {
  Famicom: 0,
  Popular: 1,
  CardE: 2,
  Magazine: 3
}

const AFPLUS_PASSWORD_STRING_SIZE = 22
const AFPLUS_PASSWORD_DATA_SIZE = 17
const AFPLUS_PASSWORD_BITS_COUNT = AFPLUS_PASSWORD_STRING_SIZE * 6
const AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS = (AFPLUS_PASSWORD_DATA_SIZE - 1) * 8
const AFPLUS_STRING_SIZE = 6

const afplus_character_set = [
  'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た',
  'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み',
  ' ', '!', '"', 'む', 'め', '%', '&', "'", '(', ')', '~', '♥', ', ', '-', '.', '♪',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', '🌢', '<', '+', '>', '?',
  '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'も', '💢', 'や', 'ゆ', '_',
  'よ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ら', 'り', 'る', 'れ', '�',
  '□', '。', '｢', '｣', '、', '･', 'ヲ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ッ',
  'ー', 'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ',
  'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ン', 'ヴ', '☺',
  'ろ', 'わ', 'を', 'ん', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ', 'っ', '\n', 'ガ', 'ギ',
  'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ',
  'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ', 'ポ', 'が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ',
  'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'
]

const afplus_usable_to_fontnum = [
  'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た',
  'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み',
  'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん', 'が', 'ぎ',
  'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'び', 'ぶ', 'べ'
]

function afplusShiftBits (bits, count, shiftAmount) {
  const temp = new Uint8Array(AFPLUS_PASSWORD_BITS_COUNT)
  let shiftPos = -shiftAmount
  for (let i = 0; i < count; i++) {
    if (shiftPos >= count) shiftPos = 0
    if (shiftPos < 0) shiftPos += count
    temp[i] = bits[shiftPos++]
  }
  bits.set(temp)
}

function afplusReverseBits (bits, count) {
  const temp = new Uint8Array(AFPLUS_PASSWORD_BITS_COUNT)
  for (let i = 0; i < count; i++) {
    temp[i] = bits[count - (i + 1)]
  }
  bits.set(temp)
}

function afplusFlipBits (bits, count) {
  const temp = new Uint8Array(AFPLUS_PASSWORD_BITS_COUNT)
  for (let i = 0; i < count; i++) {
    temp[i] = (~bits[i]) & 1
  }
  bits.set(temp)
}

function afplusCharToIndex (char) {
  const idx = afplus_character_set.indexOf(char)
  return idx === -1 ? 0x20 : idx
}

function afplusBytesFromBuffer (buf, length) {
  const out = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    out[i] = i < buf.length ? buf[i] & 0xff : 0x20
  }
  return out
}

function afplusCalculateChecksum (codeType, str0, str1, presentIndex, npcCode, npcType, hitRateIdx) {
  let checksum = 0
  for (let i = 0; i < AFPLUS_STRING_SIZE; i++) {
    checksum += str0[i]
    checksum += str1[i]
  }
  checksum += presentIndex
  if (codeType === AFPLUS_CODE_TYPES.Popular || codeType === AFPLUS_CODE_TYPES.CardE) {
    checksum += npcCode + (npcType << 8)
  }
  if (codeType === AFPLUS_CODE_TYPES.CardE) {
    checksum += hitRateIdx
  }
  checksum &= 0xffff
  return (checksum + (checksum >> 4) * -16) & 0xff
}

function MakePasscodeAFPlus (
  codeType,
  hitRateIdx,
  str0,
  str1,
  presentIndex,
  npcType,
  npcCode
) {
  const data = new Uint8Array(AFPLUS_PASSWORD_DATA_SIZE)
  npcCode &= 0xff
  presentIndex &= 0xffff

  switch (codeType) {
    case AFPLUS_CODE_TYPES.Famicom:
      hitRateIdx = 1
      npcCode = 0xff
      data[0] = (codeType << 6) | (hitRateIdx & 0x3f)
      break
    case AFPLUS_CODE_TYPES.Popular:
      hitRateIdx = 1
      data[0] = (codeType << 6) | (npcType & 1)
      data[1] = npcCode
      break
    case AFPLUS_CODE_TYPES.CardE:
      data[0] = (codeType << 6) | ((hitRateIdx & 3) << 1) | (npcType & 1)
      data[1] = npcCode
      break
    case AFPLUS_CODE_TYPES.Magazine:
      npcCode = 0xff
      data[0] = (codeType << 6) | (hitRateIdx & 0x3f)
      break
    default:
      throw new Error('Invalid code type!')
  }

  for (let i = 0; i < AFPLUS_STRING_SIZE; i++) {
    data[2 + i] = str0[i]
    data[8 + i] = str1[i]
  }

  data[14] = (presentIndex >> 8) & 0xff
  data[15] = presentIndex & 0xff
  data[16] = afplusCalculateChecksum(
    codeType,
    str0,
    str1,
    presentIndex,
    npcCode,
    npcType,
    hitRateIdx
  )

  return data
}

function EncodePasswordAFPlus (data) {
  if (data.length !== AFPLUS_PASSWORD_DATA_SIZE) {
    throw new Error('Bad password data length!')
  }

  const bits = new Uint8Array(AFPLUS_PASSWORD_BITS_COUNT)
  let pos = 0
  for (let i = 0; i < AFPLUS_PASSWORD_DATA_SIZE - 1; i++) {
    for (let x = 0; x < 8; x++) {
      bits[pos++] = (data[i] >> (7 - x)) & 1
    }
  }

  const code = data[16]
  if (code < 5) {
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * 3)
    afplusReverseBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
  } else if (code < 9) {
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * -5)
    afplusFlipBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
  } else if (code < 13) {
    afplusReverseBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * -5)
  } else {
    afplusReverseBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
    afplusFlipBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * 3)
  }

  bits[128] = (code >> 3) & 1
  bits[129] = (code >> 2) & 1
  bits[130] = (code >> 1) & 1
  bits[131] = code & 1

  afplusShiftBits(bits, AFPLUS_PASSWORD_BITS_COUNT, 15)

  const strData = new Uint8Array(AFPLUS_PASSWORD_STRING_SIZE)
  for (let i = 0; i < AFPLUS_PASSWORD_STRING_SIZE; i++) {
    for (let x = 0; x < 6; x++) {
      strData[i] |= bits[i * 6 + x] << (5 - x)
    }
  }

  const password = new Uint8Array(AFPLUS_PASSWORD_STRING_SIZE)
  for (let i = 0; i < AFPLUS_PASSWORD_STRING_SIZE; i++) {
    const glyph = afplus_usable_to_fontnum[strData[i]]
    password[i] = afplus_character_set.indexOf(glyph)
  }

  return password
}

function MakePasswordAFPlus (
  codeType,
  hitRateIdx,
  str0,
  str1,
  presentIndex,
  npcType,
  npcCode
) {
  const data = MakePasscodeAFPlus(
    codeType,
    hitRateIdx,
    afplusBytesFromBuffer(str0, AFPLUS_STRING_SIZE),
    afplusBytesFromBuffer(str1, AFPLUS_STRING_SIZE),
    presentIndex,
    npcType,
    npcCode
  )
  return EncodePasswordAFPlus(data)
}

function ConvertBytesToUnicodeStringAFPlus (bytes) {
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    str += afplus_character_set[bytes[i]]
  }
  return str
}

function DecodePasswordAFPlus (passwordStr) {
  if (passwordStr.length !== AFPLUS_PASSWORD_STRING_SIZE) {
    throw new Error('Invalid password length!')
  }

  const strData = new Uint8Array(AFPLUS_PASSWORD_STRING_SIZE)
  for (let i = 0; i < passwordStr.length; i++) {
    const c = passwordStr.charAt(i)
    let val = 0xff
    for (let f = 0; f < afplus_usable_to_fontnum.length; f++) {
      if (c === afplus_usable_to_fontnum[f]) {
        val = f
        break
      }
    }
    if (val === 0xff) throw new Error('Invalid character in password!')
    strData[i] = val
  }

  const bits = new Uint8Array(AFPLUS_PASSWORD_BITS_COUNT)
  for (let i = 0; i < AFPLUS_PASSWORD_STRING_SIZE; i++) {
    for (let x = 0; x < 6; x++) {
      bits[i * 6 + x] = (strData[i] >> (5 - x)) & 1
    }
  }

  afplusShiftBits(bits, AFPLUS_PASSWORD_BITS_COUNT, -15)

  const code =
    (bits[128] << 3) | (bits[129] << 2) | (bits[130] << 1) | bits[131]

  if (code < 5) {
    afplusReverseBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * -3)
  } else if (code < 9) {
    afplusFlipBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * 5)
  } else if (code < 13) {
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * 5)
    afplusReverseBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
  } else {
    afplusShiftBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS, code * -3)
    afplusFlipBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
    afplusReverseBits(bits, AFPLUS_PASSWORD_DATA_SCRAMBLE_BITS)
  }

  const data = new Uint8Array(AFPLUS_PASSWORD_DATA_SIZE)
  let pos = 0
  for (let i = 0; i < AFPLUS_PASSWORD_DATA_SIZE - 1; i++) {
    let b = 0
    for (let x = 0; x < 8; x++) {
      b |= bits[pos++] << (7 - x)
    }
    data[i] = b
  }
  data[16] = code

  const codeType = data[0] >> 6
  let str0 = ''
  let str1 = ''
  for (let i = 0; i < AFPLUS_STRING_SIZE; i++) {
    str0 += afplus_character_set[data[2 + i]]
    str1 += afplus_character_set[data[8 + i]]
  }

  return {
    Type: codeType,
    PresentIndex: (data[14] << 8) | data[15],
    String0: str0,
    String1: str1,
    Checksum: data[16],
    NPCCode: data[1],
    HitRateIndex: codeType === AFPLUS_CODE_TYPES.CardE ? (data[0] >> 1) & 3 : data[0] & 0x3f,
    SpecialNPC: (data[0] & 1) !== 0
  }
}
