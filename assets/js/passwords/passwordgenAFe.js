/* Doubutsu no Mori e+ password generator (ported from Animal-Forest-e-Password-Library) */

const AFE_CODE_TYPES = {
  Famicom: 0,
  NPC: 1,
  CardE: 2,
  Magazine: 3,
  User: 4,
  CardEMini: 5,
  NewNPC: 6,
  Monument: 7
}

const afe_code_types = [
  'Famicom',
  'NPC',
  'CardE',
  'Magazine',
  'User',
  'CardEMini',
  'NewNPC',
  'Monument'
]

const AFE_RSA_BITSAVE_IDX = 23

const AFE_PARAM_STRING_SIZE = 6
const AFE_PASSWORD_DATA_SIZE = 24
const AFE_PASSWORD_STRING_SIZE = 32
const AFE_PASSWORD_CHAR_BITS = 6

const afe_character_map = [
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

const afe_usable_to_fontnum_translation = [
  0x62, 0x4b, 0x7a, 0x35, 0x63, 0x71, 0x59, 0x5a, 0x4f, 0x64, 0x74, 0x36, 0x6e, 0x6c, 0x42, 0x79,
  0x6f, 0x38, 0x34, 0x4c, 0x6b, 0x25, 0x41, 0x51, 0x6d, 0x44, 0x50, 0x49, 0x37, 0x26, 0x52, 0x73,
  0x77, 0x55, 0x21, 0x72, 0x33, 0x45, 0x78, 0x4d, 0x43, 0x40, 0x65, 0x39, 0x67, 0x76, 0x56, 0x47,
  0x75, 0x4e, 0x69, 0x58, 0x57, 0x66, 0x54, 0x4a, 0x46, 0x53, 0x48, 0x70, 0x32, 0x61, 0x6a, 0x68
]

const afe_usable_to_fontnum_native = [
  0x0a, 0x1f, 0x1d, 0xf0, 0xf1, 0xf5, 0x0d, 0x05, 0xf2, 0x1e, 0xe7, 0x60, 0xeb, 0x11, 0x17, 0x04,
  0xed, 0x15, 0x23, 0xe9, 0xe8, 0xef, 0x16, 0x10, 0x09, 0xf4, 0xc2, 0x12, 0xf8, 0xc0, 0x0f, 0xc3,
  0xf7, 0x5b, 0x7b, 0x5e, 0x08, 0x00, 0x19, 0x02, 0xf9, 0x24, 0x1a, 0x0c, 0xec, 0x7c, 0x0e, 0xea,
  0x01, 0x13, 0x07, 0x7e, 0x18, 0xf3, 0x14, 0x1c, 0x5d, 0x03, 0xee, 0x1b, 0x0b, 0x7d, 0xc1, 0x06
]

const afe_key_idx = [22, 6]
const AFE_BITMIXKEY_IDX = 1

const afe_change_code_tbl = [
  0xf0, 0x83, 0xfd, 0x62, 0x93, 0x49, 0x0d, 0x3e, 0xe1, 0xa4, 0x2b, 0xaf, 0x3a, 0x25, 0xd0, 0x82,
  0x7f, 0x97, 0xd2, 0x03, 0xb2, 0x32, 0xb4, 0xe6, 0x09, 0x42, 0x57, 0x27, 0x60, 0xea, 0x76, 0xab,
  0x2d, 0x65, 0xa8, 0x4d, 0x8b, 0x95, 0x01, 0x37, 0x59, 0x79, 0x33, 0xac, 0x2f, 0xae, 0x9f, 0xfe,
  0x56, 0xd9, 0x04, 0xc6, 0xb9, 0x28, 0x06, 0x5c, 0x54, 0x8d, 0xe5, 0x00, 0xb3, 0x7b, 0x5e, 0xa7,
  0x3c, 0x78, 0xcb, 0x2e, 0x6d, 0xe4, 0xe8, 0xdc, 0x40, 0xa0, 0xde, 0x2c, 0xf5, 0x1f, 0xcc, 0x85,
  0x71, 0x3d, 0x26, 0x74, 0x9c, 0x13, 0x7d, 0x7e, 0x66, 0xf2, 0x9e, 0x02, 0xa1, 0x53, 0x15, 0x4f,
  0x51, 0x20, 0xd5, 0x39, 0x1a, 0x67, 0x99, 0x41, 0xc7, 0xc3, 0xa6, 0xc4, 0xbc, 0x38, 0x8c, 0xaa,
  0x81, 0x12, 0xdd, 0x17, 0xb7, 0xef, 0x2a, 0x80, 0x9d, 0x50, 0xdf, 0xcf, 0x89, 0xc8, 0x91, 0x1b,
  0xbb, 0x73, 0xf8, 0x14, 0x61, 0xc2, 0x45, 0xc5, 0x55, 0xfc, 0x8e, 0xe9, 0x8a, 0x46, 0xdb, 0x4e,
  0x05, 0xc1, 0x64, 0xd1, 0xe0, 0x70, 0x16, 0xf9, 0xb6, 0x36, 0x44, 0x8f, 0x0c, 0x29, 0xd3, 0x0e,
  0x6f, 0x7c, 0xd7, 0x4a, 0xff, 0x75, 0x6c, 0x11, 0x10, 0x77, 0x3b, 0x98, 0xba, 0x69, 0x5b, 0xa3,
  0x6a, 0x72, 0x94, 0xd6, 0xd4, 0x22, 0x08, 0x86, 0x31, 0x47, 0xbe, 0x87, 0x63, 0x34, 0x52, 0x3f,
  0x68, 0xf6, 0x0f, 0xbf, 0xeb, 0xc0, 0xce, 0x24, 0xa5, 0x9a, 0x90, 0xed, 0x19, 0xb8, 0xb5, 0x96,
  0xfa, 0x88, 0x6e, 0xfb, 0x84, 0x23, 0x5d, 0xcd, 0xee, 0x92, 0x58, 0x4c, 0x0b, 0xf7, 0x0a, 0xb1,
  0xda, 0x35, 0x5f, 0x9b, 0xc9, 0xa9, 0xe7, 0x07, 0x1d, 0x18, 0xf3, 0xe3, 0xf1, 0xf4, 0xca, 0xb0,
  0x6b, 0x30, 0xec, 0x4b, 0x48, 0x1c, 0xad, 0xe2, 0x21, 0x1e, 0xa2, 0xbd, 0x5a, 0xd8, 0x43, 0x7a
]

const afe_prime_numbers = [
  0x011, 0x013, 0x017, 0x01d, 0x01f, 0x025, 0x029, 0x02b, 0x02f, 0x035, 0x03b, 0x03d, 0x043, 0x047, 0x049, 0x04f,
  0x053, 0x059, 0x061, 0x065, 0x067, 0x06b, 0x06d, 0x071, 0x07f, 0x083, 0x089, 0x08b, 0x095, 0x097, 0x09d, 0x0a3,
  0x0a7, 0x0ad, 0x0b3, 0x0b5, 0x0bf, 0x0c1, 0x0c5, 0x0c7, 0x0d3, 0x0df, 0x0e3, 0x0e5, 0x0e9, 0x0ef, 0x0f1, 0x0fb,
  0x101, 0x107, 0x10d, 0x10f, 0x115, 0x119, 0x11b, 0x125, 0x133, 0x137, 0x139, 0x13d, 0x14b, 0x151, 0x15b, 0x15d,
  0x161, 0x167, 0x16f, 0x175, 0x17b, 0x17f, 0x185, 0x18d, 0x191, 0x199, 0x1a3, 0x1a5, 0x1af, 0x1b1, 0x1b7, 0x1bb,
  0x1c1, 0x1c9, 0x1cd, 0x1cf, 0x1d3, 0x1df, 0x1e7, 0x1eb, 0x1f3, 0x1f7, 0x1fd, 0x209, 0x20b, 0x21d, 0x223, 0x22d,
  0x233, 0x239, 0x23b, 0x241, 0x24b, 0x251, 0x257, 0x259, 0x25f, 0x265, 0x269, 0x26b, 0x277, 0x281, 0x283, 0x287,
  0x28d, 0x293, 0x295, 0x2a1, 0x2a5, 0x2ab, 0x2b3, 0x2bd, 0x2c5, 0x2cf, 0x2d7, 0x2dd, 0x2e3, 0x2e7, 0x2ef, 0x2f5,
  0x2f9, 0x301, 0x305, 0x313, 0x31d, 0x329, 0x32b, 0x335, 0x337, 0x33b, 0x33d, 0x347, 0x355, 0x359, 0x35b, 0x35f,
  0x36d, 0x371, 0x373, 0x377, 0x38b, 0x38f, 0x397, 0x3a1, 0x3a9, 0x3ad, 0x3b3, 0x3b9, 0x3c7, 0x3cb, 0x3d1, 0x3d7,
  0x3df, 0x3e5, 0x3f1, 0x3f5, 0x3fb, 0x3fd, 0x407, 0x409, 0x40f, 0x419, 0x41b, 0x425, 0x427, 0x42d, 0x43f, 0x443,
  0x445, 0x449, 0x44f, 0x455, 0x45d, 0x463, 0x469, 0x47f, 0x481, 0x48b, 0x493, 0x49d, 0x4a3, 0x4a9, 0x4b1, 0x4bd,
  0x4c1, 0x4c7, 0x4cd, 0x4cf, 0x4d5, 0x4e1, 0x4eb, 0x4fd, 0x4ff, 0x503, 0x509, 0x50b, 0x511, 0x515, 0x517, 0x51b,
  0x527, 0x529, 0x52f, 0x551, 0x557, 0x55d, 0x565, 0x577, 0x581, 0x58f, 0x593, 0x595, 0x599, 0x59f, 0x5a7, 0x5ab,
  0x5ad, 0x5b3, 0x5bf, 0x5c9, 0x5cb, 0x5cf, 0x5d1, 0x5d5, 0x5db, 0x5e7, 0x5f3, 0x5fb, 0x607, 0x60d, 0x611, 0x617,
  0x61f, 0x623, 0x62b, 0x62f, 0x63d, 0x641, 0x647, 0x649, 0x64d, 0x653, 0x655, 0x65b, 0x665, 0x679, 0x67f, 0x683
]

const afe_transposition_cipher_char0_table = [
  'NiiMasaru', 'KomatsuKunihiro', 'TakakiGentarou', 'MiyakeHiromichi',
  'HayakawaKenzo', 'KasamatsuShigehiro', 'SumiyoshiNobuhiro', 'NomaTakafumi',
  'EguchiKatsuya', 'NogamiHisashi', 'IidaToki', 'IkegawaNoriko',
  'KawaseTomohiro', 'BandoTaro', 'TotakaKazuo', 'WatanabeKunio'
]

const afe_transposition_cipher_char1_table = [
  'RichAmtower', 'KyleHudson', 'MichaelKelbaugh', 'RaycholeLAneff',
  'LeslieSwan', 'YoshinobuMantani', 'KirkBuchanan', 'TimOLeary',
  'BillTrinen', 'nAkAyOsInoNyuuSankin', 'zendamaKINAKUDAMAkin', 'OishikutetUYOKUNARU',
  'AsetoAminofen', 'fcSFCn64GCgbCGBagbVB', 'YossyIsland', 'KedamonoNoMori'
]

const afe_transposition_cipher_char_table = [
  afe_transposition_cipher_char0_table,
  afe_transposition_cipher_char1_table
]

const afe_select_idx_table = [
  [0x11, 0x0b, 0x00, 0x14, 0x0e, 0x06, 0x08, 0x04],
  [0x05, 0x08, 0x0b, 0x10, 0x04, 0x06, 0x09, 0x13],
  [0x09, 0x0e, 0x11, 0x15, 0x0b, 0x0a, 0x13, 0x02],
  [0x00, 0x02, 0x01, 0x04, 0x12, 0x0a, 0x0b, 0x08],
  [0x11, 0x13, 0x10, 0x14, 0x0e, 0x08, 0x02, 0x09],
  [0x10, 0x02, 0x01, 0x08, 0x12, 0x04, 0x07, 0x06],
  [0x13, 0x06, 0x0a, 0x11, 0x01, 0x10, 0x08, 0x09],
  [0x11, 0x07, 0x12, 0x10, 0x0f, 0x02, 0x0b, 0x00],
  [0x06, 0x02, 0x0b, 0x01, 0x08, 0x0e, 0x00, 0x10],
  [0x13, 0x10, 0x0b, 0x08, 0x11, 0x02, 0x06, 0x0e],
  [0x12, 0x0f, 0x02, 0x07, 0x0a, 0x0b, 0x01, 0x0e],
  [0x08, 0x00, 0x0e, 0x02, 0x14, 0x0b, 0x0f, 0x11],
  [0x09, 0x01, 0x02, 0x00, 0x13, 0x08, 0x0e, 0x0a],
  [0x0a, 0x0b, 0x0e, 0x10, 0x13, 0x07, 0x11, 0x08],
  [0x13, 0x08, 0x06, 0x01, 0x11, 0x09, 0x0e, 0x0a],
  [0x09, 0x07, 0x11, 0x0e, 0x13, 0x0a, 0x01, 0x0b]
]

function afeBytesFromBuffer (buf, length) {
  const out = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    out[i] = i < buf.length ? buf[i] & 0xff : 0x20
  }
  return out
}

function afeTranspositionCipher (data, negate, keyType) {
  const sign = negate ? -1 : 1
  const cipher = afe_transposition_cipher_char_table[keyType][data[afe_key_idx[keyType]] & 0xf]
  let cipherPos = 0
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    if (i === afe_key_idx[keyType]) continue
    data[i] = (data[i] + cipher.charCodeAt(cipherPos % cipher.length) * sign) & 0xff
    cipherPos++
  }
}

function afeBitReverse (data) {
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    if (i !== AFE_BITMIXKEY_IDX) data[i] ^= 0xff
  }
}

function afeBitArrangeReverse (data) {
  const readData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  const modifiedData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    if (i < AFE_BITMIXKEY_IDX) readData[i] = data[i]
    else if (i > AFE_BITMIXKEY_IDX) readData[i - 1] = data[i]
  }
  let outIdx = 0
  for (let i = 22; i > -1; i--, outIdx++) {
    for (let b = 7; b > -1; b--) {
      modifiedData[outIdx] |= ((readData[i] >> b) & 1) << (7 - b)
    }
  }
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    if (i < AFE_BITMIXKEY_IDX) data[i] = modifiedData[i]
    else if (i > AFE_BITMIXKEY_IDX) data[i] = modifiedData[i - 1]
  }
}

function afeBitShift (data, shift) {
  const readData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  const modifiedData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    if (i < AFE_BITMIXKEY_IDX) readData[i] = data[i]
    else if (i > AFE_BITMIXKEY_IDX) readData[i - 1] = data[i]
  }
  if (shift > 0) {
    const dstPos = Math.floor(shift / 8)
    const dstOfs = shift % 8
    for (let i = 0; i < modifiedData.length; i++) {
      const dst = (i + dstPos) % modifiedData.length
      const src = (i + (readData.length - 1)) % readData.length
      modifiedData[dst] = ((readData[i] << dstOfs) | (readData[src] >> (8 - dstOfs))) & 0xff
    }
    for (let i = 0; i < data.length; i++) {
      if (i < AFE_BITMIXKEY_IDX) data[i] = modifiedData[i]
      else if (i > AFE_BITMIXKEY_IDX) data[i] = modifiedData[i - 1]
    }
  } else if (shift < 0) {
    for (let i = 0; i < modifiedData.length; i++) {
      modifiedData[i] = readData[(modifiedData.length - 1) - i]
    }
    shift = -shift
    const dstPos = Math.floor(shift / 8)
    const dstOfs = shift % 8
    for (let i = 0; i < modifiedData.length; i++) {
      readData[(i + dstPos) % modifiedData.length] = modifiedData[i]
    }
    for (let i = 0; i < modifiedData.length; i++) {
      const src = (i + (readData.length - 1)) % readData.length
      modifiedData[i] = ((readData[i] >> dstOfs) | (readData[src] << (8 - dstOfs))) & 0xff
    }
    let w = 0
    for (let i = 0; i < data.length; i++) {
      if (i === AFE_BITMIXKEY_IDX) w++
      data[w++] = modifiedData[(readData.length - 1) - i]
    }
  }
}

function afeGetRSAKeyCode (data) {
  let key0 = data[3] & 3
  let key1 = (data[3] >> 2) & 3
  if (key0 === 3) {
    key0 = (key0 ^ key1) & 3
    if (key0 === 3) key0 = 0
  }
  if (key1 === 3) {
    key1 = (key0 + 1) & 3
    if (key1 === 3) key1 = 1
  }
  if (key0 === key1) {
    key1 = (key0 + 1) & 3
    if (key1 === 3) key1 = 1
  }
  return {
    p: afe_prime_numbers[key0],
    q: afe_prime_numbers[key1],
    e: afe_prime_numbers[data[0x0c]],
    select_tbl: afe_select_idx_table[((data[3] >> 2) & 0x3c) >> 2]
  }
}

function MakePasscodeAFe (
  codeType,
  hitRateIdx,
  recipientTown,
  recipient,
  sender,
  itemId,
  extraData
) {
  const data = new Uint8Array(AFE_PASSWORD_DATA_SIZE)
  let realHitRateIdx
  let npcCode = 0

  switch (codeType) {
    case AFE_CODE_TYPES.Famicom:
    case AFE_CODE_TYPES.User:
    case AFE_CODE_TYPES.CardEMini:
      realHitRateIdx = 4
      extraData = 0
      npcCode = 0xff
      break
    case AFE_CODE_TYPES.NPC:
    case AFE_CODE_TYPES.NewNPC:
      extraData &= 3
      realHitRateIdx = 4
      break
    case AFE_CODE_TYPES.Magazine:
      realHitRateIdx = hitRateIdx & 7
      extraData = 0
      npcCode = 0xff
      break
    case AFE_CODE_TYPES.Monument:
      extraData &= 0xff
      realHitRateIdx = 4
      npcCode = 0xff
      break
    default:
      realHitRateIdx = 4
      codeType = AFE_CODE_TYPES.User
      break
  }

  data[0] = ((codeType << 5) & 0xe0) | (realHitRateIdx << 2)
  data[1] = extraData & 0xff
  data[2] = npcCode & 0xff

  for (let i = 0; i < AFE_PARAM_STRING_SIZE; i++) {
    data[3 + i] = recipientTown[i]
    data[9 + i] = recipient[i]
    data[15 + i] = sender[i]
  }

  data[0x15] = (itemId >> 8) & 0xff
  data[0x16] = itemId & 0xff

  let checksum = 0
  for (let i = 0; i < AFE_PARAM_STRING_SIZE; i++) checksum += data[3 + i]
  for (let i = 0; i < AFE_PARAM_STRING_SIZE; i++) checksum += data[9 + i]
  for (let i = 0; i < AFE_PARAM_STRING_SIZE; i++) checksum += data[15 + i]
  checksum += itemId
  checksum += npcCode
  data[0] |= (checksum >> 2) & 3
  data[1] |= (checksum & 3) << 6

  return data
}

function afeEncodeSubstitutionCipher (data) {
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    data[i] = afe_change_code_tbl[data[i]]
  }
}

function afeEncodeBitShuffle (data, key) {
  const charOffset = key === 0 ? 0xd : 9
  const charCount = key === 0 ? 0x16 : 0x17
  const readData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  const output = new Uint8Array(charCount)
  for (let i = 0, idx = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    if (i !== charOffset) readData[idx++] = data[i]
  }
  const indexTable = afe_select_idx_table[data[charOffset] & 3]
  for (let i = 0; i < charCount; i++) {
    const selectedByte = readData[i]
    for (let x = 0; x < 8; x++) {
      let outputOffset = indexTable[x] + i
      if (outputOffset >= charCount) outputOffset -= charCount
      output[outputOffset] |= ((selectedByte >> x) & 1) << x
    }
  }
  for (let i = 0; i < charOffset; i++) data[i] = output[i]
  for (let i = charOffset; i < charCount; i++) data[i + 1] = output[i]
}

function afeEncodeRSACipher (data) {
  const rsa = afeGetRSAKeyCode(data)
  const n = rsa.p * rsa.q
  let rsaBitsave = 0
  for (let i = 0; i < 8; i++) {
    let c = data[rsa.select_tbl[i]]
    const m = c
    for (let j = 0; j < rsa.e - 1; j++) c = (c * m) % n
    data[rsa.select_tbl[i]] = c & 0xff
    rsaBitsave |= ((c >> 8) & 1) << i
  }
  data[23] = rsaBitsave
}

function afeEncodeBitMixCode (data) {
  const switchType = data[1] & 0x0f
  if (switchType > 0x0c) {
    afeBitArrangeReverse(data)
    afeBitReverse(data)
    afeBitShift(data, switchType * 3)
  } else if (switchType > 0x08) {
    afeBitArrangeReverse(data)
    afeBitShift(data, switchType * -5)
  } else if (switchType > 0x04) {
    afeBitShift(data, switchType * -5)
    afeBitReverse(data)
  } else {
    afeBitShift(data, switchType * 3)
    afeBitArrangeReverse(data)
  }
}

function afeChange6BitsCode (data) {
  const password = new Uint8Array(AFE_PASSWORD_STRING_SIZE)
  let bit6Idx = 0
  let bit8Idx = 0
  let byte6Idx = 0
  let byte8Idx = 0
  let value = 0
  let total = 0
  while (true) {
    value |= ((data[byte8Idx] >> bit8Idx) & 1) << bit6Idx
    bit8Idx++
    bit6Idx++
    if (bit6Idx === 6) {
      password[byte6Idx] = value & 0xff
      value = 0
      bit6Idx = 0
      byte6Idx++
      total++
      if (total === 32) return password
    }
    if (bit8Idx === 8) {
      bit8Idx = 0
      byte8Idx++
    }
  }
}

function afeChangeCommonFontCode (password, englishPasswords) {
  const tbl = englishPasswords
    ? afe_usable_to_fontnum_translation
    : afe_usable_to_fontnum_native
  for (let i = 0; i < AFE_PASSWORD_STRING_SIZE; i++) {
    password[i] = tbl[password[i]]
  }
  return password
}

function MakePasswordAFe (
  codeType,
  hitRateIdx,
  recipientTown,
  recipient,
  sender,
  itemId,
  extraData,
  englishPasswords
) {
  const data = MakePasscodeAFe(
    codeType,
    hitRateIdx,
    afeBytesFromBuffer(recipientTown, AFE_PARAM_STRING_SIZE),
    afeBytesFromBuffer(recipient, AFE_PARAM_STRING_SIZE),
    afeBytesFromBuffer(sender, AFE_PARAM_STRING_SIZE),
    itemId,
    extraData
  )
  afeEncodeSubstitutionCipher(data)
  afeTranspositionCipher(data, true, 0)
  afeEncodeBitShuffle(data, 0)
  afeEncodeRSACipher(data)
  afeEncodeBitMixCode(data)
  afeEncodeBitShuffle(data, 1)
  afeTranspositionCipher(data, false, 1)
  return afeChangeCommonFontCode(afeChange6BitsCode(data), englishPasswords)
}

function ConvertBytesToUnicodeStringAFe (bytes) {
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    str += afe_character_map[bytes[i]]
  }
  return str
}

function afeChangePasswordFontCode (password, englishPasswords) {
  const tbl = englishPasswords
    ? afe_usable_to_fontnum_translation
    : afe_usable_to_fontnum_native
  for (let i = 0; i < AFE_PASSWORD_STRING_SIZE; i++) {
    let val = 0xff
    for (let j = 0; j < tbl.length; j++) {
      if (tbl[j] === password[i]) {
        val = j
        break
      }
    }
    if (val === 0xff) throw new Error('Invalid character in password!')
    password[i] = val
  }
}

function afeChange8BitsCode (password) {
  const stored = new Uint8Array(AFE_PASSWORD_DATA_SIZE)
  let passwordIndex = 0
  let storedIndex = 0
  let storedValue = 0
  let count = 0
  let shiftRight = 0
  let shiftLeft = 0

  while (true) {
    storedValue |= (((password[passwordIndex] >> shiftRight) & 1) << shiftLeft) & 0xff
    shiftRight++
    shiftLeft++
    if (shiftLeft > 7) {
      count++
      stored[storedIndex++] = storedValue & 0xff
      shiftLeft = 0
      if (count >= AFE_PASSWORD_DATA_SIZE) return stored
      storedValue = 0
    }
    if (shiftRight > 5) {
      shiftRight = 0
      passwordIndex++
    }
  }
}

function afeDecodeBitShuffle (data, keyIdx) {
  const count = keyIdx ? 0x17 : 0x16
  const bitIdx = keyIdx ? 0x09 : 0x0d
  const tableIndex = data[bitIdx]
  const shuffledData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  let srcIdx = 0

  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE - 1; i++) {
    if (i === bitIdx) srcIdx++
    shuffledData[i] = data[srcIdx++]
  }

  const zeroedData = new Uint8Array(AFE_PASSWORD_DATA_SIZE - 1)
  const shuffleTable = afe_select_idx_table[data[bitIdx] & 3]
  let offsetIdx = 0
  let zeroedDataIdx = 0

  while (offsetIdx < count) {
    let tablePos = 0
    let bit = 0
    for (let x = 0; x < 8; x++) {
      let outputOffset = shuffleTable[tablePos++] + offsetIdx
      if (outputOffset >= count) outputOffset -= count
      zeroedData[zeroedDataIdx] |= ((shuffledData[outputOffset] >> bit) & 1) << bit
      bit++
    }
    offsetIdx++
    zeroedDataIdx++
  }

  for (let i = 0; i < bitIdx; i++) data[i] = zeroedData[i]
  data[bitIdx] = tableIndex
  for (let i = bitIdx + 1; i < AFE_PASSWORD_DATA_SIZE; i++) {
    data[i] = zeroedData[i - 1]
  }
}

function afeDecodeBitMixCode (data) {
  const method = data[1] & 0x0f
  if (method > 12) {
    afeBitShift(data, method * -3)
    afeBitReverse(data)
    afeBitArrangeReverse(data)
  } else if (method > 8) {
    afeBitShift(data, method * 5)
    afeBitArrangeReverse(data)
  } else if (method > 4) {
    afeBitReverse(data)
    afeBitShift(data, method * 5)
  } else {
    afeBitArrangeReverse(data)
    afeBitShift(data, method * -3)
  }
}

function afeDecodeRSACipher (data) {
  const rsa = afeGetRSAKeyCode(data)
  const n = rsa.p * rsa.q
  const evenProduct = (rsa.p - 1) * (rsa.q - 1)
  let modCount = 0
  let d

  do {
    d = (++modCount * evenProduct + 1) / rsa.e
  } while ((modCount * evenProduct + 1) % rsa.e !== 0)

  for (let i = 0; i < 8; i++) {
    let cEnc = data[rsa.select_tbl[i]]
    cEnc |= ((data[AFE_RSA_BITSAVE_IDX] >> i) & 1) << 8
    const c = cEnc
    for (let j = 0; j < d - 1; j++) {
      cEnc = (cEnc * c) % n
    }
    data[rsa.select_tbl[i]] = cEnc & 0xff
  }
}

function afeDecodeSubstitutionCipher (data) {
  for (let i = 0; i < AFE_PASSWORD_DATA_SIZE; i++) {
    for (let j = 0; j < 256; j++) {
      if (data[i] === afe_change_code_tbl[j]) {
        data[i] = j
        break
      }
    }
  }
}

function afeGetPasswordChecksum (data) {
  let checksum = 0
  for (let i = 0x03; i < 0x15; i++) checksum += data[i]
  checksum += (data[0x15] << 8) | data[0x16]
  checksum += data[2]
  return (((checksum >> 2) & 3) << 2) | (((checksum << 6) & 0xc0) >> 6)
}

function CheckIsPasswordValidAFe (password) {
  if (!password.ChecksumValid) return false
  if (password.Type === AFE_CODE_TYPES.CardE || password.Type >= 8) return false
  return true
}

function GetPasswordDataAFe (data) {
  const codeType = (data[0] >> 5) & 7
  const storedChecksum = ((data[0] & 3) << 2) | ((data[1] & 0xc0) >> 6)
  const extraData = data[1] & 0x3f
  const npcCode = data[2]
  let string0 = ''
  let string1 = ''
  let string2 = ''

  for (let i = 0; i < AFE_PARAM_STRING_SIZE; i++) {
    string0 += afe_character_map[data[3 + i]]
    string1 += afe_character_map[data[9 + i]]
    string2 += afe_character_map[data[15 + i]]
  }

  const itemId = (data[21] << 8) | data[22]
  let hitRateIndex

  switch (codeType) {
    case AFE_CODE_TYPES.Famicom:
    case AFE_CODE_TYPES.NPC:
    case AFE_CODE_TYPES.Magazine:
    case AFE_CODE_TYPES.Monument:
      hitRateIndex = (data[0] >> 2) & 7
      break
    default:
      hitRateIndex = (data[0] >> 2) & 3
  }

  const password = {
    Type: codeType,
    ItemId: itemId,
    String0: string0,
    String1: string1,
    String2: string2,
    NPCCode: npcCode,
    ExtraData: extraData,
    HitRateIndex: hitRateIndex,
    Checksum: storedChecksum,
    CalculatedChecksum: afeGetPasswordChecksum(data),
    ChecksumValid: false,
    Valid: false
  }

  password.ChecksumValid = password.CalculatedChecksum === storedChecksum
  password.Valid = CheckIsPasswordValidAFe(password)
  return password
}

function DecodePasswordBytesAFe (passwordBytes, englishPasswords) {
  const input = new Uint8Array(passwordBytes)
  afeChangePasswordFontCode(input, englishPasswords)
  const data = afeChange8BitsCode(input)
  afeTranspositionCipher(data, true, 1)
  afeDecodeBitShuffle(data, true)
  afeDecodeBitMixCode(data)
  afeDecodeRSACipher(data)
  afeDecodeBitShuffle(data, false)
  afeTranspositionCipher(data, false, 0)
  afeDecodeSubstitutionCipher(data)
  return GetPasswordDataAFe(data)
}

function DecodePasswordAFe (passwordStr, englishPasswords) {
  if (passwordStr.length !== AFE_PASSWORD_STRING_SIZE) {
    throw new Error('Invalid password length!')
  }

  const bytes = new Uint8Array(AFE_PASSWORD_STRING_SIZE)
  for (let i = 0; i < passwordStr.length; i++) {
    const idx = afe_character_map.indexOf(passwordStr.charAt(i))
    if (idx < 0) throw new Error('Invalid character in password!')
    bytes[i] = idx
  }

  return DecodePasswordBytesAFe(bytes, englishPasswords)
}
