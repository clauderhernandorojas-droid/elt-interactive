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

// Escape </script> as <\/script> for safe embedding
const safeJson = (val) => JSON.stringify(val).replace(/<\/script/gi, '<\\/script');

const protoCode = fs.readFileSync('scratch/test_prototype.html', 'utf8').match(/function shuffleExerciseOptions[\s\S]*?\n\}/)[0];

const testHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<div id="output-box"></div>
<script>
window.onerror = function(msg, url, line) {
  document.getElementById('output-box').textContent = 'ERROR: ' + msg + ' line ' + line;
};

${protoCode}

const realSlides = [
  { name: '1a.html Slide 1 (Buttons)', html: ${safeJson(slide1a_1)} },
  { name: '1a.html Slide 4 (Selects)', html: ${safeJson(slide1a_4)} },
  { name: '2c.html Slide 3 (Radios)', html: ${safeJson(slide2c_3)} },
  { name: 'Unit 1 Test Slide 1 (Word Bank)', html: ${safeJson(test1_1)} }
];

const results = [];
realSlides.forEach(s => {
  const t0 = performance.now();
  const shuffled = shuffleExerciseOptions(s.html);
  const t1 = performance.now();
  
  const p1 = new DOMParser();
  const dOrig = p1.parseFromString(s.html, 'text/html');
  const p2 = new DOMParser();
  const dShuf = p2.parseFromString(shuffled, 'text/html');
  
  const origInputs = dOrig.querySelectorAll('input, select, button[data-option], button[data-question]').length;
  const shufInputs = dShuf.querySelectorAll('input, select, button[data-option], button[data-question]').length;
  
  results.push({
    name: s.name,
    timeMs: (t1 - t0).toFixed(2),
    hasDoctype: shuffled.toLowerCase().includes('<!doctype html'),
    hasHtml: shuffled.toLowerCase().includes('<html'),
    hasBody: shuffled.toLowerCase().includes('<body'),
    hasScript: shuffled.toLowerCase().includes('<script'),
    origInputs,
    shufInputs,
    preserved: origInputs === shufInputs
  });
});

document.getElementById('output-box').textContent = 'RES:' + JSON.stringify(results) + ':RES';
</script>
</body>
</html>`;

fs.writeFileSync('scratch/test_verify_real.html', testHtml);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.resolve('scratch/test_verify_real.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
const output = execSync(cmd, { encoding: 'utf8' });
const match = output.match(/RES:([\s\S]*?):RES/);
if (match) {
  console.log('Results parsed:');
  console.log(JSON.stringify(JSON.parse(match[1]), null, 2));
} else {
  console.log('No match. First 500 chars:');
  console.log(output.slice(0, 500));
}
