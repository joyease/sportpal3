/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Prefecture {
  id: string;
  name: string;
  enName: string;
  region: string;
}

export const JAPAN_REGIONS = [
  '北海道',
  '東北地方',
  '關東地方',
  '中部地方',
  '近畿地方',
  '中國地方',
  '四國地方',
  '九州與沖繩地方'
];

export const PREFECTURES: Prefecture[] = [
  // 北海道
  { id: 'hokkaido', name: '北海道', enName: 'Hokkaido', region: '北海道' },
  // 東北地方
  { id: 'aomori', name: '青森縣', enName: 'Aomori', region: '東北地方' },
  { id: 'iwate', name: '岩手縣', enName: 'Iwate', region: '東北地方' },
  { id: 'miyagi', name: '宮城縣', enName: 'Miyagi', region: '東北地方' },
  { id: 'akita', name: '秋田縣', enName: 'Akita', region: '東北地方' },
  { id: 'yamagata', name: '山形縣', enName: 'Yamagata', region: '東北地方' },
  { id: 'fukushima', name: '福島縣', enName: 'Fukushima', region: '東北地方' },
  // 關東地方
  { id: 'ibaraki', name: '茨城縣', enName: 'Ibaraki', region: '關東地方' },
  { id: 'tochigi', name: '栃木縣', enName: 'Tochigi', region: '關東地方' },
  { id: 'gunma', name: '群馬縣', enName: 'Gunma', region: '關東地方' },
  { id: 'saitama', name: '埼玉縣', enName: 'Saitama', region: '關東地方' },
  { id: 'chiba', name: '千葉縣', enName: 'Chiba', region: '關東地方' },
  { id: 'tokyo', name: '東京都', enName: 'Tokyo', region: '關東地方' },
  { id: 'kanagawa', name: '神奈川縣', enName: 'Kanagawa', region: '關東地方' },
  // 中部地方
  { id: 'niigata', name: '新潟縣', enName: 'Niigata', region: '中部地方' },
  { id: 'toyama', name: '富山縣', enName: 'Toyama', region: '中部地方' },
  { id: 'ishikawa', name: '石川縣', enName: 'Ishikawa', region: '中部地方' },
  { id: 'fukui', name: '福井縣', enName: 'Fukui', region: '中部地方' },
  { id: 'yamanashi', name: '山梨縣', enName: 'Yamanashi', region: '中部地方' },
  { id: 'nagano', name: '長野縣', enName: 'Nagano', region: '中部地方' },
  { id: 'gifu', name: '岐阜縣', enName: 'Gifu', region: '中部地方' },
  { id: 'shizuoka', name: '靜岡縣', enName: 'Shizuoka', region: '中部地方' },
  { id: 'aichi', name: '愛知縣', enName: 'Aichi', region: '中部地方' },
  // 近畿地方
  { id: 'mie', name: '三重縣', enName: 'Mie', region: '近畿地方' },
  { id: 'shiga', name: '滋賀縣', enName: 'Shiga', region: '近畿地方' },
  { id: 'kyoto', name: '京都府', enName: 'Kyoto', region: '近畿地方' },
  { id: 'osaka', name: '大阪府', enName: 'Osaka', region: '近畿地方' },
  { id: 'hyogo', name: '兵庫縣', enName: 'Hyogo', region: '近畿地方' },
  { id: 'nara', name: '奈良縣', enName: 'Nara', region: '近畿地方' },
  { id: 'wakayama', name: '和歌山縣', enName: 'Wakayama', region: '近畿地方' },
  // 中國地方
  { id: 'tottori', name: '鳥取縣', enName: 'Tottori', region: '中國地方' },
  { id: 'shimane', name: '島根縣', enName: 'Shimane', region: '中國地方' },
  { id: 'okayama', name: '岡山縣', enName: 'Okayama', region: '中國地方' },
  { id: 'hiroshima', name: '廣島縣', enName: 'Hiroshima', region: '中國地方' },
  { id: 'yamaguchi', name: '山口縣', enName: 'Yamaguchi', region: '中國地方' },
  // 四國地方
  { id: 'tokushima', name: '德島縣', enName: 'Tokushima', region: '四國地方' },
  { id: 'kagawa', name: '香川縣', enName: 'Kagawa', region: '四國地方' },
  { id: 'ehime', name: '愛媛縣', enName: 'Ehime', region: '四國地方' },
  { id: 'kochi', name: '高知縣', enName: 'Kochi', region: '四國地方' },
  // 九州與沖繩地方
  { id: 'fukuoka', name: '福岡縣', enName: 'Fukuoka', region: '九州與沖繩地方' },
  { id: 'saga', name: '佐賀縣', enName: 'Saga', region: '九州與沖繩地方' },
  { id: 'nagasaki', name: '長崎縣', enName: 'Nagasaki', region: '九州與沖繩地方' },
  { id: 'kumamoto', name: '熊本縣', enName: 'Kumamoto', region: '九州與沖繩地方' },
  { id: 'oita', name: '大分縣', enName: 'Oita', region: '九州與沖繩地方' },
  { id: 'miyazaki', name: '宮崎縣', enName: 'Miyazaki', region: '九州與沖繩地方' },
  { id: 'kagoshima', name: '鹿兒島縣', enName: 'Kagoshima', region: '九州與沖繩地方' },
  { id: 'okinawa', name: '沖繩縣', enName: 'Okinawa', region: '九州與沖繩地方' },
];
