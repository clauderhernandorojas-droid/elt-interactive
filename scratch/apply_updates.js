const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');
const crlf = content.includes('\r\n') ? '\r\n' : '\n';

// 1. UPDATE MAIN SHUFFLE FUNCTION & loadSlide
const oldShuffleCode = `    // ==========================================
    // ALEATORIEDAD DE OPCIONES EN MENÚS DESPLEGABLES (<select>)
    // Algoritmo Fisher-Yates respetando la opción neutra inicial y data-answer
    // ==========================================
    function shuffleSelectHtmlOptions(rawHtml) {
      if (!rawHtml || typeof rawHtml !== 'string') return rawHtml;
      return rawHtml.replace(/(<select\\b[^>]*>)([\\s\\S]*?)(<\\/select>)/gi, (match, openTag, innerOptions, closeTag) => {
        const optRegex = /<option\\b[^>]*>[\\s\\S]*?<\\/option>/gi;
        const allOptions = innerOptions.match(optRegex);
        if (!allOptions || allOptions.length <= 2) return match;

        const firstOpt = allOptions[0];
        const isPlaceholder = /value\\s*=\\s*["']["']/i.test(firstOpt) || 
                              /--|select|choose|elige/i.test(firstOpt) ||
                              (!/data-answer|data-correct/i.test(firstOpt) && /value\\s*=\\s*["']\\s*["']/i.test(firstOpt));

        let fixedHeader = '';
        let optionsToShuffle = [];

        if (isPlaceholder) {
          fixedHeader = firstOpt;
          optionsToShuffle = allOptions.slice(1);
        } else {
          optionsToShuffle = allOptions.slice(0);
        }

        if (optionsToShuffle.length <= 1) return match;

        // Algoritmo Fisher-Yates para barajar las opciones
        for (let i = optionsToShuffle.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = optionsToShuffle[i];
          optionsToShuffle[i] = optionsToShuffle[j];
          optionsToShuffle[j] = temp;
        }

        const newInner = (fixedHeader ? fixedHeader : '') + optionsToShuffle.join('');
        return openTag + newInner + closeTag;
      });
    }

    function loadSlide(index, trackHistory = false) {
      if (index < 0 || index >= slides.length) return;
      currentSlideIndex = index;
      renderSlidesList();
      const slideContent = (slides[currentSlideIndex] && slides[currentSlideIndex].html) || '';
      document.getElementById('slideViewer').srcdoc = shuffleSelectHtmlOptions(slideContent);
      if (trackHistory) saveHistorySnapshot();
    }`;

const newShuffleCode = `    // ==========================================
    // ALEATORIEDAD UNIVERSAL DE OPCIONES EN EJERCICIOS
    // Algoritmo Fisher-Yates para select, botones/radios de opción múltiple,
    // bancos de palabras y ejercicios de matching/emparejamiento,
    // preservando atributos de validación (data-answer, data-correct, etc.)
    // ==========================================
    function shuffleExerciseOptions(rawHtml) {
      if (!rawHtml || typeof rawHtml !== 'string') return rawHtml;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        function fyShuffle(arr) {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
          }
          return arr;
        }

        function shuffleElements(elements, parent) {
          if (!elements || elements.length <= 1) return;
          const p = parent || elements[0].parentElement;
          if (!p) return;
          const anchor = document.createComment('shuffle-anchor');
          p.insertBefore(anchor, elements[0]);
          const shuffled = fyShuffle(elements.slice(0));
          let ref = anchor;
          shuffled.forEach(el => { p.insertBefore(el, ref.nextSibling); ref = el; });
          anchor.remove();
        }

        // 1. Menús desplegables (<select>) respetando opción neutra inicial
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
          if (isPlh) sel.appendChild(first);
          toShuffle.forEach(o => sel.appendChild(o));
        });

        // 2. Grupos de inputs de tipo radio (input[type="radio"])
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
          if (items.every(it => it.parentElement === parent) && (new Set(items)).size === items.length) {
            shuffleElements(items, parent);
          }
        });

        // 3. Botones y opciones de selección múltiple (data-question / data-q / data-item)
        const btnGroups = {};
        doc.querySelectorAll('button[data-question], button[data-q], button[data-item]').forEach(btn => {
          if (btn.matches('#check-btn, #reset-btn, [onclick*="check"], [onclick*="reset"], [onclick*="toggle"]')) return;
          const q = btn.getAttribute('data-question') || btn.getAttribute('data-q') || btn.getAttribute('data-item');
          if (!btnGroups[q]) btnGroups[q] = [];
          btnGroups[q].push(btn);
        });
        const shuffledParents = new Set();
        Object.values(btnGroups).forEach(btns => {
          if (btns.length <= 1) return;
          const parent = btns[0].parentElement;
          if (parent && btns.every(b => b.parentElement === parent)) {
            shuffleElements(btns, parent);
            shuffledParents.add(parent);
          }
        });

        // Contenedores de botones de opción (.options-group, .choice-group, .btn-group, [data-choice-group], etc.)
        doc.querySelectorAll('.options-group, .choice-group, .btn-group, [data-choice-group], [data-options], [id^="options-"]').forEach(cont => {
          if (shuffledParents.has(cont)) return;
          const btns = Array.from(cont.querySelectorAll('button:not(#check-btn):not(#reset-btn):not([onclick*="check"]):not([onclick*="reset"]):not([onclick*="toggle"])'));
          if (btns.length > 1) {
            const directParent = btns[0].parentElement;
            if (directParent && btns.every(b => b.parentElement === directParent)) {
              shuffleElements(btns, directParent);
              shuffledParents.add(directParent);
            }
          }
        });

        // 4. Bancos de palabras (Word Banks) y ejercicios de emparejamiento / matching
        const bankContainers = new Set(doc.querySelectorAll('.word-bank, .wordbank, [data-word-bank], .chips-container, [data-chips], [data-matching-options], .matching-options, .match-targets, .matching-targets, .matching-column'));
        doc.querySelectorAll('span, h2, h3, h4, h5, div, p').forEach(el => {
          if (el.children.length === 0 && /(word|vocabulary|adverb|verbs?)\\s*bank:?/i.test(el.textContent.trim())) {
            if (el.parentElement) bankContainers.add(el.parentElement);
          }
        });
        bankContainers.forEach(bank => {
          const chips = Array.from(bank.children).filter(c => {
            const text = c.textContent.trim();
            if (/(word|vocabulary|adverb|verbs?)\\s*bank:?/i.test(text)) return false;
            if (c.matches('h1, h2, h3, h4, h5, h6, [class*="uppercase"]') && (text.includes(':') || /bank/i.test(text))) return false;
            return true;
          });
          if (chips.length > 1) shuffleElements(chips, bank);
        });

        const docTypeStr = (rawHtml.trim().startsWith('<!DOCTYPE') || doc.doctype) ? '<!DOCTYPE html>\\n' : '';
        return docTypeStr + doc.documentElement.outerHTML;
      } catch (err) {
        console.warn('Error in shuffleExerciseOptions:', err);
        return rawHtml;
      }
    }
    const shuffleSelectHtmlOptions = shuffleExerciseOptions;

    function loadSlide(index, trackHistory = false) {
      if (index < 0 || index >= slides.length) return;
      currentSlideIndex = index;
      renderSlidesList();
      const slideContent = (slides[currentSlideIndex] && slides[currentSlideIndex].html) || '';
      document.getElementById('slideViewer').srcdoc = shuffleExerciseOptions(slideContent);
      if (trackHistory) saveHistorySnapshot();
    }`;

// 2. UPDATE visualDirectives
const oldVisual = `   - PROHIBICIÓN ESTRICTA DE PLACEHOLDERS Y RESPUESTAS PRELLENADAS: Queda TERMINANTEMENTE PROHIBIDO incluir respuestas prellenadas, valores por defecto o atributos 'placeholder' con texto de ayuda en los campos de entrada (<input>, <textarea>). Los campos de escritura para el estudiante deben generarse SIEMPRE 100% vacíos (value="" y sin atributo placeholder que contenga respuestas o pistas obvias).`;
const newVisual = `   - PROHIBICIÓN ESTRICTA DE PLACEHOLDERS Y RESPUESTAS PRELLENADAS: Queda TERMINANTEMENTE PROHIBIDO incluir respuestas prellenadas, valores por defecto o atributos 'placeholder' con texto de ayuda en los campos de entrada (<input>, <textarea>). Los campos de escritura para el estudiante deben generarse SIEMPRE 100% vacíos (value="" y sin atributo placeholder que contenga respuestas o pistas obvias).
   - ALEATORIZACIÓN UNIVERSAL DE OPCIONES: La plataforma aplica una aleatorización automática a cualquier ejercicio con opciones (preguntas de opción múltiple con botones o radios, menús desplegables <select>, bancos de palabras y ejercicios de matching/emparejamiento). Por ello, debes generar las opciones con sus atributos de validación claros (ej. data-answer, data-correct, data-option, data-question) asegurando que nunca dependan del orden estático original del libro de texto.`;

// 3. UPDATE systemPrompt
const oldPrompt = `   - PROHIBICIÓN DE PLACEHOLDERS: Los campos de entrada (<input>, <textarea>) deben generarse SIEMPRE 100% vacíos. Está estrictamente prohibido colocar respuestas prellenadas o atributos placeholder con pistas o la solución.`;
const newPrompt = `   - PROHIBICIÓN DE PLACEHOLDERS: Los campos de entrada (<input>, <textarea>) deben generarse SIEMPRE 100% vacíos. Está estrictamente prohibido colocar respuestas prellenadas o atributos placeholder con pistas o la solución.
   - ALEATORIZACIÓN UNIVERSAL DE OPCIONES: La aleatorización se aplica de forma universal a cualquier ejercicio de opciones (opción múltiple con botones o radios, menús desplegables <select>, emparejamiento/matching y bancos de palabras). Diseña siempre las opciones con sus atributos de validación correspondientes (data-answer, data-correct, data-option, data-question, etc.), garantizando que las opciones nunca se presenten en el orden original del libro de texto.`;

// 4. UPDATE exportDeckPackage
const oldExportLines = `'    function shuffleSelects(rawHtml) {\\n' +
'      if (!rawHtml || typeof rawHtml !== "string") return rawHtml;\\n' +
'      return rawHtml.replace(/(<select\\\\b[^>]*>)([\\\\s\\\\S]*?)(<\\\\/select>)/gi, (m, openTag, inner, closeTag) => {\\n' +
'        const opts = inner.match(/<option\\\\b[^>]*>[\\\\s\\\\S]*?<\\\\/option>/gi);\\n' +
'        if (!opts || opts.length <= 2) return m;\\n' +
'        const first = opts[0];\\n' +
'        const isPlh = /value\\\\s*=\\\\s*["\\x27]["\\x27]/i.test(first) || /--|select|choose|elige/i.test(first);\\n' +
'        let header = isPlh ? first : "";\\n' +
'        let toShuffle = isPlh ? opts.slice(1) : opts.slice(0);\\n' +
'        if (toShuffle.length <= 1) return m;\\n' +
'        for (let i = toShuffle.length - 1; i > 0; i--) {\\n' +
'          const j = Math.floor(Math.random() * (i + 1));\\n' +
'          const t = toShuffle[i];\\n' +
'          toShuffle[i] = toShuffle[j];\\n' +
'          toShuffle[j] = t;\\n' +
'        }\\n' +
'        return openTag + (header ? header : "") + toShuffle.join("") + closeTag;\\n' +
'      });\\n' +
'    }\\n' +
'    function show(idx) {\\n' +
'      if (idx < 0 || idx >= deck.length) return;\\n' +
'      current = idx;\\n' +
'      document.getElementById("viewer").srcdoc = shuffleSelects(deck[current].html);\\n' +
'      document.getElementById("counter").textContent = (current + 1) + " / " + deck.length;\\n' +
'    }\\n'`;

const exportSnippet = fs.readFileSync('scratch/export_snippet_clean.js', 'utf8');

const newExportLines = exportSnippet + '\n' +
`'    function show(idx) {\\n' +
'      if (idx < 0 || idx >= deck.length) return;\\n' +
'      current = idx;\\n' +
'      document.getElementById("viewer").srcdoc = shuffleExerciseOptions(deck[current].html);\\n' +
'      document.getElementById("counter").textContent = (current + 1) + " / " + deck.length;\\n' +
'    }\\n'`;

// Normalize line endings for replacement
function norm(str) {
  return str.replace(/\r\n/g, '\n');
}

let normalizedContent = norm(content);

// Check 1: oldShuffleCode
if (!normalizedContent.includes(norm(oldShuffleCode))) {
  console.error('ERROR: oldShuffleCode not found');
  process.exit(1);
}

// Check 2: oldVisual
if (!normalizedContent.includes(norm(oldVisual))) {
  console.error('ERROR: oldVisual not found');
  process.exit(1);
}

// Check 3: oldPrompt
if (!normalizedContent.includes(norm(oldPrompt))) {
  console.error('ERROR: oldPrompt not found');
  process.exit(1);
}

// Check 4: oldExportLines
if (!normalizedContent.includes(norm(oldExportLines))) {
  console.error('ERROR: oldExportLines not found');
  process.exit(1);
}

// Apply replacements
normalizedContent = normalizedContent.replace(norm(oldShuffleCode), norm(newShuffleCode));
normalizedContent = normalizedContent.replace(norm(oldVisual), norm(newVisual));
normalizedContent = normalizedContent.replace(norm(oldPrompt), norm(newPrompt));
normalizedContent = normalizedContent.replace(norm(oldExportLines), norm(newExportLines));

// Restore CRLF if original used CRLF
const finalContent = crlf === '\r\n' ? normalizedContent.replace(/\n/g, '\r\n') : normalizedContent;

fs.writeFileSync('index.html', finalContent, 'utf8');
fs.writeFileSync('ELT INTERACTIVE.html', finalContent, 'utf8');
console.log('SUCCESS: index.html and ELT INTERACTIVE.html updated and synchronized!');

