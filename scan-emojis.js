const fs = require('fs');
const path = require('path');

const EMOJIS = ['✨','📋','📊','📅','💡','⚠️','✅','💰','🛒','📞','🔔','💬','⭐','🌟','🔥','📈','🌺','🌸','🎀','💄','💆','💅','🧖','🛁','🚿','💇','🔧','🧹','📝','🎁','🎯','🔑','👤','🏠','📦','📌','🗂️','🔍','📱','💳','🎪','🏆','🥇','🧾','🪞','🧴','🧽','🦷','👒','🎩','🪭','👰','🤵','👸','💒','🌹','🍀','🌿','🌾','🍃','🌷','🌻','🌺','💐','🌼','🌱','☘️','🌴','🌵','🏔️','⛰️','🌅','🌄','🎇','🎆','🎋','🎍','🎎','🎏','🎐','🎑','🧧','🎀','🎁','🎗️','🎟️','🎫','🎖️','🏅','🎒','🧳','💼','📯','🎙️','🎚️','🎛️','🧭','⏰','⏱️','⏲️','🕰️','⌛','⏳','⌚','🔮','🔭','🔬','🧪','🧫','🧬','🧯','🧱','🛒','🛍️','☀️','🌙','⭐','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','☔','⛄','🌪️','🌈','☀️','⚡','💧','❄️','🔥','🌊','💦','🫧','🧊'];

const emojiSet = new Set(EMOJIS);

function scanDir(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '.next') {
      results.push(...scanDir(full));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      let found = [];
      for (const ch of content) {
        if (emojiSet.has(ch)) found.push(ch);
      }
      if (found.length > 0) {
        results.push({ file: full.replace(__dirname + '\\', ''), emojis: [...new Set(found)] });
      }
    }
  }
  return results;
}

const results = scanDir(path.join(__dirname, 'app'));
if (results.length === 0) {
  console.log('✅ 全站 emoji 清理完成，无残留！');
} else {
  results.forEach(r => console.log(`${r.file}: ${r.emojis.join(' ')}`));
}
