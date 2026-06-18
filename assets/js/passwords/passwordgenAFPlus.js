/* Doubutsu no Mori+ password generator (ported from ACPasswordLibrary.Core.DnMPlus) */

const AFPLUS_CODE_TYPES = {
  Famicom: 0,
  Popular: 1,
  CardE: 2,
  Magazine: 3
}

const afplus_code_types = ['Famicom', 'Popular', 'CardE', 'Magazine']

const AFPLUS_PRESENT_CPT_START = 0x5dc
const AFPLUS_PRESENT_CPT_COUNT = 0x40
const AFPLUS_PRESENT_WAL_START = 0x7d0
const AFPLUS_PRESENT_WAL_COUNT = 0x40
const AFPLUS_PRESENT_CLO_START = 0x9c4
const AFPLUS_PRESENT_CLO_COUNT = 0xff

const afplus_hit_rate_values = [
  0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80
]

const afplus_pswd_famicom_list = [
  0x36a, 0x36b, 0x36c, 0x36d, 0x36e, 0x36f, 0x370, 0x371,
  0x372, 0x373, 0x374, 0x375, 0x376, 0x377, 0x378, 0x379,
  0x37a, 0x37b, 0x37c
]

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

function afplusGetPresentItemNo (present) {
  if (present === 0xffff) return 0xffff
  if (present < AFPLUS_PRESENT_CPT_START) {
    return present < 0x400
      ? 0x1000 | (present << 2)
      : 0x3000 | ((present - 0x400) << 2)
  }
  if (present < AFPLUS_PRESENT_WAL_START) {
    return 0x2600 + (present - AFPLUS_PRESENT_CPT_START)
  }
  if (present < AFPLUS_PRESENT_CLO_START) {
    return 0x2700 + (present - AFPLUS_PRESENT_WAL_START)
  }
  return 0x2400 + (present - AFPLUS_PRESENT_CLO_START)
}

function afplusCheckHPMailPresentList (presentIdx) {
  if (presentIdx === 0xffff) return true
  if (presentIdx < AFPLUS_PRESENT_CPT_START) return true
  if (presentIdx - AFPLUS_PRESENT_CPT_START < AFPLUS_PRESENT_CPT_COUNT) return true
  if (presentIdx - AFPLUS_PRESENT_WAL_START < AFPLUS_PRESENT_WAL_COUNT) return true
  const shirtIdx = presentIdx - AFPLUS_PRESENT_CLO_START
  return (shirtIdx < 18 || shirtIdx > 25) && shirtIdx < AFPLUS_PRESENT_CLO_COUNT
}

function afplusFamicomListIncludes (presentIdx) {
  return afplus_pswd_famicom_list.indexOf(presentIdx) !== -1
}

function afplusHitRateValuesIncludes (value) {
  return afplus_hit_rate_values.indexOf(value) !== -1
}

function afplusCalculateChecksumFromPassword (password) {
  let checksum = 0
  for (let i = 0; i < AFPLUS_STRING_SIZE; i++) {
    checksum += afplus_character_set.indexOf(password.String0.charAt(i))
    checksum += afplus_character_set.indexOf(password.String1.charAt(i))
  }
  checksum += password.PresentIndex

  if (
    password.Type === AFPLUS_CODE_TYPES.Popular ||
    password.Type === AFPLUS_CODE_TYPES.CardE
  ) {
    checksum += password.NPCCode + (password.SpecialNPC << 8)
  }

  if (password.Type === AFPLUS_CODE_TYPES.CardE) {
    checksum += password.HitRateIndex
  }

  checksum &= 0xffff
  return (checksum + (checksum >> 4) * -16) & 0xff
}

function CheckIsPasswordValidAFPlus (password) {
  if (password.ChecksumValid !== true) return false

  switch (password.Type) {
    case AFPLUS_CODE_TYPES.Famicom:
      return (
        password.HitRateIndex === 1 &&
        afplusFamicomListIncludes(password.PresentIndex)
      )
    case AFPLUS_CODE_TYPES.Popular:
    case AFPLUS_CODE_TYPES.CardE:
      return (
        ((password.SpecialNPC === 0 && password.NPCCode < 0xec) ||
          (password.SpecialNPC === 1 && password.NPCCode < 0x1e)) &&
        afplusCheckHPMailPresentList(password.PresentIndex)
      )
    case AFPLUS_CODE_TYPES.Magazine:
      return (
        afplusHitRateValuesIncludes(password.HitRateIndex) &&
        afplusCheckHPMailPresentList(password.PresentIndex)
      )
    default:
      return false
  }
}

function GetPasswordDataAFPlus (data) {
  const storedChecksum = data[16]
  let string0 = ''
  let string1 = ''

  for (let i = 0; i < AFPLUS_STRING_SIZE; i++) {
    string0 += afplus_character_set[data[2 + i]]
    string1 += afplus_character_set[data[8 + i]]
  }

  const presentIndex = (data[14] << 8) | data[15]
  const codeType = data[0] >> 6

  let hitRateIdx
  let specialNpc
  let npcCode

  switch (codeType) {
    case AFPLUS_CODE_TYPES.Famicom:
    case AFPLUS_CODE_TYPES.Magazine:
      hitRateIdx = data[0] & 0x3f
      specialNpc = 0xff
      npcCode = 0xff
      break
    case AFPLUS_CODE_TYPES.Popular:
      hitRateIdx = 1
      specialNpc = data[0] & 1
      npcCode = data[1]
      break
    case AFPLUS_CODE_TYPES.CardE:
      hitRateIdx = (data[0] >> 1) & 3
      specialNpc = data[0] & 1
      npcCode = data[1]
      break
    default:
      hitRateIdx = 0
      specialNpc = 0
      npcCode = 0
  }

  const password = {
    Type: codeType,
    PresentIndex: presentIndex,
    PresentId: afplusGetPresentItemNo(presentIndex),
    String0: string0,
    String1: string1,
    Checksum: storedChecksum,
    HitRateIndex: hitRateIdx,
    SpecialNPC: specialNpc,
    NPCCode: npcCode,
    CalculatedChecksum: 0,
    ChecksumValid: false,
    Valid: false
  }

  password.CalculatedChecksum = afplusCalculateChecksumFromPassword(password)
  password.ChecksumValid = password.CalculatedChecksum === storedChecksum
  password.Valid = CheckIsPasswordValidAFPlus(password)

  return password
}

function DecodePasswordBytesAFPlus (data) {
  if (data.length !== AFPLUS_PASSWORD_DATA_SIZE) {
    throw new Error('Bad password data length!')
  }
  return GetPasswordDataAFPlus(data)
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

  return GetPasswordDataAFPlus(data)
}
