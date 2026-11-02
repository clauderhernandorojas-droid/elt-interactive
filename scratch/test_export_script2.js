const fs = require('fs');

// In exportDeckPackage, the string is created by:
// '    function shuffleExerciseOptions(rawHtml) {\\n' +
// ...

const lines = [
  '    function shuffleExerciseOptions(rawHtml) {',
  '      if (!rawHtml || typeof rawHtml !== "string") return rawHtml;',
  '      try {',
  '        const parser = new DOMParser();',
  '        const doc = parser.parseFromString(rawHtml, "text/html");',
  '        function fyShuffle(arr) {',
  '          for (let i = arr.length - 1; i > 0; i--) {',
  '            const j = Math.floor(Math.random() * (i + 1));',
  '            const t = arr[i]; arr[i] = arr[j]; arr[j] = t;',
  '          }',
  '          return arr;',
  '        }',
  '        function shuffleElements(elements, parent) {',
  '          if (!elements || elements.length <= 1) return;',
  '          const p = parent || elements[0].parentElement;',
  '          if (!p) return;',
  '          const anchor = document.createComment("shuffle-anchor");',
  '          p.insertBefore(anchor, elements[0]);',
  '          const shuffled = fyShuffle(elements.slice(0));',
  '          let ref = anchor;',
  '          shuffled.forEach(el => { p.insertBefore(el, ref.nextSibling); ref = el; });',
  '          anchor.remove();',
  '        }',
  '        doc.querySelectorAll("select").forEach(sel => {',
  '          const opts = Array.from(sel.querySelectorAll("option"));',
  '          if (opts.length <= 2) return;',
  '          const first = opts[0];',
  '          const isPlh = first.value === "" || /--|select|choose|elige/i.test(first.textContent) || (!first.hasAttribute("data-answer") && !first.hasAttribute("data-correct") && !first.value.trim());',
  '          const toShuffle = isPlh ? opts.slice(1) : opts.slice(0);',
  '          if (toShuffle.length <= 1) return;',
  '          fyShuffle(toShuffle);',
  '          if (isPlh) sel.appendChild(first);',
  '          toShuffle.forEach(o => sel.appendChild(o));',
  '        });',
  '        const radioGroups = {};',
  '        doc.querySelectorAll("input[type=radio][name]").forEach(r => {',
  '          const name = r.getAttribute("name");',
  '          if (!radioGroups[name]) radioGroups[name] = [];',
  '          radioGroups[name].push(r);',
  '        });',
  '        Object.values(radioGroups).forEach(radios => {',
  '          if (radios.length <= 1) return;',
  '          const items = radios.map(r => r.closest("label") || r.closest(".radio-option") || r.parentElement || r);',
  '          const parent = items[0].parentElement;',
  '          if (!parent) return;',
  '          if (items.every(it => it.parentElement === parent) && (new Set(items)).size === items.length) {',
  '            shuffleElements(items, parent);',
  '          }',
  '        });',
  '        const btnGroups = {};',
  '        doc.querySelectorAll("button[data-question], button[data-q], button[data-item]").forEach(btn => {',
  '          if (btn.matches("#check-btn, #reset-btn, [onclick*=check], [onclick*=reset], [onclick*=toggle]")) return;',
  '          const q = btn.getAttribute("data-question") || btn.getAttribute("data-q") || btn.getAttribute("data-item");',
  '          if (!btnGroups[q]) btnGroups[q] = [];',
  '          btnGroups[q].push(btn);',
  '        });',
  '        const shuffledParents = new Set();',
  '        Object.values(btnGroups).forEach(btns => {',
  '          if (btns.length <= 1) return;',
  '          const parent = btns[0].parentElement;',
  '          if (parent && btns.every(b => b.parentElement === parent)) {',
  '            shuffleElements(btns, parent);',
  '            shuffledParents.add(parent);',
  '          }',
  '        });',
  '        doc.querySelectorAll(".options-group, .choice-group, .btn-group, [data-choice-group], [data-options], [id^=options-]").forEach(cont => {',
  '          if (shuffledParents.has(cont)) return;',
  '          const btns = Array.from(cont.querySelectorAll("button:not(#check-btn):not(#reset-btn):not([onclick*=check]):not([onclick*=reset]):not([onclick*=toggle])"));',
  '          if (btns.length > 1) {',
  '            const directParent = btns[0].parentElement;',
  '            if (directParent && btns.every(b => b.parentElement === directParent)) {',
  '              shuffleElements(btns, directParent);',
  '              shuffledParents.add(directParent);',
  '            }',
  '          }',
  '        });',
  '        const bankContainers = new Set(doc.querySelectorAll(".word-bank, .wordbank, [data-word-bank], .chips-container, [data-chips], [data-matching-options], .matching-options, .match-targets, .matching-targets, .matching-column"));',
  '        doc.querySelectorAll("span, h2, h3, h4, h5, div, p").forEach(el => {',
  '          if (el.children.length === 0 && /(word|vocabulary|adverb|verbs?)\\s*bank:?/i.test(el.textContent.trim())) {',
  '            if (el.parentElement) bankContainers.add(el.parentElement);',
  '          }',
  '        });',
  '        bankContainers.forEach(bank => {',
  '          const chips = Array.from(bank.children).filter(c => {',
  '            const text = c.textContent.trim();',
  '            if (/(word|vocabulary|adverb|verbs?)\\s*bank:?/i.test(text)) return false;',
  '            if (c.matches("h1, h2, h3, h4, h5, h6, [class*=uppercase]") && (text.includes(":") || /bank/i.test(text))) return false;',
  '            return true;',
  '          });',
  '          if (chips.length > 1) shuffleElements(chips, bank);',
  '        });',
  '        const docTypeStr = (rawHtml.trim().startsWith("<!DOCTYPE") || doc.doctype) ? "<!DOCTYPE html>\\\\n" : "";',
  '        return docTypeStr + doc.documentElement.outerHTML;',
  '      } catch (err) {',
  '        console.warn("Error in shuffleExerciseOptions:", err);',
  '        return rawHtml;',
  '      }',
  '    }',
  '    const shuffleSelects = shuffleExerciseOptions;'
];

// Let's format for single-quoted concat in exportDeckPackage
const formatted = lines.map(l => `'${l.replace(/\\/g, '\\\\')}\\n' +`).join('\n');
fs.writeFileSync('scratch/export_snippet_clean.js', formatted);

// Test eval
const code = eval(formatted.slice(0, -2));
console.log('Code length:', code.length);
try {
  new Function('rawHtml', code + '\nreturn shuffleExerciseOptions(rawHtml);');
  console.log('SUCCESS! Function is syntactically valid JavaScript!');
} catch (e) {
  console.error('FAILED:', e);
}

