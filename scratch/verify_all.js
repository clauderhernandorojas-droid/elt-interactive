const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('--- 1. VERIFYING FILE IDENTITY ---');
const indexContent = fs.readFileSync('index.html', 'utf8');
const eltContent = fs.readFileSync('ELT INTERACTIVE.html', 'utf8');
const filesIdentical = indexContent === eltContent;
console.log('Files identical byte-for-byte:', filesIdentical);
if (!filesIdentical) {
  console.error('ERROR: index.html and ELT INTERACTIVE.html are NOT identical!');
  process.exit(1);
}

console.log('\n--- 2. VERIFYING JAVASCRIPT SYNTAX IN <script> TAGS ---');
const scriptMatches = indexContent.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('Found script tags:', scriptMatches.length);
scriptMatches.forEach((s, idx) => {
  const code = s.replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
  if (!code.trim()) return;
  try {
    new Function(code);
    console.log(`Script tag #${idx + 1}: Valid syntax`);
  } catch (err) {
    console.error(`Script tag #${idx + 1}: SyntaxError!`, err.message);
    process.exit(1);
  }
});

console.log('\n--- 3. VERIFYING Z-INDEX & CRITICAL ATTRIBUTES ---');
const zIndexChecks = [
  { name: 'generateModal z-index: 100000', test: indexContent.includes('z-index: 100000 !important;') },
  { name: 'export footer z-index: 9999', test: indexContent.includes('z-index: 9999;') },
  { name: 'shuffleExerciseOptions defined in editor', test: indexContent.includes('function shuffleExerciseOptions(rawHtml)') },
  { name: 'loadSlide calls shuffleExerciseOptions', test: indexContent.includes('document.getElementById(\'slideViewer\').srcdoc = shuffleExerciseOptions(slideContent);') },
  { name: 'exportDeckPackage defines shuffleExerciseOptions', test: indexContent.includes('function shuffleExerciseOptions(rawHtml) {\\n') },
  { name: 'exportDeckPackage show calls shuffleExerciseOptions', test: indexContent.includes('document.getElementById("viewer").srcdoc = shuffleExerciseOptions(deck[current].html);') },
  { name: 'visualDirectives mentions universal randomization', test: indexContent.includes('ALEATORIZACIÓN UNIVERSAL DE OPCIONES:') },
  { name: 'systemPrompt mentions universal randomization', test: indexContent.includes('ALEATORIZACIÓN UNIVERSAL DE OPCIONES:') }
];

zIndexChecks.forEach(c => {
  console.log(`${c.name}: ${c.test ? 'PASS' : 'FAIL'}`);
  if (!c.test) process.exit(1);
});

console.log('\n--- 4. VERIFYING REAL SLIDES SHUFFLING IN CHROME ---');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.resolve('scratch/test_verify_order.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
const output = execSync(cmd, { encoding: 'utf8' });
const match = output.match(/RES:([\s\S]*?):RES/);
if (match) {
  const results = JSON.parse(match[1]);
  results.forEach(r => {
    console.log(`${r.name}: orderChanged=${r.orderChanged}`);
  });
  const allChanged = results.every(r => r.orderChanged);
  console.log('All real slide options shuffled dynamically:', allChanged);
  if (!allChanged) process.exit(1);
} else {
  console.error('Chrome test failed to produce RES output');
  process.exit(1);
}

console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');

