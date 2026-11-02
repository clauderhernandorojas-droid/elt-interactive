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
  './INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html',
  './PRE_INTERMEDIATE/PRE-INTERMEDIATE WB LESSONS/UNIT 1/1a.html',
  './PRE_INTERMEDIATE/PRE-INTERMEDIATE WB LESSONS/UNIT 1/1b.html'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  const m = content.match(/const payload = "([^"]+)";/);
  if (!m) continue;
  const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
  deck.forEach((slide, sIdx) => {
    const html = slide.html || '';
    // Look for radio
    if (html.includes('type="radio"') || html.includes("type='radio'")) {
      console.log(`${f} Slide ${sIdx + 1} has radio!`);
      const rIdx = html.indexOf('type="radio"');
      console.log(html.substring(Math.max(0, rIdx - 150), Math.min(html.length, rIdx + 300)));
    }
    // Look for word bank
    if (html.includes('word-bank') || html.includes('wordbank') || html.includes('data-word-bank') || html.includes('chips-container')) {
      console.log(`${f} Slide ${sIdx + 1} has word bank!`);
      const wIdx = Math.max(html.indexOf('word-bank'), html.indexOf('wordbank'), html.indexOf('chips-container'));
      console.log(html.substring(Math.max(0, wIdx - 100), Math.min(html.length, wIdx + 300)));
    }
    // Look for match
    if (html.includes('match') && (html.includes('draggable') || html.includes('droppable') || html.includes('data-match'))) {
      console.log(`${f} Slide ${sIdx + 1} has matching!`);
    }
  });
}

