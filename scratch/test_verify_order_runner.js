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

const safeJson = (val) => JSON.stringify(val).replace(/<\/script/gi, '<\\/script');

const functionCode = `
function shuffleExerciseOptions(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return rawHtml;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // Helper: Fisher-Yates shuffle array in-place
    function fyShuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    // Helper: shuffle a list of DOM elements inside their common parent container
    function shuffleElementsInParent(elements, parent) {
      if (!elements || elements.length <= 1) return;
      const p = parent || elements[0].parentElement;
      if (!p) return;

      const firstEl = elements[0];
      const anchor = document.createComment('shuffle-anchor');
      p.insertBefore(anchor, firstEl);

      const shuffled = fyShuffle(elements.slice(0));

      let ref = anchor;
      shuffled.forEach(el => {
        p.insertBefore(el, ref.nextSibling);
        ref = el;
      });

      anchor.remove();
    }

    // 1. SHUFFLE <select> OPTIONS
    doc.querySelectorAll('select').forEach(sel => {
      const opts = Array.from(sel.querySelectorAll('option'));
      if (opts.length <= 2) return;

      const first = opts[0];
      const isPlh = first.value === '' ||
        /--|select|choose|elige/i.test(first.textContent) ||
        (!first.hasAttribute('data-answer') && !first.hasAttribute('data-correct') && !first.value.trim());

      const toShuffle = isPlh ? opts.slice(1) : opts.slice(0);
      if (toShuffle.length <= 1) return;

      fyShuffle(toShuffle);

      if (isPlh) {
        sel.appendChild(first);
      }
      toShuffle.forEach(o => sel.appendChild(o));
    });

    // 2. SHUFFLE RADIO GROUPS (input[type="radio"])
    const radioGroups = {};
    doc.querySelectorAll('input[type="radio"][name]').forEach(r => {
      const name = r.getAttribute('name');
      if (!radioGroups[name]) radioGroups[name] = [];
      radioGroups[name].push(r);
    });

    Object.values(radioGroups).forEach(radios => {
      if (radios.length <= 1) return;
      const items = radios.map(r => r.closest('label') || r.closest('.radio-option') || r.parentElement || r);
      const parent = items[0].parentElement;
      if (!parent) return;
      const allSameParent = items.every(it => it.parentElement === parent);
      const allUnique = (new Set(items)).size === items.length;
      if (allSameParent && allUnique) {
        shuffleElementsInParent(items, parent);
      }
    });

    // 3. SHUFFLE MULTIPLE CHOICE BUTTONS / GROUPS
    const btnGroups = {};
    const qButtons = doc.querySelectorAll('button[data-question], button[data-q], button[data-item]');
    qButtons.forEach(btn => {
      if (btn.matches('#check-btn, #reset-btn, [onclick*="check"], [onclick*="reset"], [onclick*="toggle"]')) return;
      const q = btn.getAttribute('data-question') || btn.getAttribute('data-q') || btn.getAttribute('data-item');
      if (!btnGroups[q]) btnGroups[q] = [];
      btnGroups[q].push(btn);
    });

    const shuffledBtnParents = new Set();

    Object.values(btnGroups).forEach(btns => {
      if (btns.length <= 1) return;
      const parent = btns[0].parentElement;
      if (!parent) return;
      const allSame = btns.every(b => b.parentElement === parent);
      if (allSame) {
        shuffleElementsInParent(btns, parent);
        shuffledBtnParents.add(parent);
      }
    });

    const choiceContainers = doc.querySelectorAll('.options-group, .choice-group, .btn-group, [data-choice-group], [data-options], [id^="options-"]');
    choiceContainers.forEach(cont => {
      if (shuffledBtnParents.has(cont)) return;
      const btns = Array.from(cont.querySelectorAll('button:not(#check-btn):not(#reset-btn):not([onclick*="check"]):not([onclick*="reset"]):not([onclick*="toggle"])'));
      if (btns.length > 1) {
        const directParent = btns[0].parentElement;
        const allSame = btns.every(b => b.parentElement === directParent);
        if (allSame) {
          shuffleElementsInParent(btns, directParent);
          shuffledBtnParents.add(directParent);
        }
      }
    });

    // 4. SHUFFLE WORD BANKS AND MATCHING CHIP CONTAINERS
    const bankContainers = new Set(doc.querySelectorAll('.word-bank, .wordbank, [data-word-bank], .chips-container, [data-chips], [data-matching-options], .matching-options, .match-targets'));
    doc.querySelectorAll('span, h2, h3, h4, h5, div, p').forEach(el => {
      if (el.children.length === 0 && /\\b(word|vocabulary|adverb|verbs?)\\s*bank\\b:?/i.test(el.textContent.trim())) {
        if (el.parentElement) bankContainers.add(el.parentElement);
      }
    });

    bankContainers.forEach(bank => {
      const children = Array.from(bank.children);
      const chips = children.filter(c => {
        const text = c.textContent.trim();
        if (/\\b(word|vocabulary|adverb|verbs?)\\s*bank\\b:?/i.test(text)) return false;
        if (c.matches('h1, h2, h3, h4, h5, h6, [class*="uppercase"]')) {
          if (text.includes(':') || /bank/i.test(text)) return false;
        }
        return true;
      });

      if (chips.length > 1) {
        shuffleElementsInParent(chips, bank);
      }
    });

    const docTypeStr = (rawHtml.trim().startsWith('<!DOCTYPE') || doc.doctype) ? '<!DOCTYPE html>\\n' : '';
    return docTypeStr + doc.documentElement.outerHTML;
  } catch (err) {
    console.warn('Error in shuffleExerciseOptions:', err);
    return rawHtml;
  }
}
`;

const testHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<div id="output-box"></div>
<script>
${functionCode}

const realSlides = [
  { name: '1a.html Slide 1 (Buttons)', html: ${safeJson(slide1a_1)}, selector: 'button[data-question="1"]' },
  { name: '1a.html Slide 4 (Selects)', html: ${safeJson(slide1a_4)}, selector: 'select option' },
  { name: '2c.html Slide 3 (Radios)', html: ${safeJson(slide2c_3)}, selector: 'input[name="q1"]' },
  { name: 'Unit 1 Test Slide 1 (Word Bank)', html: ${safeJson(test1_1)}, selector: '.flex.flex-wrap.gap-2 span:not(.uppercase)' }
];

const results = [];
realSlides.forEach(s => {
  const p1 = new DOMParser();
  const dOrig = p1.parseFromString(s.html, 'text/html');
  const origList = Array.from(dOrig.querySelectorAll(s.selector)).map(el => el.textContent.trim() || el.value);

  let changed = false;
  let shufList = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    const shuffled = shuffleExerciseOptions(s.html);
    const p2 = new DOMParser();
    const dShuf = p2.parseFromString(shuffled, 'text/html');
    shufList = Array.from(dShuf.querySelectorAll(s.selector)).map(el => el.textContent.trim() || el.value);
    if (JSON.stringify(origList) !== JSON.stringify(shufList)) {
      changed = true;
      break;
    }
  }

  results.push({
    name: s.name,
    origList,
    shufList,
    orderChanged: changed
  });
});

document.getElementById('output-box').textContent = 'RES:' + JSON.stringify(results) + ':RES';
</script>
</body>
</html>`;

fs.writeFileSync('scratch/test_verify_order.html', testHtml);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.resolve('scratch/test_verify_order.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
const output = execSync(cmd, { encoding: 'utf8' });
const match = output.match(/RES:([\s\S]*?):RES/);
if (match) {
  console.log(JSON.stringify(JSON.parse(match[1]), null, 2));
} else {
  console.log('No match found');
}
