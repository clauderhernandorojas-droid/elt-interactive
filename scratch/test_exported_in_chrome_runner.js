const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const loadSlideFromDeck = (filePath, slideIndex) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const m = content.match(/const payload = "([^"]+)";/);
  const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
  return deck[slideIndex].html;
};

const slide1a_1 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html', 0);
const slide1a_4 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html', 3);
const slide2c_3 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2c.html', 2);
const test1_1 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html', 0);

const snippet = fs.readFileSync('scratch/export_snippet_clean.js', 'utf8');
const code = eval(snippet.slice(0, -2));

const safeJson = (val) => JSON.stringify(val).replace(/<\/script/gi, '<\\/script');

const testHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<div id="output-box"></div>
<script>
${code}

const realSlides = [
  { name: 'Buttons', html: ${safeJson(slide1a_1)}, sel: 'button[data-question="1"]' },
  { name: 'Selects', html: ${safeJson(slide1a_4)}, sel: 'select option' },
  { name: 'Radios', html: ${safeJson(slide2c_3)}, sel: 'input[name="q1"]' },
  { name: 'Word Bank', html: ${safeJson(test1_1)}, sel: '.flex.flex-wrap.gap-2 span:not(.uppercase)' }
];

const results = [];
realSlides.forEach(s => {
  const p1 = new DOMParser();
  const dOrig = p1.parseFromString(s.html, 'text/html');
  const origList = Array.from(dOrig.querySelectorAll(s.sel)).map(el => el.textContent.trim() || el.value);

  let changed = false;
  let shufList = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    const shuffled = shuffleExerciseOptions(s.html);
    const p2 = new DOMParser();
    const dShuf = p2.parseFromString(shuffled, 'text/html');
    shufList = Array.from(dShuf.querySelectorAll(s.sel)).map(el => el.textContent.trim() || el.value);
    if (JSON.stringify(origList) !== JSON.stringify(shufList)) {
      changed = true;
      break;
    }
  }

  results.push({
    name: s.name,
    orderChanged: changed,
    origCount: origList.length,
    shufCount: shufList.length
  });
});

document.getElementById('output-box').textContent = 'RES:' + JSON.stringify(results) + ':RES';
</script>
</body>
</html>`;

fs.writeFileSync('scratch/test_exported_in_chrome.html', testHtml);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.resolve('scratch/test_exported_in_chrome.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
const output = execSync(cmd, { encoding: 'utf8' });
const match = output.match(/RES:([\s\S]*?):RES/);
if (match) {
  console.log('Results in Chrome:');
  console.log(JSON.stringify(JSON.parse(match[1]), null, 2));
} else {
  console.log('No match found');
}

