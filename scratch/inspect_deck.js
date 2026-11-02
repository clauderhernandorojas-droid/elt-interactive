const fs = require('fs');
const content = fs.readFileSync('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html', 'utf8');
const match = content.match(/const payload = "([^"]+)";/);
if (match) {
  const jsonStr = Buffer.from(match[1], 'base64').toString('utf8');
  const deck = JSON.parse(jsonStr);
  console.log('Deck slides count:', deck.length);
  deck.forEach((s, idx) => {
    console.log(`Slide ${idx + 1}: length ${s.html ? s.html.length : 0}`);
    if (s.html) {
      if (s.html.includes('<select')) console.log(`  has <select>`);
      if (s.html.includes('type="radio"') || s.html.includes("type='radio'")) console.log(`  has radio`);
      if (s.html.includes('data-answer')) console.log(`  has data-answer`);
      if (s.html.includes('data-option')) console.log(`  has data-option`);
      if (s.html.includes('word-bank') || s.html.includes('wordbank')) console.log(`  has word-bank`);
      if (s.html.includes('choice-group') || s.html.includes('options-group')) console.log(`  has choice-group`);
    }
  });
}

