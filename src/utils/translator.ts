
import sha256 from 'crypto-js/sha256';

function truncate(q: any) {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

export async function translateText(query: string) {
  const appKey = '57c14d8eda6766a0';
  const key = 'DjWfsVN4NGrZGMESEvFo0yrCcWxluswc'; //注意：暴露appSecret，有被盗用造成损失的风险
  const salt = new Date().getTime();
  const curtime = Math.round(new Date().getTime() / 1000);
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  const from = 'en';
  const to = 'zh-CHS';
  const str1 = appKey + truncate(query) + salt + curtime + key;
  const vocabId = '您的用户词表ID';

  const sign = sha256(str1).toString();
  return await $.ajax({
    url: 'https://openapi.youdao.com/api',
    type: 'post',
    dataType: 'jsonp',
    data: {
      q: query,
      appKey: appKey,
      salt: salt,
      from: from,
      to: to,
      sign: sign,
      signType: 'v3',
      curtime: curtime,
      vocabId: vocabId
    }
  });
}
