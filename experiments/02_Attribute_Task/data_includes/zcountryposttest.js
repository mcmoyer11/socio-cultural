// =====================================================================
// COUNTRY POST-TEST
// Yoked to each participant's own country rankings: shows the country
// they ranked closest to a reference country, and asks what strategy
// they used. Runs AFTER all poop_test trials.
//
// Each participant is asked about 2 reference countries: one Consistent
// and one Inconsistent.
//
// Needs test.js to record each ranking into window.qRank, keyed
// "<Condition>|<ReferenceCountry>" -- see the snippet at the bottom
// of this file's header comment.
//
// Table:
//   countries.csv   Number, TrialType, ReferenceCountry, Condition
//
// Trial labels:
//   countryposttest_intro
//   countryposttest
//   countryposttest_unused   (built but never sequenced)
// =====================================================================
 
window.qRank = window.qRank || {};
window.qSets = window.qSets || {};
 
 
// ---------------------------------------------------------------------
// How many reference countries each participant is asked about, and how
// many rows of each Condition exist in countries.csv
// ---------------------------------------------------------------------
 
const COUNTRY_ELIGIBLE = { Consistent: 4, Inconsistent: 6 };
const COUNTRY_PER_SET  = { Consistent: 1, Inconsistent: 1 };
 
const COUNTRY_FALLBACK_SETS = {
  Consistent:   ["Germany", "Pakistan", "Spain", "United Kingdom"],
  Inconsistent: ["Cyprus", "Iraq", "Sudan", "Armenia", "Egypt", "Morocco"]
};
 
 
// ---------------------------------------------------------------------
// Pick this participant's rows, once, at load
// ---------------------------------------------------------------------
 
function countryPickK(n, k) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return new Set(a.slice(0, Math.min(k, n)));
}
 
const countryChosen = {
  Consistent:   countryPickK(COUNTRY_ELIGIBLE.Consistent,   COUNTRY_PER_SET.Consistent),
  Inconsistent: countryPickK(COUNTRY_ELIGIBLE.Inconsistent, COUNTRY_PER_SET.Inconsistent)
};
 
const countryIndex = { Consistent: 0, Inconsistent: 0 };
 
var countryUid = 0;
 
 
// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
 
// Results files are comma-separated: strip commas and newlines
function countryClean(s) {
  return (s || "").replace(/[\r\n,]+/g, " ").trim();
}
 
function countryVal(id) {
  const el = document.getElementById(id);
  return el ? countryClean(el.value) : "";
}
 
function countryEscape(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
 
 
// ---------------------------------------------------------------------
// Intro
// ---------------------------------------------------------------------
 
newTrial("countryposttest_intro",
 
  newText("countryIntroTitle", "<b>One last set of questions</b>")
    .center()
    .css("font-size", "26px")
    .print(),
 
  newText("countryIntro",
    "<div style='max-width:640px; text-align:left; margin:0 auto; font-size:17px;'>" +
    "<p>For a few of the countries you saw, we will show you the country you ranked " +
    "closest, and ask what strategies you used to come to that conclusion.</p>" +
    "<p>There are no right or wrong answers. We are interested in how you thought " +
    "about these questions.</p>" +
    "</div>")
    .center()
    .print(),
 
  newButton("countryIntroNext", "Continue")
    .center()
    .print()
    .wait()
);
 
 
// ---------------------------------------------------------------------
// The question, built at runtime (the ranking isn't known until the
// participant has done the country trials)
// ---------------------------------------------------------------------
 
function countryBuildQuestion(prefix, set, country, tries = 0) {
 
  const holder = document.getElementById(prefix + "_holder");
 
  if (!holder) {
    if (tries < 200) {
      setTimeout(() => countryBuildQuestion(prefix, set, country, tries + 1), 25);
    } else {
      console.error("[countryposttest] missing holder:", prefix);
    }
    return;
  }
 
  const rec = window.qRank[set + "|" + country];
  const top = rec && rec.top;
 
  if (!top) {
    holder.innerHTML =
      "<p style='font-size:20px; text-align:center;'>We could not retrieve your " +
      "earlier answer for <strong>" + countryEscape(country) + "</strong>. " +
      "Please continue.</p>";
    return;
  }
 
  holder.innerHTML = `
    <div style="max-width:640px; margin:0 auto; text-align:left;">
 
      <p style="font-size:20px;">
        Earlier, you ranked <strong>${countryEscape(top)}</strong> as closest to
        <strong>${countryEscape(country)}</strong>.
      </p>
 
      <p style="font-size:20px;">
        What strategies did you use to decide that
        <strong>${countryEscape(top)}</strong> was the closest to
        <strong>${countryEscape(country)}</strong>?
      </p>
 
      <p style="text-align:center;">
        <input type="text" id="${prefix}_obj" autocomplete="off"
               style="width:420px; padding:6px; font-size:18px;">
      </p>
 
    </div>`;
 
  const inp = document.getElementById(prefix + "_obj");
  if (inp) inp.focus();
}
 
function countryQ1Done(prefix) {
  const el = document.getElementById(prefix + "_obj");
  if (!el) return true;                      // nothing to answer (retrieval failed)
  return countryVal(prefix + "_obj").length > 0;
}
 
 
// ---------------------------------------------------------------------
// One post-test trial
// ---------------------------------------------------------------------
 
function countryTrial(label, set, row) {
 
  const prefix  = "country_" + (countryUid++);
  const country = row.ReferenceCountry;
 
  const trial = newTrial(
    label,
 
    newText("countryHolder", `<div id="${prefix}_holder"></div>`)
      .center()
      .print(),
 
    newFunction("countryQ1", () => countryBuildQuestion(prefix, set, country)).call(),
 
    newText("countryWarn", "")
      .center()
      .css("color", "#b00020")
      .print(),
 
    newButton("countryNext1", "Continue")
      .center()
      .print()
      .wait(
        newFunction("countryCheck1", () => countryQ1Done(prefix))
          .test.is(true)
          .failure( getText("countryWarn").text(
            'Please type an answer, or write "not sure" if nothing comes to mind.') )
      ),
 
    newVar("countryStrategy").global().set(() => countryVal(prefix + "_obj") || "NA"),
    newVar("countryTop").global().set(() => (window.qRank[set + "|" + country] || {}).top || "NA"),
    newVar("countryRank").global().set(() => (window.qRank[set + "|" + country] || {}).ranking || "NA")
  )
    .log("Number", row.Number)
    .log("ReferenceCountry", country)
    .log("Condition", set)
    .log("TopCountry", getVar("countryTop"))
    .log("FullRanking", getVar("countryRank"))
    .log("Strategy", getVar("countryStrategy"));
 
  return trial;
}
 
 
// ---------------------------------------------------------------------
// Build the trials: one per selected row of countries.csv.
// Rows that aren't selected get a label that is never in the Sequence.
// ---------------------------------------------------------------------
 
Template(
  GetTable("countries.csv"),
 
  row => {
 
    const set = row.Condition;
 
    if (set !== "Consistent" && set !== "Inconsistent") {
      return newTrial("countryposttest_unused");
    }
 
    const i = countryIndex[set]++;
 
    return countryChosen[set].has(i)
      ? countryTrial("countryposttest", set, row)
      : newTrial("countryposttest_unused");
  }
);