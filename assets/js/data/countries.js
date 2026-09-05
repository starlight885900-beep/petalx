/**
 * countries.js: options for the country <select> on the contact form.
 *
 * Kept in JS rather than markup purely because it is 48 <option> tags of no
 * SEO value. All other page content stays in the HTML so crawlers see it.
 *
 * Each entry is [english, 日本語]. The English name is always what gets
 * submitted as the value; only the visible label changes with the page
 * language, so the backend receives one consistent spelling either way.
 */
export const COUNTRIES = [
  ['Argentina', 'アルゼンチン'],
  ['Australia', 'オーストラリア'],
  ['Bangladesh', 'バングラデシュ'],
  ['Brazil', 'ブラジル'],
  ['Canada', 'カナダ'],
  ['Chile', 'チリ'],
  ['China', '中国'],
  ['Colombia', 'コロンビア'],
  ['Egypt', 'エジプト'],
  ['Ethiopia', 'エチオピア'],
  ['France', 'フランス'],
  ['Germany', 'ドイツ'],
  ['Ghana', 'ガーナ'],
  ['India', 'インド'],
  ['Indonesia', 'インドネシア'],
  ['Ireland', 'アイルランド'],
  ['Italy', 'イタリア'],
  ['Japan', '日本'],
  ['Kenya', 'ケニア'],
  ['Malaysia', 'マレーシア'],
  ['Mexico', 'メキシコ'],
  ['Morocco', 'モロッコ'],
  ['Netherlands', 'オランダ'],
  ['New Zealand', 'ニュージーランド'],
  ['Nigeria', 'ナイジェリア'],
  ['Pakistan', 'パキスタン'],
  ['Peru', 'ペルー'],
  ['Philippines', 'フィリピン'],
  ['Poland', 'ポーランド'],
  ['Portugal', 'ポルトガル'],
  ['Romania', 'ルーマニア'],
  ['Singapore', 'シンガポール'],
  ['South Africa', '南アフリカ'],
  ['South Korea', '韓国'],
  ['Spain', 'スペイン'],
  ['Sri Lanka', 'スリランカ'],
  ['Sweden', 'スウェーデン'],
  ['Switzerland', 'スイス'],
  ['Taiwan', '台湾'],
  ['Thailand', 'タイ'],
  ['Tunisia', 'チュニジア'],
  ['Türkiye', 'トルコ'],
  ['Ukraine', 'ウクライナ'],
  ['United Arab Emirates', 'アラブ首長国連邦'],
  ['United Kingdom', 'イギリス'],
  ['United States', 'アメリカ合衆国'],
  ['Vietnam', 'ベトナム'],
  ['Other', 'その他']
];
