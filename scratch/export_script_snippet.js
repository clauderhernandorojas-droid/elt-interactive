'    function shuffleExerciseOptions(rawHtml) {\n' +
'      if (!rawHtml || typeof rawHtml !== "string") return rawHtml;\n' +
'      try {\n' +
'        const parser = new DOMParser();\n' +
'        const doc = parser.parseFromString(rawHtml, "text/html");\n' +
'        function fyShuffle(arr) {\n' +
'          for (let i = arr.length - 1; i > 0; i--) {\n' +
'            const j = Math.floor(Math.random() * (i + 1));\n' +
'            const t = arr[i]; arr[i] = arr[j]; arr[j] = t;\n' +
'          }\n' +
'          return arr;\n' +
'        }\n' +
'        function shuffleElements(elements, parent) {\n' +
'          if (!elements || elements.length <= 1) return;\n' +
'          const p = parent || elements[0].parentElement;\n' +
'          if (!p) return;\n' +
'          const anchor = document.createComment("shuffle-anchor");\n' +
'          p.insertBefore(anchor, elements[0]);\n' +
'          const shuffled = fyShuffle(elements.slice(0));\n' +
'          let ref = anchor;\n' +
'          shuffled.forEach(el => { p.insertBefore(el, ref.nextSibling); ref = el; });\n' +
'          anchor.remove();\n' +
'        }\n' +
'        doc.querySelectorAll("select").forEach(sel => {\n' +
'          const opts = Array.from(sel.querySelectorAll("option"));\n' +
'          if (opts.length <= 2) return;\n' +
'          const first = opts[0];\n' +
'          const isPlh = first.value === "" || /--|select|choose|elige/i.test(first.textContent) || (!first.hasAttribute("data-answer") && !first.hasAttribute("data-correct") && !first.value.trim());\n' +
'          const toShuffle = isPlh ? opts.slice(1) : opts.slice(0);\n' +
'          if (toShuffle.length <= 1) return;\n' +
'          fyShuffle(toShuffle);\n' +
'          if (isPlh) sel.appendChild(first);\n' +
'          toShuffle.forEach(o => sel.appendChild(o));\n' +
'        });\n' +
'        const radioGroups = {};\n' +
'        doc.querySelectorAll("input[type="radio"][name]").forEach(r => {\n' +
'          const name = r.getAttribute("name");\n' +
'          if (!radioGroups[name]) radioGroups[name] = [];\n' +
'          radioGroups[name].push(r);\n' +
'        });\n' +
'        Object.values(radioGroups).forEach(radios => {\n' +
'          if (radios.length <= 1) return;\n' +
'          const items = radios.map(r => r.closest("label") || r.closest(".radio-option") || r.parentElement || r);\n' +
'          const parent = items[0].parentElement;\n' +
'          if (!parent) return;\n' +
'          if (items.every(it => it.parentElement === parent) && (new Set(items)).size === items.length) {\n' +
'            shuffleElements(items, parent);\n' +
'          }\n' +
'        });\n' +
'        const btnGroups = {};\n' +
'        doc.querySelectorAll("button[data-question], button[data-q], button[data-item]").forEach(btn => {\n' +
'          if (btn.matches("#check-btn, #reset-btn, [onclick*="check"], [onclick*="reset"], [onclick*="toggle"]")) return;\n' +
'          const q = btn.getAttribute("data-question") || btn.getAttribute("data-q") || btn.getAttribute("data-item");\n' +
'          if (!btnGroups[q]) btnGroups[q] = [];\n' +
'          btnGroups[q].push(btn);\n' +
'        });\n' +
'        const shuffledParents = new Set();\n' +
'        Object.values(btnGroups).forEach(btns => {\n' +
'          if (btns.length <= 1) return;\n' +
'          const parent = btns[0].parentElement;\n' +
'          if (parent && btns.every(b => b.parentElement === parent)) {\n' +
'            shuffleElements(btns, parent);\n' +
'            shuffledParents.add(parent);\n' +
'          }\n' +
'        });\n' +
'        doc.querySelectorAll(".options-group, .choice-group, .btn-group, [data-choice-group], [data-options], [id^="options-"]").forEach(cont => {\n' +
'          if (shuffledParents.has(cont)) return;\n' +
'          const btns = Array.from(cont.querySelectorAll("button:not(#check-btn):not(#reset-btn):not([onclick*="check"]):not([onclick*="reset"]):not([onclick*="toggle"])"));\n' +
'          if (btns.length > 1) {\n' +
'            const directParent = btns[0].parentElement;\n' +
'            if (directParent && btns.every(b => b.parentElement === directParent)) {\n' +
'              shuffleElements(btns, directParent);\n' +
'              shuffledParents.add(directParent);\n' +
'            }\n' +
'          }\n' +
'        });\n' +
'        const bankContainers = new Set(doc.querySelectorAll(".word-bank, .wordbank, [data-word-bank], .chips-container, [data-chips], [data-matching-options], .matching-options, .match-targets, .matching-targets, .matching-column"));\n' +
'        doc.querySelectorAll("span, h2, h3, h4, h5, div, p").forEach(el => {\n' +
'          if (el.children.length === 0 && /\b(word|vocabulary|adverb|verbs?)\s*bank\b:?/i.test(el.textContent.trim())) {\n' +
'            if (el.parentElement) bankContainers.add(el.parentElement);\n' +
'          }\n' +
'        });\n' +
'        bankContainers.forEach(bank => {\n' +
'          const chips = Array.from(bank.children).filter(c => {\n' +
'            const text = c.textContent.trim();\n' +
'            if (/\b(word|vocabulary|adverb|verbs?)\s*bank\b:?/i.test(text)) return false;\n' +
'            if (c.matches("h1, h2, h3, h4, h5, h6, [class*="uppercase"]") && (text.includes(":") || /bank/i.test(text))) return false;\n' +
'            return true;\n' +
'          });\n' +
'          if (chips.length > 1) shuffleElements(chips, bank);\n' +
'        });\n' +
'        const docTypeStr = (rawHtml.trim().startsWith("<!DOCTYPE") || doc.doctype) ? "<!DOCTYPE html>\n" : "";\n' +
'        return docTypeStr + doc.documentElement.outerHTML;\n' +
'      } catch (err) {\n' +
'        console.warn("Error in shuffleExerciseOptions:", err);\n' +
'        return rawHtml;\n' +
'      }\n' +
'    }\n' +
'    const shuffleSelects = shuffleExerciseOptions;\n' +