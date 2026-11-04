// Собирает сайт из ../прототип: копирует файлы, оборачивает страницы в полноценный HTML, пишет список файлов для офлайна.
// Запуск: node build.js
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'прототип'), OUT = __dirname;

const files = [];
function copyDir(dir){
  fs.mkdirSync(path.join(OUT, dir), {recursive: true});
  for (const f of fs.readdirSync(path.join(SRC, dir))){
    const rel = dir + '/' + f;
    if (fs.statSync(path.join(SRC, rel)).isDirectory()) copyDir(rel);
    else { fs.copyFileSync(path.join(SRC, rel), path.join(OUT, rel)); files.push(rel); }
  }
}
copyDir('img'); copyDir('models');

const head = (extra = '') => `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${extra}</head><body>
`;
const pwa = `<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Выдрочка">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js'));</script>
`;
for (const [f, extra] of [['index.html', pwa], ['docs.html', '<link rel="icon" type="image/png" href="icons/icon-192.png">\n']]){
  fs.writeFileSync(path.join(OUT, f), head(extra) + fs.readFileSync(path.join(SRC, f), 'utf8') + '\n</body></html>\n');
}

// Список для офлайна; версия меняется при каждой сборке, чтобы телефон забрал обновление
const list = ['./', 'index.html', 'docs.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', ...files];
fs.writeFileSync(path.join(OUT, 'precache.js'), `self.VERSION = ${JSON.stringify(new Date().toISOString())};\nself.PRECACHE = ${JSON.stringify(list, null, 1)};\n`);
console.log('собрано файлов:', list.length);
