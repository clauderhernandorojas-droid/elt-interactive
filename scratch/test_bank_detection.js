const fs = require('fs');
const test1_1 = fs.readFileSync('scratch/test_verify_order.html', 'utf8');

// Let's inspect how the word bank can be detected in Unit 1 Test Slide 1
const testScript = `
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const content = fs.readFileSync('./INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html', 'utf8');
const m = content.match(/const payload = "([^"]+)";/);
const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
const s1 = deck[0].html;

const testHtml = \`<!DOCTYPE html>
<html><body><div id="res"></div>
<script>
const parser = new DOMParser();
const doc = parser.parseFromString(\\\`\${s1.replace(/\\\\/g, '\\\\\\\\').replace(/\\\`/g, '\\\\\\\`').replace(/<\\/script/gi, '<\\\\/script')}\\\`, 'text/html');

const candidateContainers = new Set(doc.querySelectorAll('.word-bank, .wordbank, [data-word-bank], .chips-container, [data-chips], [data-matching-options], .matching-options, .match-targets'));

// Also check for elements whose text indicates a bank
doc.querySelectorAll('span, h2, h3, h4, h5, div, p').forEach(el => {
  if (el.children.length === 0 && /\\b(word|vocabulary|adverb|verbs?)\\s*bank\\b:?/i.test(el.textContent.trim())) {
    if (el.parentElement) candidateContainers.add(el.parentElement);
  }
});

let found = [];
candidateContainers.forEach(cont => {
  const children = Array.from(cont.children);
  const chips = children.filter(c => {
    const text = c.textContent.trim();
    if (/\\b(word|vocabulary|adverb|verbs?)\\s*bank\\b:?/i.test(text)) return false;
    return true;
  });
  found.push({
    tag: cont.tagName,
    classes: cont.className,
    chipCount: chips.length,
    chips: chips.map(c => c.textContent.trim())
  });
});

document.getElementById('res').textContent = JSON.stringify(found, null, 2);
<\\/script>
</body></html>\`;

fs.writeFileSync('scratch/test_detect_bank.html', testHtml);
const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const filePath = path.resolve('scratch/test_detect_bank.html').replace(/\\\\/g, '/');
const cmd = \\\`"\${chromePath}" --headless --disable-gpu --dump-dom "file:///\${filePath}"\\\`;
const out = execSync(cmd, { encoding: 'utf8' });
console.log(out.match(/<div id="res">([\\s\\S]*?)<\\/div>/)[1]);
`;

fs.writeFileSync('scratch/run_detect_bank.js', testScript);

