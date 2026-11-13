# Practice Skeleton

A reusable engine for interactive study pages: **Learn → Worked examples → Practice** for every topic, plus a mixed exam and a reference sheet. The engine never changes between subjects; each subject is just one or more content files.

## Files

| File | What it is |
|---|---|
| `engine.html` | Template: all CSS, layout, question UI, answer checking, progress tracking, mixed exam, routing. Has `{{TITLE}}` and `/*{{CONTENT}}*/` markers. |
| `build.py` | Inlines content files into the template and writes one self-contained HTML page. |
| `content-template.js` | Minimal, commented example of the content format. Copy it to start a new subject. |
| `selftest-node.js` | Runs every question generator hundreds of times without a browser and reports problems. |

## Make a new subject

1. Copy `content-template.js` next to the subject's notes, for example `Physics/Practice/course.js`.
2. Fill in `COURSE` (title, `storageKey`, notes, reference) and push one object per chapter. Bigger subjects split nicely into `course.js` plus one file per chapter.
3. Build:

   ```bash
   python path/to/build.py "Physics Practice.html" course.js ch1.js ch2.js
   ```

4. Test every generator headlessly (crashes, NaN/undefined, duplicate MCQ choices, text answers that reject themselves, and any `console.warn` from your data checks):

   ```bash
   node path/to/selftest-node.js "Physics Practice.html" 300
   ```

   In the browser, `__selftest()` in the console does a lighter version of the same check.
5. To publish as a claude.ai Artifact, build a second copy with `--artifact` (it drops the document wrapper the Artifact host adds itself) and publish that file. The plain build opens directly from disk.

## Content model

```
COURSE
 ├─ title, brand, storageKey, eyebrow, headline, lead
 ├─ masteryStreak (default 2), defaultTol (default 0.02), hint(q, v)
 ├─ notes:     [{title, html}]                 panels on the Start page
 ├─ reference: [{chapter, title, html}]        Reference tab
 └─ chapters:  [{id, num, title, short, source, color:[light, dark],
                 topics: [{id, sec, title, learn (HTML), traps:[...],
                           types: [{id, name, cue, example?:{src, q, steps:[], answer}, gen(), noExam?}]}]}]
```

Each **question type** has a `gen()` that returns a fresh question every call. The same generator feeds the practice box, the mixed exam and the "Another example" button, so one function gives unlimited worked examples as well as unlimited practice. A static `example` (for instance a sample problem copied from the lecture slides) is optional. Without one, the engine generates the example.

### Question kinds

| Constructor | Use for | Checking |
|---|---|---|
| `num(q, ans, unit, sol, {tol, abs, exact})` | calculations | relative tolerance (2% default), or `abs`, or `exact` |
| `mcq(q, correct, wrongs, sol)` | concept checks, classification | choices are shuffled |
| `mcqFixed(q, choices, i, sol)` | slide questions with fixed A–E order | |
| `text(q, ans, sol, {check, accept, fmt})` | typed answers (formulas, configurations, names) | `check(str)` returns `true`/`false` or `{ok, msg}`; or `accept` list compared with `norm()` |
| `multi(q, choices, correct, sol)` | select all that apply | exact set match |
| `order(q, itemsInOrder, dir, sol)` | ranking | exact sequence |
| `poolGen([[q, correct, wrongs, why], ...])` | quick concept-check banks | |

### Writing good content

- **Learn** sections assume zero background. Build each idea from the one before it, define every term the first time it appears, and use `.idea` boxes for the one sentence to remember.
- **Every type needs a cue** that says how to recognise it on an exam ("the words *at STP*").
- **Solutions** go in `steps(...)`, one line per step, ending with the bolded answer.
- Give `storageKey` a new value for each page, or progress collides between pages.
- Content must not contain the literal text `</script`; the build refuses it.

## Requirements

Python 3 for the build and Node.js for the headless test. The built page is plain HTML/CSS/JS with no dependencies besides Google Fonts.

