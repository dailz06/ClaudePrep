/* Headless generator test for a built practice page.
   Usage: node selftest-node.js "path/to/page.html" [runsPerType]
   Runs every question generator many times outside the browser and reports:
   crashes, NaN/undefined in text, non-finite numeric answers, MCQs whose correct
   answer is missing or duplicated, text questions that reject their own answer,
   and anything the content logs with console.warn. */
const fs = require('fs');
const [, , file, runsArg] = process.argv;
if (!file) { console.log('usage: node selftest-node.js page.html [runs]'); process.exit(1); }
const runs = +runsArg || 200;
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
// scripts[0] = helpers, scripts[1] = content, scripts[2] = engine core (DOM-heavy, skipped)
const warns = [];
const sandbox = {
  document: { head: { insertAdjacentHTML() {} } },
  console: { ...console, warn: (...a) => warns.push(a.join(' ')) },
};
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(scripts[0] + '\n' + scripts[1] + '\n;this.COURSE=COURSE;this.norm=norm;', sandbox);
const C = sandbox.COURSE;
const strip = s => String(s).replace(/<[^>]+>/g, '');
let types = 0; const bad = [];
for (const c of C.chapters) for (const t of c.topics) for (const y of t.types) {
  types++;
  const key = `${c.id}.${t.id}.${y.id}`;
  for (let i = 0; i < runs; i++) {
    let q;
    try { q = y.gen(); } catch (e) { bad.push(`${key}: crash: ${e.message}`); break; }
    const txt = q.q + ' | ' + (q.sol || '') + ' | ' + (q.choices || []).join(' | ') + ' | ' + (q.items || []).join(' | ');
    const err = (() => {
      if (!q || !q.q) return 'no prompt';
      if (/undefined|\bNaN\b|\[object/.test(txt)) return 'undefined/NaN in text: ' + strip(q.q).slice(0, 120);
      if (q.kind === 'num' && !isFinite(q.ans)) return 'non-finite answer';
      if (q.kind === 'mcq') {
        if (q.correct < 0) return 'correct answer missing';
        if (q.choices.length < 2) return 'only ' + q.choices.length + ' choice(s): ' + strip(q.q).slice(0, 80);
        if (new Set(q.choices.map(strip)).size !== q.choices.length) return 'duplicate choices: ' + q.choices.map(strip).join(' | ');
      }
      if (q.kind === 'text') {
        const a = strip(q.checkAns ?? q.ans);
        const r = q.check ? q.check(a) : (q.accept || [q.ans]).some(x => sandbox.norm(x) === sandbox.norm(a));
        if (!(r === true || (r && r.ok))) return 'rejects own answer "' + a + '" ' + JSON.stringify(r);
      }
      if (q.kind === 'order' && q.items.length < 2) return 'order too short';
      if (q.kind === 'order' && new Set(q.items).size !== q.items.length) return 'duplicate order items';
      return null;
    })();
    if (err) { bad.push(`${key}: ${err}`); break; }
  }
}
console.log(`${types} question types × ${runs} runs`);
if (warns.length) console.log('WARNINGS:\n  ' + [...new Set(warns)].join('\n  '));
if (bad.length) { console.log('FAILURES:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('all generators OK');
