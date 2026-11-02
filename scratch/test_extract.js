const fs = require('fs');
const { execSync } = require('child_process');

const content = fs.readFileSync('scratch/test_real_slides.html', 'utf8');
// replace the document.getElementById('results') with console.log so we can read it easily
const updated = content.replace("document.getElementById('results').textContent = JSON.stringify(results, null, 2);", "console.log('RESULTS_START' + JSON.stringify(results) + 'RESULTS_END');");
fs.writeFileSync('scratch/test_real_slides_console.html', updated);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');
const filePath = path.resolve('scratch/test_real_slides_console.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
// Wait, console.log in Chrome goes to stdout in headless? Let's check or write it to a pre and extract it.

