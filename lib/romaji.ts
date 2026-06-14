/**
 * Romaji → Hiragana / Katakana conversion utility.
 *
 * Converts typed romaji text to Japanese kana in real-time.
 * Supports digraphs (sha, chi, tsu), double consonants (っ/ッ),
 * combo kana (kya, sho, etc.), and the standalone 'n' consonant.
 */

// prettier-ignore
const HIRAGANA_MAP: Record<string, string> = {
  // Vowels
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  // K-row
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  // S-row
  sa: "さ", si: "し", su: "す", se: "せ", so: "そ",
  shi: "し",
  // T-row
  ta: "た", ti: "ち", tu: "つ", te: "て", to: "と",
  chi: "ち", tsu: "つ",
  // N-row
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  // H-row
  ha: "は", hi: "ひ", hu: "ふ", he: "へ", ho: "ほ",
  fu: "ふ",
  // M-row
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  // Y-row
  ya: "や", yu: "ゆ", yo: "よ",
  // R-row
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  // W-row
  wa: "わ", wi: "ゐ", we: "ゑ", wo: "を",
  // N standalone
  nn: "ん", xn: "ん",
  // G-row (dakuten)
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  // Z-row
  za: "ざ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ji: "じ",
  // D-row
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  // B-row
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  // P-row (handakuten)
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  // Combo kana (yōon)
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",
  sya: "しゃ", syu: "しゅ", syo: "しょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
  tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  ja: "じゃ", ju: "じゅ", jo: "じょ",
  jya: "じゃ", jyu: "じゅ", jyo: "じょ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  // Small kana
  xa: "ぁ", xi: "ぃ", xu: "ぅ", xe: "ぇ", xo: "ぉ",
  xya: "ゃ", xyu: "ゅ", xyo: "ょ",
  xtu: "っ", xtsu: "っ",
  // Long vowel mark
  "-": "ー",
};

// prettier-ignore
const KATAKANA_MAP: Record<string, string> = {
  // Vowels
  a: "ア", i: "イ", u: "ウ", e: "エ", o: "オ",
  // K-row
  ka: "カ", ki: "キ", ku: "ク", ke: "ケ", ko: "コ",
  // S-row
  sa: "サ", si: "シ", su: "ス", se: "セ", so: "ソ",
  shi: "シ",
  // T-row
  ta: "タ", ti: "チ", tu: "ツ", te: "テ", to: "ト",
  chi: "チ", tsu: "ツ",
  // N-row
  na: "ナ", ni: "ニ", nu: "ヌ", ne: "ネ", no: "ノ",
  // H-row
  ha: "ハ", hi: "ヒ", hu: "フ", he: "ヘ", ho: "ホ",
  fu: "フ",
  // M-row
  ma: "マ", mi: "ミ", mu: "ム", me: "メ", mo: "モ",
  // Y-row
  ya: "ヤ", yu: "ユ", yo: "ヨ",
  // R-row
  ra: "ラ", ri: "リ", ru: "ル", re: "レ", ro: "ロ",
  // W-row
  wa: "ワ", wi: "ヰ", we: "ヱ", wo: "ヲ",
  // N standalone
  nn: "ン", xn: "ン",
  // G-row
  ga: "ガ", gi: "ギ", gu: "グ", ge: "ゲ", go: "ゴ",
  // Z-row
  za: "ザ", zi: "ジ", zu: "ズ", ze: "ゼ", zo: "ゾ",
  ji: "ジ",
  // D-row
  da: "ダ", di: "ヂ", du: "ヅ", de: "デ", do: "ド",
  // B-row
  ba: "バ", bi: "ビ", bu: "ブ", be: "ベ", bo: "ボ",
  // P-row
  pa: "パ", pi: "ピ", pu: "プ", pe: "ペ", po: "ポ",
  // Combo kana
  kya: "キャ", kyu: "キュ", kyo: "キョ",
  sha: "シャ", shu: "シュ", sho: "ショ",
  sya: "シャ", syu: "シュ", syo: "ショ",
  cha: "チャ", chu: "チュ", cho: "チョ",
  tya: "チャ", tyu: "チュ", tyo: "チョ",
  nya: "ニャ", nyu: "ニュ", nyo: "ニョ",
  hya: "ヒャ", hyu: "ヒュ", hyo: "ヒョ",
  mya: "ミャ", myu: "ミュ", myo: "ミョ",
  rya: "リャ", ryu: "リュ", ryo: "リョ",
  gya: "ギャ", gyu: "ギュ", gyo: "ギョ",
  ja: "ジャ", ju: "ジュ", jo: "ジョ",
  jya: "ジャ", jyu: "ジュ", jyo: "ジョ",
  bya: "ビャ", byu: "ビュ", byo: "ビョ",
  pya: "ピャ", pyu: "ピュ", pyo: "ピョ",
  // Small kana
  xa: "ァ", xi: "ィ", xu: "ゥ", xe: "ェ", xo: "ォ",
  xya: "ャ", xyu: "ュ", xyo: "ョ",
  xtu: "ッ", xtsu: "ッ",
  // Long vowel mark
  "-": "ー",
};

const CONSONANTS = new Set([
  "b","c","d","f","g","h","j","k","l","m",
  "n","p","q","r","s","t","v","w","x","y","z",
]);

/**
 * Convert a romaji string to kana (hiragana or katakana).
 *
 * The algorithm scans left-to-right, greedily matching the longest
 * possible romaji token at each position. Double consonants produce
 * a small tsu (っ/ッ). A trailing 'n' before a consonant (except
 * n/y) or at end-of-string is converted to ん/ン.
 */
export function romajiToKana(
  input: string,
  mode: "hiragana" | "katakana" = "hiragana",
): string {
  const map = mode === "hiragana" ? HIRAGANA_MAP : KATAKANA_MAP;
  const smallTsu = mode === "hiragana" ? "っ" : "ッ";
  const n = mode === "hiragana" ? "ん" : "ン";

  let result = "";
  let i = 0;
  const lower = input.toLowerCase();

  while (i < lower.length) {
    // Handle double consonants → small tsu
    if (
      i + 1 < lower.length &&
      lower[i] === lower[i + 1] &&
      CONSONANTS.has(lower[i]) &&
      lower[i] !== "n"
    ) {
      result += smallTsu;
      i++;
      continue;
    }

    // Handle 'n' before consonant (not n, y, or vowel) → ん/ン
    if (lower[i] === "n" && i + 1 < lower.length) {
      const next = lower[i + 1];
      if (
        CONSONANTS.has(next) &&
        next !== "n" &&
        next !== "y" &&
        !map[lower.slice(i, i + 2)] &&
        !map[lower.slice(i, i + 3)]
      ) {
        result += n;
        i++;
        continue;
      }
    }

    // Try longest match first (4 chars, then 3, 2, 1)
    let matched = false;
    for (let len = 4; len >= 1; len--) {
      const token = lower.slice(i, i + len);
      if (map[token]) {
        result += map[token];
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Pass through non-romaji characters as-is
      result += lower[i];
      i++;
    }
  }

  return result;
}

/**
 * Check if a romaji buffer could still potentially produce a kana match.
 * Used by the input component to decide whether to keep buffering or flush.
 */
export function isPartialRomaji(buffer: string): boolean {
  const lower = buffer.toLowerCase();
  const map = { ...HIRAGANA_MAP }; // either map works for key checking

  for (const key of Object.keys(map)) {
    if (key.startsWith(lower)) {
      return true;
    }
  }

  // Also allow double-consonant prefixes
  if (
    lower.length === 1 &&
    CONSONANTS.has(lower) &&
    lower !== "a" &&
    lower !== "i" &&
    lower !== "u" &&
    lower !== "e" &&
    lower !== "o"
  ) {
    return true;
  }

  return false;
}
