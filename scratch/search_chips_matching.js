const fs = require('fs');
const files = [
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1b.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1c.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1d.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2a.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2b.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2c.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2d.html',
  './INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const m = fs.readFileSync(f, 'utf8').match(/const payload = "([^"]+)";/);
  if (!m) continue;
  const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
  deck.forEach((s, idx) => {
    const html = s.html || '';
    ['bank', 'chip', 'draggable', 'match', 'pair', 'pill'].forEach(term => {
      const pos = html.toLowerCase().indexOf(term);
      if (pos !== -1) {
        console.log(`${f} Slide ${idx + 1} has '${term}':`);
        console.log(html.substring(Math.max(0, pos - 50), Math.min(html.length, pos + 150)));
      }
    });
  });
}

