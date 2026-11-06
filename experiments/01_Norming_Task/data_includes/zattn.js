// =====================================================================
// ATTENTION CHECKS  (label: "attn")
//
// Each check names a target value for EVERY slider, e.g.
//   "set slider 1 to 20%, slider 2 to 20%, slider 3 to 20%, slider 4 to 40%"
//
// Participants can always continue, right or wrong. Each trial logs
// whether it was passed, and a running count of failures.
//
// Table:
//   attn.csv   Number, Slider, Percentage, Condition
//     Slider      semicolon-separated slider numbers, e.g.  1;2;3;4
//     Percentage  semicolon-separated targets in the same order
// =====================================================================
 
var attnTrialUid = 0;          // unique HTML ids per trial
 
window.attnFails = 0;          // running count of failed checks
window.attnTotal = 0;          // running count of checks seen
 
const ATTN_TOLERANCE = 0;      // 0 = exact match required
 
 
// ---------------------------------------------------------------------
// Sliders: one per item, 0-100 in steps of 10, starting at 0
// ---------------------------------------------------------------------
 
function attnSlidersHtml(prefix, n) {
 
  let html = '<div style="margin:20px auto; width:460px;">';
 
  for (let i = 0; i < n; i++) {
    html += `
      <div style="display:flex; align-items:center; margin:14px 0;">
        <label for="${prefix}_s${i}" style="width:110px; text-align:left;">Slider ${i + 1}</label>
        <input type="range" id="${prefix}_s${i}" min="0" max="100" step="10" value="0"
               oninput="window.attnUpdate('${prefix}', ${n})" style="flex:1;">
        <span id="${prefix}_v${i}" style="width:50px; text-align:right;">0%</span>
      </div>`;
  }
 
  html += `<p id="${prefix}_total" style="margin-top:20px; font-weight:bold; color:#b00020;">
             Total: 0 / 100 (too low: add 100 more)
           </p>`;
 
  return html + '</div>';
}
 
// Called straight from each slider's oninput attribute, so there is no
// listener to attach and nothing to time wrong.
window.attnUpdate = function (prefix, n) {
 
  for (let i = 0; i < n; i++) {
    const out = document.getElementById(prefix + "_v" + i);
    const sl  = document.getElementById(prefix + "_s" + i);
    if (out && sl) out.textContent = sl.value + "%";
  }
 
  const totalLine = document.getElementById(prefix + "_total");
  if (!totalLine) return;
 
  let total = 0;
  for (let i = 0; i < n; i++) {
    const sl = document.getElementById(prefix + "_s" + i);
    if (sl) total += parseInt(sl.value);
  }
 
  if (total < 100) {
    totalLine.textContent = "Total: " + total + " / 100 (too low: add " + (100 - total) + " more)";
    totalLine.style.color = "#b00020";
  } else if (total > 100) {
    totalLine.textContent = "Total: " + total + " / 100 (too high: remove " + (total - 100) + ")";
    totalLine.style.color = "#b00020";
  } else {
    totalLine.textContent = "Total: 100 / 100";
    totalLine.style.color = "#1b7f3b";
  }
};
 
function attnValue(prefix, i) {
  const el = document.getElementById(prefix + "_s" + i);
  return el ? parseInt(el.value) : 0;
}
 
function attnTotal(prefix, n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += attnValue(prefix, i);
  return total;
}
 
// Live read-out next to each slider, plus a running total (informational
// only: it never blocks the Continue button)
function attnWatch(prefix, n, tries = 0) {
 
  try {
 
    const first     = document.getElementById(prefix + "_s0");
    const totalLine = document.getElementById(prefix + "_total");
 
    // Page not drawn yet: try again shortly
    if (!first || !totalLine) {
      if (tries < 200) setTimeout(() => attnWatch(prefix, n, tries + 1), 25);
      else console.error("[attn] sliders never appeared for", prefix);
      return;
    }
 
    // The sliders call window.attnUpdate themselves; this is the first paint
    window.attnUpdate(prefix, n);
 
  } catch (err) {
    console.error("[attn] watch failed for", prefix, err);
  }
}
 
 
// ---------------------------------------------------------------------
// Answers, and whether they match the instruction
// ---------------------------------------------------------------------
 
function attnAnswers(prefix, n) {
  return [...Array(n).keys()].map(i => attnValue(prefix, i));
}
 
function attnPassed(prefix, sliders, targets) {
  return sliders.every((s, k) =>
    Math.abs(attnValue(prefix, s - 1) - targets[k]) <= ATTN_TOLERANCE
  );
}
 
 
// ---------------------------------------------------------------------
// One attention check
// ---------------------------------------------------------------------
 
Template(
  GetTable("attn.csv"),
 
  row => {
 
    const label   = "attn";
    const prefix  = label + "_" + (attnTrialUid++);      // unique per trial
    const sliders = String(row.Slider || "")
                      .split(";").map(s => parseInt(s.trim()))
                      .filter(x => Number.isFinite(x));
 
    const targets = String(row.Percentage || "")
                      .split(";").map(s => parseInt(s.trim()))
                      .filter(x => Number.isFinite(x));
 
    // How many sliders to show: the highest one named, but never fewer
    // than the number of targets, and never fewer than 1
    const n = Math.max(1, sliders.length ? Math.max(...sliders) : 0, targets.length);
 
    console.log("[attn] row", row.Number, "sliders:", sliders, "targets:", targets, "n =", n);
 
    // "slider 1 to 20%, slider 2 to 20%, slider 3 to 20% and slider 4 to 40%"
    const parts = sliders.map((s, k) =>
      "slider " + s + " to <strong>" + targets[k] + "%</strong>");
 
    const instruction = parts.length > 1
      ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1]
      : (parts[0] || "the sliders as instructed");
 
    const trial = newTrial(
      label,
 
      newText("attnQuestion",
        "To show that you are reading the questions carefully, please set " +
        instruction + ".")
        .center()
        .css("font-size", "20px")
        .print(),
 
      newText("attnSpacer", "<br>").print(),
 
      newText("attnSliders", attnSlidersHtml(prefix, n))
        .center()
        .print(),
 
      // Printed before the watch is wired up, so it is always on screen
      newButton("attnNext", "Next")
        .center()
        .print(),
 
      newFunction("attnWatch", () => attnWatch(prefix, n)).call(),
 
      // Continue is always allowed: a failed check is data, not a dead end
      getButton("attnNext").wait(),
 
      // Score it, and keep a running tally across the experiment
      newFunction("attnScore", () => {
        window.attnTotal = (window.attnTotal || 0) + 1;
        if (!attnPassed(prefix, sliders, targets)) {
          window.attnFails = (window.attnFails || 0) + 1;
        }
      }).call(),
 
      newVar("attnGiven").global().set(() => attnAnswers(prefix, n).join(";")),
      newVar("attnPass").global().set(() => attnPassed(prefix, sliders, targets) ? 1 : 0),
      newVar("attnFailsSoFar").global().set(() => window.attnFails || 0),
      newVar("attnSeenSoFar").global().set(() => window.attnTotal || 0)
    )
      .log("Number", row.Number)
      .log("Condition", row.Condition)
      .log("AttnSliders", row.Slider)
      .log("AttnTargets", row.Percentage)
      .log("AttnGiven", getVar("attnGiven"))
      .log("AttnPass", getVar("attnPass"))
      .log("AttnFailsSoFar", getVar("attnFailsSoFar"))
      .log("AttnChecksSoFar", getVar("attnSeenSoFar"));
 
    return trial;
  }
);