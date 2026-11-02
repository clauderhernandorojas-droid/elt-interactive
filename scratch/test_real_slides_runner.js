const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load real slides
const loadSlideFromDeck = (filePath, slideIndex) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const m = content.match(/const payload = "([^"]+)";/);
  const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
  return deck[slideIndex].html;
};

const slide1a_1 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html', 0); // buttons
const slide1a_4 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html', 3); // selects
const slide2c_3 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2c.html', 2); // radios
const test1_1 = loadSlideFromDeck('./INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html', 0); // word bank

const testHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<pre id="results"></pre>
<script>
${fs.readFileSync('scratch/test_prototype.html', 'utf8').match(/function shuffleExerciseOptions[\s\S]*?\n\}/)[0]}

const realSlides = [
  { name: '1a.html Slide 1 (Buttons)', html: ${JSON.stringify(slide1a_1)} },
  { name: '1a.html Slide 4 (Selects)', html: ${JSON.stringify(slide1a_4)} },
  { name: '2c.html Slide 3 (Radios)', html: ${JSON.stringify(slide2c_3)} },
  { name: 'Unit 1 Test Slide 1 (Word Bank)', html: ${JSON.stringify(test1_1)} }
];

const results = [];
realSlides.forEach(s => {
  const t0 = performance.now();
  const shuffled = shuffleExerciseOptions(s.html);
  const t1 = performance.now();
  
  // Verify length, presence of DOCTYPE, html tags, script tags
  const origLen = s.html.length;
  const shufLen = shuffled.length;
  const hasDoctype = shuffled.toLowerCase().includes('<!doctype html');
  const hasHtml = shuffled.toLowerCase().includes('<html');
  const hasBody = shuffled.toLowerCase().includes('<body');
  const hasScript = shuffled.toLowerCase().includes('<script');
  
  // Count interactive elements in both
  const p1 = new DOMParser();
  const dOrig = p1.parseFromString(s.html, 'text/html');
  const p2 = new DOMParser();
  const dShuf = p2.parseFromString(shuffled, 'text/html');
  
  const origInputs = dOrig.querySelectorAll('input, select, button[data-option], button[data-question]').length;
  const shufInputs = dShuf.querySelectorAll('input, select, button[data-option], button[data-question]').length;
  
  results.push({
    name: s.name,
    timeMs: (t1 - t0).toFixed(2),
    origLen,
    shufLen,
    hasDoctype,
    hasHtml,
    hasBody,
    hasScript,
    origInputs,
    shufInputs,
    inputsPreserved: origInputs === shufInputs
  });
});

document.getElementById('results').textContent = JSON.stringify(results, null, 2);
</script>
</body>
</html>`;

fs.writeFileSync('scratch/test_real_slides.html', testHtml);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.resolve('scratch/test_real_slides.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
const output = execSync(cmd, { encoding: 'utf8' });
console.log(output);

