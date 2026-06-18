/* 'Enum' of all code types */
const CODE_TYPES = {
  Famicom: 0,
  Popular: 1,
  CardE: 2,
  Magazine: 3,
  User: 4,
  CardEMini: 5
}

/* Embedded string size */
const PARAM_STRING_SIZE = 8

/* Number of bits in each password string character */
const PASSWORD_CHAR_BITS = 6

/* Number of bits in the password data bytes */
const PASSWORD_DATA_BITS = 8

/* Number of bytes required to hold the password data structure */
const PASSWORD_DATA_SIZE = 21

/* Password string length. Works out to 28 characters */
const PASSWORD_STR_SIZE = Math.floor(
  (PASSWORD_DATA_SIZE * PASSWORD_DATA_BITS) / PASSWORD_CHAR_BITS
)

/* Index of byte used for code scrambling */
const PASSWORD_BITMIXKEY_IDX = 1

/* Index of byte used to get the first two RSA prime numbers */
const PASSWORD_RSA_KEY01_IDX = 15

/* Index of the byte used as the exponent (e) in RSA cipher */
const PASSWORD_RSA_EXPONENT_IDX = 5

/* Index of the byte which saves the RSA cipher texture values' 9th bits */
const PASSWORD_RSA_BITSAVE_IDX = 20

// prettier-ignore
const character_map = [
    "¡", "¿", "Ä", "À", "Á", "Â", "Ã", "Å", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î",
    "Ï", "Ð", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "Ø", "Ù", "Ú", "Û", "Ü", "ß", "Þ", "à",
    " ", "!", "\"", "á", "â", "%", "&", "'", "(", ")", "~", "♥", ",", "-", ".", "♪",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", "🌢", "<", "=", ">", "?",
    "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "ã", "💢", "ä", "å", "_",
    "ç", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
    "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "è", "é", "ê", "ë", "□",
    "\x80", "ì", "í", "î", "ï", "•", "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "⁰", "ù", "ú",
    "–", "û", "ü", "ý", "ÿ", "þ", "Ý", "¦", "§", "a̱", "o̱", "‖", "µ", "³", "²", "¹",
    "¯", "¬", "Æ", "æ", "„", "»", "«", "☀", "☁", "☂", "🌬", "☃", "∋", "∈", "/", "∞",
    "○", "🗙", "□", "△", "+", "⚡", "♂", "♀", "🍀", "★", "💀", "😮", "😄", "😣", "😠", "😃",
    "×", "÷", "🔨", "🎀", "✉", "💰", "🐾", "🐶", "🐱", "🐰", "🐦", "🐮", "🐷", "\n", "🐟", "🐞",
    ";", "#", "", "", "⚷", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
];

const code_types = [
  'Famicom',
  'Popular',
  'CardE',
  'Magazine',
  'User',
  'CardEMini'
]

// prettier-ignore
const usable2fontnum = [
    0x62, 0x4b, 0x7a, 0x35, 0x63, 0x71, 0x59, 0x5a, 0x4f, 0x64, 0x74, 0x36, 0x6e, 0x6c, 0x42, 0x79,
    0x6f, 0x38, 0x34, 0x4c, 0x6b, 0x25, 0x41, 0x51, 0x6d, 0x44, 0x50, 0x49, 0x37, 0x26, 0x52, 0x73,
    0x77, 0x55, 0xd1, 0x72, 0x33, 0x45, 0x78, 0x4d, 0x43, 0x40, 0x65, 0x39, 0x67, 0x76, 0x56, 0x47,
    0x75, 0x4e, 0x69, 0x58, 0x57, 0x66, 0x54, 0x4a, 0x46, 0x53, 0x48, 0x70, 0x32, 0x61, 0x6a, 0x68
];

// prettier-ignore
const change_code_tbl = [
	0xF0, 0x83, 0xFD, 0x62, 0x93, 0x49, 0x0D, 0x3E, 0xE1, 0xA4, 0x2B, 0xAF, 0x3A, 0x25, 0xD0, 0x82,
	0x7F, 0x97, 0xD2, 0x03, 0xB2, 0x32, 0xB4, 0xE6, 0x09, 0x42, 0x57, 0x27, 0x60, 0xEA, 0x76, 0xAB,
	0x2D, 0x65, 0xA8, 0x4D, 0x8B, 0x95, 0x01, 0x37, 0x59, 0x79, 0x33, 0xAC, 0x2F, 0xAE, 0x9F, 0xFE,
	0x56, 0xD9, 0x04, 0xC6, 0xB9, 0x28, 0x06, 0x5C, 0x54, 0x8D, 0xE5, 0x00, 0xB3, 0x7B, 0x5E, 0xA7,
	0x3C, 0x78, 0xCB, 0x2E, 0x6D, 0xE4, 0xE8, 0xDC, 0x40, 0xA0, 0xDE, 0x2C, 0xF5, 0x1F, 0xCC, 0x85,
	0x71, 0x3D, 0x26, 0x74, 0x9C, 0x13, 0x7D, 0x7E, 0x66, 0xF2, 0x9E, 0x02, 0xA1, 0x53, 0x15, 0x4F,
	0x51, 0x20, 0xD5, 0x39, 0x1A, 0x67, 0x99, 0x41, 0xC7, 0xC3, 0xA6, 0xC4, 0xBC, 0x38, 0x8C, 0xAA,
	0x81, 0x12, 0xDD, 0x17, 0xB7, 0xEF, 0x2A, 0x80, 0x9D, 0x50, 0xDF, 0xCF, 0x89, 0xC8, 0x91, 0x1B,
	0xBB, 0x73, 0xF8, 0x14, 0x61, 0xC2, 0x45, 0xC5, 0x55, 0xFC, 0x8E, 0xE9, 0x8A, 0x46, 0xDB, 0x4E,
	0x05, 0xC1, 0x64, 0xD1, 0xE0, 0x70, 0x16, 0xF9, 0xB6, 0x36, 0x44, 0x8F, 0x0C, 0x29, 0xD3, 0x0E,
	0x6F, 0x7C, 0xD7, 0x4A, 0xFF, 0x75, 0x6C, 0x11, 0x10, 0x77, 0x3B, 0x98, 0xBA, 0x69, 0x5B, 0xA3,
	0x6A, 0x72, 0x94, 0xD6, 0xD4, 0x22, 0x08, 0x86, 0x31, 0x47, 0xBE, 0x87, 0x63, 0x34, 0x52, 0x3F,
	0x68, 0xF6, 0x0F, 0xBF, 0xEB, 0xC0, 0xCE, 0x24, 0xA5, 0x9A, 0x90, 0xED, 0x19, 0xB8, 0xB5, 0x96,
	0xFA, 0x88, 0x6E, 0xFB, 0x84, 0x23, 0x5D, 0xCD, 0xEE, 0x92, 0x58, 0x4C, 0x0B, 0xF7, 0x0A, 0xB1,
	0xDA, 0x35, 0x5F, 0x9B, 0xC9, 0xA9, 0xE7, 0x07, 0x1D, 0x18, 0xF3, 0xE3, 0xF1, 0xF4, 0xCA, 0xB0,
	0x6B, 0x30, 0xEC, 0x4B, 0x48, 0x1C, 0xAD, 0xE2, 0x21, 0x1E, 0xA2, 0xBD, 0x5A, 0xD8, 0x43, 0x7A
];

// prettier-ignore
const prime_numbers = [
    0x011, 0x013, 0x017, 0x01D, 0x01F, 0x025, 0x029, 0x02B, 0x02F, 0x035, 0x03B, 0x03D, 0x043, 0x047, 0x049, 0x04F, 
    0x053, 0x059, 0x061, 0x065, 0x067, 0x06B, 0x06D, 0x071, 0x07F, 0x083, 0x089, 0x08B, 0x095, 0x097, 0x09D, 0x0A3, 
    0x0A7, 0x0AD, 0x0B3, 0x0B5, 0x0BF, 0x0C1, 0x0C5, 0x0C7, 0x0D3, 0x0DF, 0x0E3, 0x0E5, 0x0E9, 0x0EF, 0x0F1, 0x0FB, 
    0x101, 0x107, 0x10D, 0x10F, 0x115, 0x119, 0x11B, 0x125, 0x133, 0x137, 0x139, 0x13D, 0x14B, 0x151, 0x15B, 0x15D, 
    0x161, 0x167, 0x16F, 0x175, 0x17B, 0x17F, 0x185, 0x18D, 0x191, 0x199, 0x1A3, 0x1A5, 0x1AF, 0x1B1, 0x1B7, 0x1BB, 
    0x1C1, 0x1C9, 0x1CD, 0x1CF, 0x1D3, 0x1DF, 0x1E7, 0x1EB, 0x1F3, 0x1F7, 0x1FD, 0x209, 0x20B, 0x21D, 0x223, 0x22D, 
    0x233, 0x239, 0x23B, 0x241, 0x24B, 0x251, 0x257, 0x259, 0x25F, 0x265, 0x269, 0x26B, 0x277, 0x281, 0x283, 0x287, 
    0x28D, 0x293, 0x295, 0x2A1, 0x2A5, 0x2AB, 0x2B3, 0x2BD, 0x2C5, 0x2CF, 0x2D7, 0x2DD, 0x2E3, 0x2E7, 0x2EF, 0x2F5, 
    0x2F9, 0x301, 0x305, 0x313, 0x31D, 0x329, 0x32B, 0x335, 0x337, 0x33B, 0x33D, 0x347, 0x355, 0x359, 0x35B, 0x35F, 
    0x36D, 0x371, 0x373, 0x377, 0x38B, 0x38F, 0x397, 0x3A1, 0x3A9, 0x3AD, 0x3B3, 0x3B9, 0x3C7, 0x3CB, 0x3D1, 0x3D7, 
    0x3DF, 0x3E5, 0x3F1, 0x3F5, 0x3FB, 0x3FD, 0x407, 0x409, 0x40F, 0x419, 0x41B, 0x425, 0x427, 0x42D, 0x43F, 0x443, 
    0x445, 0x449, 0x44F, 0x455, 0x45D, 0x463, 0x469, 0x47F, 0x481, 0x48B, 0x493, 0x49D, 0x4A3, 0x4A9, 0x4B1, 0x4BD, 
    0x4C1, 0x4C7, 0x4CD, 0x4CF, 0x4D5, 0x4E1, 0x4EB, 0x4FD, 0x4FF, 0x503, 0x509, 0x50B, 0x511, 0x515, 0x517, 0x51B, 
    0x527, 0x529, 0x52F, 0x551, 0x557, 0x55D, 0x565, 0x577, 0x581, 0x58F, 0x593, 0x595, 0x599, 0x59F, 0x5A7, 0x5AB, 
    0x5AD, 0x5B3, 0x5BF, 0x5C9, 0x5CB, 0x5CF, 0x5D1, 0x5D5, 0x5DB, 0x5E7, 0x5F3, 0x5FB, 0x607, 0x60D, 0x611, 0x617, 
    0x61F, 0x623, 0x62B, 0x62F, 0x63D, 0x641, 0x647, 0x649, 0x64D, 0x653, 0x655, 0x65B, 0x665, 0x679, 0x67F, 0x683
];

const key_idx = [18, 9]

const transposition_cipher_char0_table = [
  'NiiMasaru', // Animal Crossing programmer (worked on the original N64 title)
  'KomatsuKunihiro', // Animal Crossing programmer (AF, AF+, AC, AFe+)
  'TakakiGentarou', // Animal Crossing programmer
  'MiyakeHiromichi', // Animal Crossing programmer
  'HayakawaKenzo', // Animal Crossing programmer
  'KasamatsuShigehiro', // Animal Crossing programmer
  'SumiyoshiNobuhiro', // Animal Crossing programmer
  'NomaTakafumi', // Animal Crossing programmer
  'EguchiKatsuya', // Animal Crossing director
  'NogamiHisashi', // Animal Crossing director
  'IidaToki', // Animal Crossing screen designer
  'IkegawaNoriko', // Animal Crossing character design
  'KawaseTomohiro', // Animal Crossing NES/Famicom emulator programmer
  'BandoTaro', // Animal Crossing Sound Effects programmer
  'TotakaKazuo', // Animal Crossing Sound Director (Kazumi Totaka)
  'WatanabeKunio' // Animal Crossing Script member (made text?)
]

const transposition_cipher_char1_table = [
  'RichAmtower', // Localization Manager @ Nintendo of America https://www.linkedin.com/in/rich-amtower-83222a1, https://nintendo.fandom.com/wiki/Rich_Amtower
  'KyleHudson', // Former Product Testing Manager @ Nintendo of America https://metroid.fandom.com/wiki/Kyle_Hudson
  'MichaelKelbaugh', // Debugger & Beta Tester @ Nintendo of America https://nintendo.fandom.com/wiki/Michael_Kelbaugh
  'RaycholeLAneff', // Raychole L'Anett - Director of Engineering Services @ Nintendo of America https://metroid.fandom.com/wiki/Raychole_L%27Anett
  'LeslieSwan', // Senior Editor @ Nintendo Power, VA, Nintendo of America localization manager @ Treehouse. https://www.mariowiki.com/Leslie_Swan
  'YoshinobuMantani', // Nintendo of America employee (QA, Debugger) https://www.imdb.com/name/nm1412191/
  'KirkBuchanan', // Senior Product Testing Manager @ Nintendo of America https://leadferret.com/directory/person/kirk-buchanan/16977208
  'TimOLeary', // Localization Manager & Translator @ Nintendo of America https://nintendo.fandom.com/wiki/Tim_O%27Leary
  'BillTrinen', // Senior Product Marketing Manager, Translator, & Interpreter @ Nintendo of America https://en.wikipedia.org/wiki/Bill_Trinen
  'nAkAyOsInoNyuuSankin', // Translates to "good bacteria" (善玉菌)
  'zendamaKINAKUDAMAkin', // Translates to "bad bacteria" (悪玉菌)
  'OishikutetUYOKUNARU', // Translates to "It's becoming really delicious." "It's becoming strongly delicious."
  'AsetoAminofen', // Translates to Acetaminophen. Like the drug.
  'fcSFCn64GCgbCGBagbVB', // fc = Famicom | SFC = Super Famicom | n64 = Nintendo 64 | GC = GameCube | gb = GameBoy | CGB = GameBoy Color | agb = GameBoy Advance | VB = Virtual Boy
  'YossyIsland', // Yoshi's Island. The game.
  'KedamonoNoMori' // Translates to "Animal Forest" or "Beast Forest"
]

const transposition_cipher_char_table = [
  transposition_cipher_char0_table,
  transposition_cipher_char1_table
]

/* Table used in RSA encoding & decoding. Each table holds the indexes of the bytes which are encrypted. */
// prettier-ignore
const select_idx_table = [
	[0x11, 0x0B, 0x00, 0x0A, 0x0C, 0x06, 0x08, 0x04],
	[0x03, 0x08, 0x0B, 0x10, 0x04, 0x06, 0x09, 0x13],
	[0x09, 0x0E, 0x11, 0x12, 0x0B, 0x0A, 0x0C, 0x02],
	[0x00, 0x02, 0x01, 0x04, 0x12, 0x0A, 0x0C, 0x08],
	[0x11, 0x13, 0x10, 0x07, 0x0C, 0x08, 0x02, 0x09],
	[0x10, 0x03, 0x01, 0x08, 0x12, 0x04, 0x07, 0x06],
	[0x13, 0x06, 0x0A, 0x11, 0x03, 0x10, 0x08, 0x09],
	[0x11, 0x07, 0x12, 0x10, 0x0C, 0x02, 0x0B, 0x00],
	[0x06, 0x02, 0x0C, 0x01, 0x08, 0x0E, 0x00, 0x10],
	[0x13, 0x10, 0x0B, 0x08, 0x11, 0x03, 0x06, 0x0E],
	[0x12, 0x0C, 0x02, 0x07, 0x0A, 0x0B, 0x01, 0x0E],
	[0x08, 0x00, 0x0E, 0x02, 0x07, 0x0B, 0x0C, 0x11],
	[0x09, 0x03, 0x02, 0x00, 0x0B, 0x08, 0x0E, 0x0A],
	[0x0A, 0x0B, 0x0C, 0x10, 0x13, 0x07, 0x11, 0x08],
	[0x13, 0x08, 0x06, 0x01, 0x11, 0x09, 0x0E, 0x0A],
	[0x09, 0x07, 0x11, 0x0C, 0x13, 0x0A, 0x01, 0x0B]
];

/************************************************************************************************
 * COMMON SECTION
 ***********************************************************************************************/

// Converts the 6-bit alpha-numeric passwords into 8-bit data bytes
function Change8BitsCode (password) {
  var data = new Uint8Array(PASSWORD_DATA_SIZE)

  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    let byte = 0
    for (var j = 0; j < PASSWORD_DATA_BITS; j++) {
      const idx = i * PASSWORD_DATA_BITS + j
      byte |=
        ((password[Math.floor(idx / PASSWORD_CHAR_BITS)] >>
          idx % PASSWORD_CHAR_BITS) &
          1) <<
        j
    }

    data[i] = byte
  }

  return data
}

/* Does a transposition cipher on the data with a key derived from a constant lookup table and a value embedded in the data itself. */
function TranspositionCipher (data, negate, key_type) {
  const sign = negate ? -1 : 1
  const cipher =
    transposition_cipher_char_table[key_type][data[key_idx[key_type]] & 0xf]
  var cipher_pos = 0

  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    /* Do not transpose the value at key_idx */
    if (i == key_idx[key_type]) {
      continue
    }

    data[i] =
      (data[i] + cipher.charCodeAt(cipher_pos % cipher.length) * sign) & 0xff
    cipher_pos++
  }

  return data
}

/* Inverts the bits for the password data */
function BitReverse (data) {
  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    if (i != PASSWORD_BITMIXKEY_IDX) {
      data[i] ^= 0xff
    }
  }

  return data
}

/* Reverses the bit order for bytes in password data */
function BitArrangeReverse (data) {
  const modified_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  const read_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    if (i < PASSWORD_BITMIXKEY_IDX) {
      read_data[i] = data[i]
    } else if (i > PASSWORD_BITMIXKEY_IDX) {
      read_data[i - 1] = data[i]
    }
  }

  var outIdx = 0
  for (var i = 19; i > -1; i--, outIdx++) {
    for (var b = 7; b > -1; b--) {
      modified_data[outIdx] |= ((read_data[i] >> b) & 1) << (7 - b)
    }
  }

  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    if (i < PASSWORD_BITMIXKEY_IDX) {
      data[i] = modified_data[i]
    } else if (i > PASSWORD_BITMIXKEY_IDX) {
      data[i] = modified_data[i - 1]
    }
  }

  return data
}

/* Shifts bits in data as a bit array. 'shift' can be positive or negative. */
function BitShift (data, shift) {
  var modified_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  const read_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    if (i < PASSWORD_BITMIXKEY_IDX) {
      read_data[i] = data[i]
    } else if (i > PASSWORD_BITMIXKEY_IDX) {
      read_data[i - 1] = data[i]
    }
  }

  if (shift > 0) {
    let dst_pos = Math.floor(shift / 8)
    let dst_ofs = shift % 8

    for (var i = 0; i < modified_data.length; i++) {
      const dst = (i + dst_pos) % modified_data.length
      const src = (i + (read_data.length - 1)) % read_data.length
      const rs = 8 - dst_ofs

      modified_data[dst] =
        ((read_data[i] << dst_ofs) | (read_data[src] >> rs)) & 0xff
    }

    for (var i = 0; i < data.length; i++) {
      if (i < PASSWORD_BITMIXKEY_IDX) {
        data[i] = modified_data[i]
      } else if (i > PASSWORD_BITMIXKEY_IDX) {
        data[i] = modified_data[i - 1]
      }
    }
  } else if (shift < 0) {
    for (var i = 0; i < modified_data.length; i++) {
      modified_data[i] = read_data[modified_data.length - 1 - i]
    }

    shift = -shift

    let dst_pos = Math.floor(shift / 8)
    let dst_ofs = shift % 8

    for (var i = 0; i < modified_data.length; i++) {
      read_data[(i + dst_pos) % modified_data.length] = modified_data[i]
    }

    for (var i = 0; i < modified_data.length; i++) {
      const src = (i + (read_data.length - 1)) % read_data.length
      modified_data[i] =
        ((read_data[i] >> dst_ofs) | (read_data[src] << (8 - dst_ofs))) & 0xff
    }

    var w = 0
    for (var i = 0; i < data.length; i++) {
      if (i == PASSWORD_BITMIXKEY_IDX) {
        w++
      }

      data[w++] = modified_data[read_data.length - 1 - i]
    }
  }

  return data
}

/* Gets the parameters needed for the RSA cipher */
function GetRSAKeyCode (data) {
  var key0 = data[PASSWORD_RSA_KEY01_IDX] & 3
  var key1 = (data[PASSWORD_RSA_KEY01_IDX] >> 2) & 3

  /* Ensure that key0 and key1 differ. */
  /* NOTE: key0 & key1 will always be two of the following: 17, 19, or 23. */

  if (key0 == 3) {
    key0 = (key0 ^ key1) & 3
    if (key0 == 3) {
      key0 = 0
    }
  }

  if (key1 == 3) {
    key1 = (key0 + 1) & 3
    if (key1 == 3) {
      key1 = 1
    }
  }

  if (key0 == key1) {
    key1 = (key0 + 1) & 3
    if (key1 == 3) {
      key1 = 1
    }
  }

  return {
    p: prime_numbers[key0],
    q: prime_numbers[key1],
    e: prime_numbers[data[PASSWORD_RSA_EXPONENT_IDX]],
    select_tbl: select_idx_table[(data[PASSWORD_RSA_KEY01_IDX] >> 4) & 0xf]
  }
}

function ASCII2ACBytes (str) {
  const data = new Uint8Array(PARAM_STRING_SIZE)
  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    if (str.length > i) {
      var idx = character_map.indexOf(str.charAt(i))
      data[i] = idx == -1 ? 0x20 : idx & 0xff
    } else {
      data[i] = 0x20
    }
  }

  return data
}

function Uint8Array2ACBytes (str) {
  const data = new Uint8Array(PARAM_STRING_SIZE)
  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    if (str.length > i) {
      data[i] = str[i] & 0xff
    } else {
      data[i] = 0x20
    }
  }

  return data
}

/************************************************************************************************
 * ENCODER SECTION
 ***********************************************************************************************/

/* Makes initial password binary data */
function MakePasscode (
  code_type,
  hit_rate_idx,
  str0,
  str1,
  item_id,
  npc_type,
  npc_code
) {
  const data = new Uint8Array(PASSWORD_DATA_SIZE)
  npc_code &= 0xff

  switch (code_type) {
    case CODE_TYPES.Famicom:
    case CODE_TYPES.User:
    case CODE_TYPES.CardEMini:
      hit_rate_idx = 1
      npc_code = 0xff
      break

    case CODE_TYPES.CardE:
      break

    case CODE_TYPES.Popular:
      hit_rate_idx = 4
      break

    case CODE_TYPES.Magazine:
      npc_type = (hit_rate_idx >> 2) & 1
      hit_rate_idx &= 3
      npc_code = 0xff
      break

    default:
      throw 'Invalid code type!'
  }

  data[0] = (code_type & 7) << 5
  data[0] |= hit_rate_idx << 1
  data[0] |= npc_type & 1

  data[1] = npc_code

  // Add the two embedded strings
  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    if (str0.length > i) {
      data[2 + i] = str0[i]
    } else {
      data[2 + i] = 0x20 // Space character
    }

    if (str1.length > i) {
      data[10 + i] = str1[i]
    } else {
      data[10 + i] = 0x20 // Space character
    }
  }

  // Add present
  data[18] = (item_id >> 8) & 0xff
  data[19] = item_id & 0xff

  // Calculate & add checksum
  var checksum = 0
  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    checksum += data[2 + i]
  }
  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    checksum += data[10 + i]
  }

  checksum += item_id
  checksum += npc_code
  data[0] |= (checksum & 3) << 3

  return data
}

/* Performs a simple substitution cipher on the data */
function EncodeSubstitutionCipher (data) {
  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    data[i] = change_code_tbl[data[i]]
  }

  return data
}

/* Encoder version of bit shuffle */
function EncodeBitShuffle (data, key) {
  const key_idx = key == 0 ? 13 : 2
  const count = key == 0 ? 19 : 20

  const read_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  const mod_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    if (i < key_idx) {
      read_data[i] = data[i]
    } else if (i > key_idx) {
      read_data[i - 1] = data[i]
    }
  }

  const select_tbl = select_idx_table[data[key_idx] & 3]
  for (var i = 0; i < count; i++) {
    var byte = read_data[i]
    for (var j = 0; j < 8; j++) {
      const output_ofs = (select_tbl[j] + i) % count
      mod_data[output_ofs] |= byte & (1 << j) // extract singular bit and insert it in correct position
    }
  }

  for (var i = 0; i < data.length; i++) {
    if (i < key_idx) {
      data[i] = mod_data[i]
    } else if (i > key_idx) {
      data[i] = mod_data[i - 1]
    }
  }

  return data
}

/* Encoder RSA cipher implementation */
function EncodeChangeRSACipher (data) {
  const rsa_data = GetRSAKeyCode(data)

  var rsa_bitsave = 0 /* Each bit represents the 9th bit in our ciphertext values */
  const n = rsa_data.p * rsa_data.q /* The multiple of our primes */
  const e = rsa_data.e /* Our exponent */
  const select_tbl =
    rsa_data.select_tbl /* Array of 8 byte indexes which we will apply the RSA encryption to */

  for (var i = 0; i < 8; i++) {
    var c = data[select_tbl[i]]
    const m = c

    /* Modular Exponentiation from [2, e] */
    for (var j = 0; j < e - 1; j++) {
      /* c will always be below one of the following: 17*19 (323), 17*23 (391), 19*23 (437)
       * In other words, c is in range [0, p*q). */
      c = (c * m) % n
    }

    data[select_tbl[i]] = c & 0xff
    rsa_bitsave |= ((c >> 8) & 1) << i // Save the 9th bit in case ciphertext went over 255.
  }

  data[PASSWORD_RSA_BITSAVE_IDX] = rsa_bitsave
  return data
}

/* Branching logic to mix up bit scrambling of password data */
function EncodeBitMixCode (data) {
  const code = data[PASSWORD_BITMIXKEY_IDX] & 0xf
  if (code < 13) {
    if (code < 9) {
      if (code < 5) {
        BitShift(data, code * 3)
        BitArrangeReverse(data)
      } else {
        BitShift(data, code * -5)
        BitReverse(data)
      }
    } else {
      BitArrangeReverse(data)
      BitShift(data, code * -5)
    }
  } else {
    BitArrangeReverse(data)
    BitReverse(data)
    BitShift(data, code * 3)
  }

  return data
}

/* Converts 8 bit encoded password data to 6 bit encoded password string data */
function Change6BitsCode (data) {
  const password_data = new Uint8Array(PASSWORD_STR_SIZE)

  var code = 0
  for (var i = 0; i < PASSWORD_STR_SIZE * PASSWORD_CHAR_BITS; i++) {
    code |=
      ((data[Math.floor(i / PASSWORD_DATA_BITS)] >> i % PASSWORD_DATA_BITS) &
        1) <<
      i % PASSWORD_CHAR_BITS

    if (i % PASSWORD_CHAR_BITS == PASSWORD_CHAR_BITS - 1) {
      password_data[Math.floor(i / PASSWORD_CHAR_BITS)] = code & 0xff
      code = 0
    }
  }

  return password_data
}

/* Converts password data to password string */
function ChangeCommonFontCode (password_data) {
  var password = ''
  for (var i = 0; i < PASSWORD_STR_SIZE; i++) {
    password += character_map[usable2fontnum[password_data[i]]]
  }

  return password
}

/* Converts password data to a Uint8Array */
function ChangeCommonFontCode_Uint8Array (password_data) {
  var password = new Uint8Array(PASSWORD_STR_SIZE)
  for (var i = 0; i < PASSWORD_STR_SIZE; i++) {
    password[i] = usable2fontnum[password_data[i]]
  }

  return password
}

/* Generates a password Uint8Array from input */
function MakePassword (
  code_type,
  hit_rate_idx,
  str0,
  str1,
  item_id,
  npc_type,
  npc_code
) {
  var data = MakePasscode(
    code_type,
    hit_rate_idx,
    Uint8Array2ACBytes(str0),
    Uint8Array2ACBytes(str1),
    item_id,
    npc_type,
    npc_code
  )
  EncodeSubstitutionCipher(data)
  TranspositionCipher(data, true, 0)
  EncodeBitShuffle(data, 0)
  EncodeChangeRSACipher(data)
  EncodeBitMixCode(data)
  EncodeBitShuffle(data, 1)
  TranspositionCipher(data, false, 1)

  return ChangeCommonFontCode_Uint8Array(Change6BitsCode(data))
}

/************************************************************************************************
 * DECODER SECTION
 ***********************************************************************************************/

/* Small function which replaces 1's with l and 0's with O. I guess it cleared up confusion. */
function AdjustLetter (password) {
  return password.replace(/1/g, 'l').replace(/0/g, 'O')
}

/* Returns the index (6-bits) of the character in the data table array, or 0xFF if not found. */
function ChangePasswordFontCodeSubroutine (char) {
  for (var i = 0; i < usable2fontnum.length; i++) {
    if (usable2fontnum[i] == char) {
      return i
    }
  }
  console.log(`char: ${char}`)
  return 0xff
}

/* Converts a password string into its 6-bit data representation */
function ChangePasswordFontCode (password) {
  var data = new Uint8Array(password.length)
  for (var i = 0; i < password.length; i++) {
    var font_code = ChangePasswordFontCodeSubroutine(
      character_map.indexOf(password.charAt(i))
    )
    if (font_code == 0xff) {
      throw 'Invalid character in password!'
    }

    data[i] = font_code
  }

  return data
}

/* Decode implementation for bit shuffling */
function DecodeBitShuffle (data, key_idx) {
  const key = key_idx == 0 ? 13 : 2
  const count = key_idx == 0 ? 19 : 20
  const select_tbl = select_idx_table[data[key] & 3]

  const r_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)
  const w_data = new Uint8Array(PASSWORD_DATA_SIZE - 1)

  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    if (i < key) {
      r_data[i] = data[i]
    } else if (i > key) {
      r_data[i - 1] = data[i]
    }
  }

  for (var i = 0; i < count; i++) {
    for (var j = 0; j < 8; j++) {
      var w_ofs = select_tbl[j] + i
      if (w_ofs >= count) {
        w_ofs -= count
      }

      w_data[i] |= r_data[w_ofs] & (1 << j)
    }
  }

  for (var i = 0; i < data.length; i++) {
    if (i < key) {
      data[i] = w_data[i]
    } else if (i > key) {
      data[i] = w_data[i - 1]
    }
  }

  return data
}

/* Decode method for branching bit mixing */
function DecodeBitCode (data) {
  const code = data[PASSWORD_BITMIXKEY_IDX] & 0xf

  if (code < 13) {
    if (code < 9) {
      if (code < 5) {
        BitArrangeReverse(data)
        BitShift(data, code * -3)
      } else {
        BitReverse(data)
        BitShift(data, code * 5)
      }
    } else {
      BitShift(data, code * 5)
      BitArrangeReverse(data)
    }
  } else {
    BitShift(data, code * -3)
    BitReverse(data)
    BitArrangeReverse(data)
  }
}

/* Decode implementation for RSA prime multiplication */
function DecodeRSACipher (data) {
  const rsa_info = GetRSAKeyCode(data)

  const n = rsa_info.p * rsa_info.q
  const even_product = (rsa_info.p - 1) * (rsa_info.q - 1)

  var d /* The modular multiplicative inverse of e */
  var mod_count = 0
  const e = rsa_info.e

  /* Calculate d (modular multiplicative inverse of e) via least common multiple of p-1 & q-1 */
  do {
    d = (++mod_count * even_product + 1) / e
  } while ((mod_count * even_product + 1) % e != 0)

  /* Decrypt the ciphertext values (c).
   * This works by raising the ciphertext to the mod mult. inverse (d).
   * The math boils down to: c = m^e, e^d = 1 -> c^d = (m^e)^d = m^1 = m */
  for (var i = 0; i < 8; i++) {
    var c_enc = data[rsa_info.select_tbl[i]]
    c_enc |= ((data[PASSWORD_RSA_BITSAVE_IDX] >> i) & 1) << 8

    const c = c_enc
    for (var j = 0; j < d - 1; j++) {
      c_enc = (c_enc * c) % n
    }

    data[rsa_info.select_tbl[i]] = c_enc & 0xff
  }

  return data
}

/* Swaps password data bytes with their substitution index */
function DecodeSubstitutionCipher (data) {
  for (var i = 0; i < PASSWORD_DATA_SIZE; i++) {
    for (var j = 0; j < 256; j++) {
      if (data[i] == change_code_tbl[j]) {
        data[i] = j
        break
      }
    }
  }

  return data
}

/* Generates a password object from the raw password data */
function GetPasswordData (data) {
  const chksum = (data[0] >> 3) & 3
  var str0 = ''
  var str1 = ''

  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    str0 += character_map[data[2 + i]]
    str1 += character_map[data[10 + i]]
  }

  const item_id = (data[18] << 8) | data[19]
  const code_type = data[0] >> 5

  var hit_rate_idx
  var is_special_npc
  var npc_code

  switch (code_type) {
    case CODE_TYPES.Popular:
    case CODE_TYPES.CardE:
      hit_rate_idx = (data[0] >> 1) & 3
      is_special_npc = (data[0] & 1) != 0
      npc_code = data[1]
      break
    case CODE_TYPES.Magazine:
      hit_rate_idx = ((data[0] >> 1) & 3) | ((data[0] & 1) << 2)
      is_special_npc = true
      npc_code = 0xff
      break
    case CODE_TYPES.User:
    case CODE_TYPES.CardEMini:
      hit_rate_idx = (data[0] >> 1) & 3
      is_special_npc = true
      npc_code = 0xff
      break
  }

  var password = {
    Type: code_type,
    ItemId: item_id,
    SpecialNPC: is_special_npc,
    NPCCode: npc_code,
    HitRateIndex: hit_rate_idx,
    String0: str0,
    String1: str1,
    Checksum: chksum,
    Valid: false
  }

  password.Valid = CheckIsPasswordValid(password)
  return password
}

function DecodePassword (password) {
  password = AdjustLetter(password)
  var password_str_bytes = ChangePasswordFontCode(password)
  //console.log(`${password_str_bytes},`);
  var data = Change8BitsCode(password_str_bytes)
  //console.log(`${data},`);
  TranspositionCipher(data, true, 1)
  //console.log(`${data},`);
  DecodeBitShuffle(data, 1)
  //console.log(`${data},`);
  DecodeBitCode(data)
  //console.log(`${data},`);
  DecodeRSACipher(data)
  //console.log(`${data},`);
  DecodeBitShuffle(data, 0)
  //console.log(`${data},`);
  TranspositionCipher(data, false, 0)
  //console.log(`${data},`);
  DecodeSubstitutionCipher(data)
  //console.log(`${data},`);

  return GetPasswordData(data)
}

/************************************************************************************************
 * MISC SECTION
 ***********************************************************************************************/

/* Utility function to verify whether a password is 'valid'. NOTE: this check does not account for
 * varying code present restrictions. */
function CheckIsPasswordValid (password) {
  if (password.Type > CODE_TYPES.CardEMini) return false

  var chksum = 0
  for (var i = 0; i < PARAM_STRING_SIZE; i++) {
    chksum += character_map.indexOf(password.String0.charAt(i))
    chksum += character_map.indexOf(password.String1.charAt(i))
  }

  chksum += password.ItemId
  chksum += password.NPCCode

  return (chksum & 3) == password.Checksum
}

/* Utility function to convert a byte array to Unicode string */
function ConvertBytesToUnicodeString (bytes) {
  var str = ''
  for (var i = 0; i < bytes.length; i++) {
    str += character_map[bytes[i]]
  }

  return str
}
