/**
 * Enum-like object representing various subjects and their associated codes.
 * Each subject is mapped to an array of strings, where the first element is the primary identifier
 * and the subsequent elements are alternative codes or abbreviations.
 *
 * @constant
 *
 * @property {string[]} BahasaIndonesia - Language subject: Bahasa Indonesia
 * @property {string[]} BahasaInggris - Language subject: Bahasa Inggris
 * @property {string[]} BahasaArab - Language subject: Bahasa Arab
 * @property {string[]} BahasaJawaTengah - Language subject: Bahasa Jawa Tengah
 * @property {string[]} BahasaJawaTimur - Language subject: Bahasa Jawa Timur
 * @property {string[]} BahasaSunda - Language subject: Bahasa Sunda
 *
 * @property {string[]} AkidahAkhlak - Religious study: Akidah Akhlak
 * @property {string[]} Fikih - Religious study: Fikih
 * @property {string[]} PAIBP - Religious study: Pendidikan Agama Islam dan Budi Pekerti
 * @property {string[]} Qurdis - Religious study: Quran Hadis
 * @property {string[]} SKI - Religious study: Sejarah Kebudayaan Islam
 *
 * @property {string[]} Biologi - Science subject: Biologi
 * @property {string[]} Fisika - Science subject: Fisika
 * @property {string[]} Kimia - Science subject: Kimia
 * @property {string[]} IPA - Science subject: Ilmu Pengetahuan Alam
 * @property {string[]} IPAS - Science subject: Ilmu Pengetahuan Alam dan Sosial
 * @property {string[]} Informatika - Science subject: Informatika
 *
 * @property {string[]} Matematika - Mathematics subject: Matematika
 * @property {string[]} MatematikaPeminatan - Mathematics subject: Matematika Peminatan
 *
 * @property {string[]} IPS - Social science subject: Ilmu Pengetahuan Sosial
 * @property {string[]} Geografi - Social science subject: Geografi
 * @property {string[]} Ekonomi - Social science subject: Ekonomi
 * @property {string[]} Antropologi - Social science subject: Antropologi
 * @property {string[]} Sosiologi - Social science subject: Sosiologi
 * @property {string[]} Sejarah - Social science subject: Sejarah
 * @property {string[]} SejarahIndonesia - Social science subject: Sejarah Indonesia
 *
 * @property {string[]} SeniBudaya - Art subject: Seni Budaya
 * @property {string[]} SeniMusik - Art subject: Seni Musik
 * @property {string[]} SeniRupa - Art subject: Seni Rupa
 *
 * @property {string[]} Penjas - Physical education subject: Pendidikan Jasmani
 *
 * @property {string[]} PKWU - Vocational subject: Prakarya dan Kewirausahaan
 * @property {string[]} Prakarya - Vocational subject: Prakarya
 * @property {string[]} PendidikanPancasila - Vocational subject: Pendidikan Pancasila dan Kewarganegaraan
 *
 * @property {string[]} BK - Miscellaneous subject: Bimbingan Konseling
 * @property {string[]} BTQ - Miscellaneous subject: Baca Tulis Quran
 */
export const SubjectEnum = {
  // Language subjects
  BahasaIndonesia: ["bahasa-indonesia", "INDO", "BAHASAINDONESIA"],
  BahasaInggris: ["bahasa-inggris", "ING", "BAHASAINGGRIS"],
  BahasaArab: ["bahasa-arab", "BA", "BARAB", "BAHASAARAB"],
  BahasaJawaTengah: ["bahasa-jawa-tengah", "BJTE", "B.JATENG"],
  BahasaJawaTimur: ["bahasa-jawa-timur", "BJTI", "B.JATIM"],
  BahasaSunda: ["bahasa-sunda", "SUNDA"],

  // Religious studies
  AkidahAkhlak: ["akidah-akhlak", "AA"],
  Fikih: ["fikih", "FIQ"],
  PAIBP: ["paibp", "PAIBP", "PAI"],
  Qurdis: ["qurdis", "QURDIS", "QURAN"],
  SKI: ["ski", "SKI"],

  // Sciences
  Biologi: ["biologi", "BIO"],
  Fisika: ["fisika", "FIS"],
  Kimia: ["kimia", "KIM"],
  IPA: ["ipa", "IPA"],
  IPAS: ["ipas", "IPAS"],
  Informatika: ["informatika", "INF", "INFOR"],

  // Mathematics
  Matematika: ["matematika", "MTK"],
  MatematikaPeminatan: ["matematika-peminatan", "MTKP"],

  // Social sciences
  IPS: ["ips", "IPS"],
  Geografi: ["geografi", "GEO"],
  Ekonomi: ["ekonomi", "EK", "EKO"],
  Antropologi: ["antropologi", "ANT", "ANTRO"],
  Sosiologi: ["sosiologi", "SOS"],
  Sejarah: ["sejarah", "SEJ", "SEJARAH"],
  SejarahIndonesia: ["sejarah-indonesia", "S.IND"],

  // Arts
  SeniBudaya: ["seni-budaya", "SB", "SENBUD", "SENIBUDAYA"],
  SeniMusik: ["seni-musik", "-SM-", "SENMUS", "SENIMUSIK"],
  SeniRupa: ["seni-rupa", "SR", "SENRUP", "SENIRUPA"],

  // Physical education
  Penjas: ["penjas", "PJOK", "PENJAS"],

  // Vocational and practical subjects
  PKWU: ["pkwu", "PKWU"],
  Prakarya: ["prakarya", "PRA", "PRAKARYA"],
  PendidikanPancasila: ["pendidikan-pancasila", "PKN", "PP", "PANCASILA"],

  // Miscellaneous
  BK: ["bk", "BK"],
  BTQ: ["btq", "BTQ"],
} as const

export type SubjectType = keyof typeof SubjectEnum

/**
 * Retrieves the values of a given subject enum.
 *
 * @param subject - The subject type for which to get the enum values.
 * @returns An array of strings representing the enum values for the specified subject.
 */
export const getSubjectEnumValues = (subject: SubjectType): readonly string[] => {
  return SubjectEnum[subject]
}

/**
 * Retrieves the keys of the SubjectEnum as an array of SubjectType.
 *
 * @returns An array containing the keys of the SubjectEnum.
 */
export const getSubjectEnumKeys = (): SubjectType[] => {
  return Object.keys(SubjectEnum) as SubjectType[]
}

/**
 * Generates a regex pattern string for matching any of the values in the given subject enum.
 *
 * @param subject - The subject enum type to generate the pattern for.
 * @returns A regex pattern string that matches any of the values in the given subject enum, case-insensitively.
 */
export const getSubjectEnumPattern = (subject: SubjectType): string => {
  const subjects = getSubjectEnumValues(subject)
  const pattern = `(?i)(${subjects.join("|")})`

  return pattern
}