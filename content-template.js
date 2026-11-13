/* =====================================================================
   CONTENT TEMPLATE — copy this file, fill it in, then build:
       python build.py "My Page.html" my-course.js [chapter2.js ...]
   Everything here is plain JavaScript. Engine helpers you can use:
     rand(a,b) r(a,b,dp) ri(a,b) pick(arr) shuffle(arr) pickN(arr,n)
     fx(x,sigfigs) sci(x,sigfigs) fd(x,dp) neg(str) B(html) steps(...lines) norm(str)
   Question constructors (a type's gen() must return one of these):
     num(q, ans, unit, solHTML, {tol:0.02, abs, exact, sig})      numeric answer, ±2% default
     mcq(q, correct, [wrongs], solHTML, {n})                      shuffled multiple choice
     mcqFixed(q, [choices], correctIndex, solHTML)                fixed order (e.g. copied from a slide)
     text(q, ansDisplay, solHTML, {check(str)->bool|{ok,msg}, accept:[...], fmt, wide, placeholder})
     multi(q, [choices], [correctChoices], solHTML)               select all that apply
     order(q, [itemsInCorrectOrder], 'largest → smallest', solHTML)  click-to-rank
     poolGen([[q, correct, [wrongs], explanation], ...])          quick concept-check generator
   Solutions: steps('line 1','line 2',...) renders a numbered list; the
   "Another example" button turns each step into a reveal-one-at-a-time step.
   Self-test: open the built page, run __selftest() in the console.
   ===================================================================== */

const COURSE = {
  title: 'Subject Practice',            // <title> and default brand
  brand: 'Practice',                    // short name in the top bar
  storageKey: 'subject-practice-v1',    // change per page so progress does not collide
  eyebrow: 'Exam prep',
  headline: 'Every concept, every question type',
  lead: 'One-paragraph description of what this page covers and where the content came from.',
  masteryStreak: 2,                     // correct-in-a-row to count as mastered
  defaultTol: 0.02,                     // relative tolerance for num()
  // hint(q, v): optional subject-specific feedback for a wrong numeric answer (return '' for none)
  hint: (q, v) => '',
  notes: [                              // panels on the start page (optional)
    {title: 'Sources', html: '<ul><li>Lecture notes, chapters X–Y.</li></ul>'}
  ],
  refTab: 'Reference',                  // tab label for the reference view
  reference: [                          // reference sheet sections (optional)
    {chapter: 'ch1', title: 'Key formulas', html: '<table class="mini"><tr><th>Formula</th><th>Use</th></tr><tr><td class="m">v = d/t</td><td>speed</td></tr></table>'}
  ],
  chapters: []
};

COURSE.chapters.push({
  id: 'ch1', num: 1,                    // id must be unique and CSS-safe
  title: 'Chapter title',
  short: 'Short tab label',
  source: 'From your lecture notes',    // shown next to the chapter label
  color: ['#0a7685', '#3fc3d3'],        // [light theme, dark theme]
  topics: [
    {
      id: 'speed', sec: '1.1', title: 'Speed',
      // LEARN: explain from scratch. Useful classes: <h4> subsections, .idea (key idea box,
      // first <b> becomes its label), .analogy, .eqn, table.mini, .fig > figure > svg + figcaption
      learn: `
        <h4>What speed means</h4>
        <p>Speed is how much distance you cover per unit time.</p>
        <div class="idea"><b>Key idea</b>Speed = distance ÷ time.</div>
        <div class="eqn">v = d / t</div>`,
      traps: ['Convert minutes to hours before dividing if the answer is in km/h.'],
      types: [
        {
          id: 'calc', name: 'Calculate speed', cue: 'Distance and time given.',
          // example is optional: without it, the engine generates one from gen()
          example: {src: 'Lecture example 1.1', q: 'A car travels 120 km in 1.5 h. Find its speed.',
                    steps: ['v = d/t', 'v = 120 km / 1.5 h'], answer: '80 km/h'},
          gen: () => {
            const d = ri(50, 400), t = r(1, 5, 1), v = d / t;
            return num(`A car travels ${d} km in ${t} h. What is its speed?`, v, 'km/h',
              steps('v = d/t', `v = ${d} / ${t} = ${B(fx(v, 3) + ' km/h')}`));
          }
        },
        {
          id: 'cc', name: 'Concept checks', cue: 'Definitions.',
          gen: poolGen([
            ['Speed is…', 'distance per unit time', ['time per unit distance', 'distance × time'], 'v = d/t.']
          ])
        }
      ]
    }
  ]
});
