// =====================================================================
// POST-TEST: reference-class generation, yoked to each participant's
// own top-ranked quantifier. Runs AFTER all ranking trials.
// Each participant is asked about 3 number/set pairs out of 16.
// =====================================================================

window.qRank = window.qRank || {};
window.qSets = window.qSets || {};

// ---------------------------------------------------------------------
// How many pairs each participant sees, and how many are eligible.
// Eligible counts must match number.csv:
//   Low  set = low + intermediate rows
//   High set = high + intermediate rows
// ---------------------------------------------------------------------

const PT_PER_PARTICIPANT = 3;
const PT_ELIGIBLE = { Low: 8, High: 8 };

const PT_FALLBACK_SETS = {
  Low:  ["Some", "A few", "A couple", "Several", "Not many"],
  High: ["A lot", "Tons", "Many", "Quite a few", "A bunch"]
};

// Quantifiers that need "of" before the noun
const PT_TAKES_OF = ["a lot", "tons", "a bunch", "a couple", "a handful", "loads", "plenty"];


// ---------------------------------------------------------------------
// Choose this participant's pairs: 1-2 from one set, the rest from the
// other, so both sets are always represented.
// ---------------------------------------------------------------------

function ptPickK(n, k) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return new Set(a.slice(0, Math.min(k, n)));
}

const ptLowK  = Math.random() < 0.5 ? 1 : 2;
const ptHighK = PT_PER_PARTICIPANT - ptLowK;

const ptChosen = {
  Low:  ptPickK(PT_ELIGIBLE.Low,  ptLowK),
  High: ptPickK(PT_ELIGIBLE.High, ptHighK)
};

const ptIndex  = { Low: 0, High: 0 };
const ptAnswer = {};            // typed noun, keyed by trial prefix
var   ptUid    = 0;


// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------

// Results files are comma-separated: strip commas and newlines
function ptClean(s) {
  return (s || "").replace(/[\r\n,]+/g, " ").trim();
}

function ptVal(id) {
  const el = document.getElementById(id);
  return el ? ptClean(el.value) : "";
}

function ptEscape(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// "A lot" -> "a lot of"; "Many" -> "many"
function ptPhrase(q) {
  const lower = (q || "").toLowerCase();
  return PT_TAKES_OF.includes(lower) ? lower + " of" : lower;
}

function ptSetWords(set) {
  const w = (window.qSets && window.qSets[set]) || [];
  return (w.length ? w : PT_FALLBACK_SETS[set]).join(", ");
}


// ---------------------------------------------------------------------
// Intro
// ---------------------------------------------------------------------

newTrial("posttest_intro",

  newText("ptIntroTitle", "<b>One last set of questions</b>")
    .center()
    .css("font-size", "26px")
    .print(),

  newText("ptIntro",
    "<div style='max-width:640px; text-align:left; margin:0 auto; font-size:17px;'>" +
    "<p>For a few of the numbers you saw, we will show you the word you ranked first, " +
    "and ask you to think of something that number could be describing, so that the " +
    "word sounds natural.</p>" +
    "<p>For example, if you had ranked <i>a pile of</i> first for the number 40, you might " +
    "think of <i>leaves</i>: it sounds natural to say &ldquo;there are a pile of leaves&rdquo; " +
    "about 40 of them.</p>" +
    "<p>There are no right or wrong answers. We are interested in what comes to mind.</p>" +
    "</div>")
    .center()
    .print(),

  newButton("ptIntroNext", "Continue")
    .center()
    .print()
    .wait()
);


// ---------------------------------------------------------------------
// Screen 1: generate a referent
// ---------------------------------------------------------------------

function ptBuildQuestion(prefix, set, number, tries = 0) {

  const holder = document.getElementById(prefix + "_holder");

  if (!holder) {
    if (tries < 200) {
      setTimeout(() => ptBuildQuestion(prefix, set, number, tries + 1), 25);
    } else {
      console.error("[posttest] missing holder:", prefix);
    }
    return;
  }

  const rec = window.qRank[set + "|" + number];
  const top = rec && rec.top;

  if (!top) {
    holder.innerHTML =
      "<p style='font-size:20px; text-align:center;'>We could not retrieve your " +
      "earlier answer for <strong>" + number + "</strong>. Please continue.</p>";
    return;
  }

  holder.innerHTML = `
    <div style="max-width:640px; margin:0 auto; text-align:left;">

      <p style="font-size:20px;">
        Earlier, you ranked <strong>${ptEscape(top)}</strong> first for
        <strong>${number}</strong>.
      </p>

      <p style="font-size:20px;">
        Imagine someone has exactly <strong>${number}</strong> of something, and
        describes them by saying:
      </p>

      <p style="font-size:22px; text-align:center;">
        <em>&ldquo;There are ${ptEscape(ptPhrase(top))} ______.&rdquo;</em>
      </p>

      <p style="font-size:20px;">
        What could the things be, for that to sound natural?
        Write one kind of thing (a plural noun), such as &ldquo;paperclips.&rdquo;
        If nothing comes to mind, write <em>none</em>.
      </p>

      <p style="text-align:center;">
        <input type="text" id="${prefix}_obj" autocomplete="off"
               style="width:360px; padding:6px; font-size:18px;">
      </p>

    </div>`;

  const inp = document.getElementById(prefix + "_obj");
  if (inp) inp.focus();
}

function ptQ1Done(prefix) {
  const el = document.getElementById(prefix + "_obj");
  if (!el) return true;              // nothing to answer (retrieval failed)
  return ptVal(prefix + "_obj").length > 0;
}


// ---------------------------------------------------------------------
// Screen 2: expected quantity for the thing they named
// ---------------------------------------------------------------------

function ptBuildExpected(prefix, tries = 0) {

  const holder = document.getElementById(prefix + "_holder");

  if (!holder) {
    if (tries < 200) setTimeout(() => ptBuildExpected(prefix, tries + 1), 25);
    return;
  }

  const answer = ptAnswer[prefix] || "";

  if (!answer || answer.toLowerCase() === "none") {
    holder.innerHTML =
      "<p style='font-size:20px; text-align:center;'>No follow-up for this one. " +
      "Please continue.</p>";
    return;
  }

  const safe = ptEscape(answer);

  holder.innerHTML = `
    <div style="max-width:640px; margin:0 auto; text-align:left;">

      <p style="font-size:20px;">You said <strong>${safe}</strong>.</p>

      <p style="font-size:20px;">
        If you came across ${safe} somewhere, without knowing anything else about the
        situation, roughly how many would you expect there to be?
        A rough number is fine. If you are not sure, write <em>not sure</em>.
      </p>

      <p style="text-align:center;">
        <input type="text" id="${prefix}_exp" autocomplete="off"
               style="width:200px; padding:6px; font-size:18px;">
      </p>

    </div>`;

  const inp = document.getElementById(prefix + "_exp");
  if (inp) inp.focus();
}

function ptQ2Done(prefix) {
  const el = document.getElementById(prefix + "_exp");
  if (!el) return true;              // screen was skipped
  return ptVal(prefix + "_exp").length > 0;
}


// ---------------------------------------------------------------------
// One post-test trial
// ---------------------------------------------------------------------

function ptTrial(label, set, row) {

  const prefix = "pt_" + (ptUid++);
  const number = row.QuestionNumber;

  return newTrial(
    label,

    newText("ptHolder", `<div id="${prefix}_holder"></div>`)
      .center()
      .print(),

    newFunction("ptQ1", () => ptBuildQuestion(prefix, set, number)).call(),

    newText("ptWarn", "")
      .center()
      .css("color", "#b00020")
      .print(),

    newButton("ptNext1", "Continue")
      .center()
      .print()
      .wait(
        newFunction("ptCheck1", () => ptQ1Done(prefix))
          .test.is(true)
          .failure( getText("ptWarn").text(
            'Please type an answer, or write "none" if nothing comes to mind.') )
      ),

    // Keep the typed noun, then move to the follow-up screen
    newFunction("ptCapture", () => { ptAnswer[prefix] = ptVal(prefix + "_obj"); }).call(),

    getText("ptWarn").text(""),
    getButton("ptNext1").remove(),

    newFunction("ptQ2", () => ptBuildExpected(prefix)).call(),

    newButton("ptNext2", "Continue")
      .center()
      .print()
      .wait(
        newFunction("ptCheck2", () => ptQ2Done(prefix))
          .test.is(true)
          .failure( getText("ptWarn").text(
            'Please give a rough number, or write "not sure".') )
      ),

    newVar("ptObj").global().set(() => ptAnswer[prefix] || "NA"),
    newVar("ptExp").global().set(() => ptVal(prefix + "_exp") || "NA"),
    newVar("ptTop").global().set(() => (window.qRank[set + "|" + number] || {}).top || "NA"),
    newVar("ptRank").global().set(() => (window.qRank[set + "|" + number] || {}).ranking || "NA")
  )
    .log("Number", row.Number)
    .log("QuestionNumber", number)
    .log("NumberType", row.NumberType)
    .log("QuantifierSet", set)
    .log("TopQuantifier", getVar("ptTop"))
    .log("FullRanking", getVar("ptRank"))
    .log("ReferenceObject", getVar("ptObj"))
    .log("ExpectedQuantity", getVar("ptExp"));
}


// ---------------------------------------------------------------------
// Build the trials. Rows that are not eligible, or not selected for this
// participant, get a label that is never in the Sequence.
// ---------------------------------------------------------------------

Template(GetTable("number.csv"), row => {

  const eligible = (row.NumberType === "low" || row.NumberType === "intermediate");
  if (!eligible) return newTrial("posttest_unused");

  const i = ptIndex.Low++;
  return ptTrial(ptChosen.Low.has(i) ? "posttest" : "posttest_unused", "Low", row);
});

Template(GetTable("number.csv"), row => {

  const eligible = (row.NumberType === "high" || row.NumberType === "intermediate");
  if (!eligible) return newTrial("posttest_unused");

  const i = ptIndex.High++;
  return ptTrial(ptChosen.High.has(i) ? "posttest" : "posttest_unused", "High", row);
});


// ---------------------------------------------------------------------
// Final screen: interchangeable pairs, and whether they had an object
// in mind during the ranking task
// ---------------------------------------------------------------------

function ptBuildCheck(tries = 0) {

  const holder = document.getElementById("ptcheck_holder");

  if (!holder) {
    if (tries < 200) setTimeout(() => ptBuildCheck(tries + 1), 25);
    return;
  }

  holder.innerHTML = `
    <div style="max-width:640px; margin:0 auto; text-align:left; font-size:18px;">

      <p>These were the words you sorted for the smaller numbers:<br>
        <strong>${ptEscape(ptSetWords("Low"))}</strong></p>

      <p>Were any of them interchangeable for you &mdash; words that felt like they
        meant the same amount, so that putting one above the other was arbitrary?
        List any such words, or write <em>none</em>.</p>

      <p><input type="text" id="ptc_low" autocomplete="off"
                style="width:420px; padding:6px; font-size:17px;"></p>

      <p style="margin-top:28px;">And these were the words you sorted for the larger numbers:<br>
        <strong>${ptEscape(ptSetWords("High"))}</strong></p>

      <p>Same question: were any of these interchangeable for you?
        List any such words, or write <em>none</em>.</p>

      <p><input type="text" id="ptc_high" autocomplete="off"
                style="width:420px; padding:6px; font-size:17px;"></p>

      <p style="margin-top:28px;">While you were putting the words in order for each
        number, were you thinking of any particular kind of thing?</p>

      <p>
        <label style="margin-right:20px;">
          <input type="radio" name="ptc_obj" value="Yes"> Yes</label>
        <label><input type="radio" name="ptc_obj" value="No"> No</label>
      </p>

      <p>If yes, what was it? If it changed as you went, or if you were not thinking of
        anything in particular, say so.</p>

      <p><input type="text" id="ptc_objwhat" autocomplete="off"
                style="width:420px; padding:6px; font-size:17px;"></p>

    </div>`;
}

function ptCheckDone() {
  const radio = document.querySelector('input[name="ptc_obj"]:checked');
  return ptVal("ptc_low").length > 0 &&
         ptVal("ptc_high").length > 0 &&
         !!radio;
}

newTrial("posttest_check",

  newText("ptcHolder", `<div id="ptcheck_holder"></div>`)
    .center()
    .print(),

  newFunction("ptcBuild", () => ptBuildCheck()).call(),

  newText("ptcWarn", "")
    .center()
    .css("color", "#b00020")
    .print(),

  newButton("ptcNext", "Continue")
    .center()
    .print()
    .wait(
      newFunction("ptcCheck", () => ptCheckDone())
        .test.is(true)
        .failure( getText("ptcWarn").text(
          'Please answer all three questions. Write "none" if that is your answer.') )
    ),

  newVar("ptcLow").global().set(() => ptVal("ptc_low")),
  newVar("ptcHigh").global().set(() => ptVal("ptc_high")),
  newVar("ptcObj").global().set(() => {
    const r = document.querySelector('input[name="ptc_obj"]:checked');
    return r ? r.value : "NA";
  }),
  newVar("ptcObjWhat").global().set(() => ptVal("ptc_objwhat"))
)
  .log("InterchangeableLow", getVar("ptcLow"))
  .log("InterchangeableHigh", getVar("ptcHigh"))
  .log("ObjectInMind", getVar("ptcObj"))
  .log("ObjectInMindDetail", getVar("ptcObjWhat"));