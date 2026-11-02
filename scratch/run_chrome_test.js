const { execSync } = require('child_process');
const path = require('path');

const filePath = path.resolve('scratch/test_chrome.html').replace(/\\/g, '/');
try {
  const output = execSync(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --disable-gpu --dump-dom "file:///${filePath}"`, { encoding: 'utf8' });
  console.log('Chrome execution success:');
  console.log(output);
} catch(e) {
  console.error('Error running Chrome:', e.message);
}
