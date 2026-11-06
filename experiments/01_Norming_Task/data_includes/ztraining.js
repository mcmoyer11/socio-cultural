// =====================================================================
// TRAINING TRIALS  (label: "training")
//
// Five marble pictures, in order of difficulty: one 2-colour picture,
// three 3-colour pictures, one 4-colour picture. Participants set one
// slider per colour; the sliders must total 100 AND match the picture
// before they can continue, so the training actually teaches the task.
//
// Table:
//   training.csv   Number, Image, Colors, Correct, NColors
//     Colors   semicolon-separated, e.g.  Blue;Green;Pink
//     Correct  semicolon-separated percentages in the same order
//
// Every name here is tr-prefixed so nothing collides with the test
// trials (test.js), the attention check (zattn.js) or practice.
// =====================================================================
 
var trTrialUid = 0;                 // unique HTML ids per trial
const trAttempts = {};              // wrong attempts, keyed by trial prefix
const trFinal    = {};              // final slider values, kept after the sliders are removed
 
const TR_MARBLE_TOTAL = 10;         // marbles per picture
 
 
// ---------------------------------------------------------------------
// Sliders: one per colour, 0-100 in steps of 10, starting at 0
// ---------------------------------------------------------------------
 
function trSlidersHtml(prefix, colors) {
 
  let html = '<div style="margin:20px auto; width:460px;">';
 
  colors.forEach((color, i) => {
    html += `
      <div style="display:flex; align-items:center; margin:14px 0;">
        <label for="${prefix}_s${i}" style="width:110px; text-align:left;">${color}</label>
        <input type="range" id="${prefix}_s${i}" min="0" max="100" step="10" value="0" style="flex:1;">
        <span id="${prefix}_v${i}" style="width:50px; text-align:right;">0%</span>
      </div>`;
  });
 
  html += `<p id="${prefix}_total" style="margin-top:20px; font-weight:bold; color:#b00020;">
             Total: 0 / 100 (too low: add 100 more)
           </p>
           <p id="${prefix}_fb" style="margin-top:10px; font-size:17px; color:#b00020;"></p>`;
 
  return html + '</div>';
}
 
function trValue(prefix, i) {
  const el = document.getElementById(prefix + "_s" + i);
  return el ? parseInt(el.value) : 0;
}
 
function trTotal(prefix, n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += trValue(prefix, i);
  return total;
}
 
function trWatch(prefix, n) {
 
  const totalLine = document.getElementById(prefix + "_total");
  if (!totalLine) return;
 
  const update = () => {
 
    for (let i = 0; i < n; i++) {
      document.getElementById(prefix + "_v" + i).textContent =
        trValue(prefix, i) + "%";
    }
 
    const total = trTotal(prefix, n);
 
    if (total < 100) {
      totalLine.textContent = `Total: ${total} / 100 (too low: add ${100 - total} more)`;
      totalLine.style.color = "#b00020";
    } else if (total > 100) {
      totalLine.textContent = `Total: ${total} / 100 (too high: remove ${total - 100})`;
      totalLine.style.color = "#b00020";
    } else {
      totalLine.textContent = "Total: 100 / 100";
      totalLine.style.color = "#1b7f3b";
    }
  };
 
  for (let i = 0; i < n; i++) {
    document.getElementById(prefix + "_s" + i).addEventListener("input", update);
  }
 
  update();
}
 
 
// ---------------------------------------------------------------------
// Answers given, and whether they match the picture
// ---------------------------------------------------------------------
 
function trSay(prefix, msg) {
  const el = document.getElementById(prefix + "_fb");
  if (el) el.textContent = msg;
}
 
function trAnswers(prefix, n) {
  return [...Array(n).keys()].map(i => trValue(prefix, i));
}
 
function trCorrect(prefix, correct) {
  return correct.every((c, i) => trValue(prefix, i) === c);
}
 
// Text of the form "5 blue (50%), 5 pink (50%)"
function trAnswerText(colors, correct) {
  return colors
    .map((c, i) => Math.round(correct[i] * TR_MARBLE_TOTAL / 100) +
                   " " + c.toLowerCase() + " (" + correct[i] + "%)")
    .join(", ");
}
 
 
// ---------------------------------------------------------------------
// One training trial
// ---------------------------------------------------------------------
 
Template(
  GetTable("training.csv"),
 
  row => {
 
    const label   = "training";
    const prefix  = "tr_" + (trTrialUid++);          // unique per trial
    const colors  = row.Colors.split(";").map(s => s.trim());
    const correct = row.Correct.split(";").map(s => parseInt(s.trim()));
    const n       = colors.length;
 
    const colorList =
      n === 2
        ? colors[0].toLowerCase() + " and " + colors[1].toLowerCase()
        : colors.slice(0, -1).map(c => c.toLowerCase()).join(", ") +
          " and " + colors[n - 1].toLowerCase();
 
    const trial = newTrial(
      label,
 
      // ---------------- Question ----------------
 
      newText("trQuestion",
        "In the picture below there are " + TR_MARBLE_TOTAL + " marbles: some " +
        colorList + ". Using the sliders, indicate what percent of the marbles " +
        "are each colour.")
        .center()
        .css("font-size", "20px")
        .print(),
 
      // ---------------- Picture ----------------
 
      newImage("trPicture", row.Image)
        .size(260, 260)
        .center()
        .print(),
 
      newText("trSpacer", "<br>").print(),
 
      // ---------------- Sliders ----------------
 
      newText("trSliders", trSlidersHtml(prefix, colors))
        .center()
        .print(),
 
      newFunction("trWatch", () => trWatch(prefix, n)).call(),
 
      // ---------------- Continue: total must be 100 AND correct ----------------
 
      newButton("trNext", "Continue")
        .center()
        .print()
        .wait(
          newFunction("trCheck", () => {
 
            // Not 100 yet: say so, don't count it as a wrong answer
            if (trTotal(prefix, n) !== 100) {
              trSay(prefix,
                "Your answers must add up to exactly 100 before you continue.");
              return false;
            }
 
            if (trCorrect(prefix, correct)) return true;
 
            // Wrong: first time a nudge, after that the answer
            trAttempts[prefix] = (trAttempts[prefix] || 0) + 1;
 
            const msg = trAttempts[prefix] === 1
              ? "Not quite. Count the marbles of each colour again, then adjust the sliders."
              : "Not quite. There are " + trAnswerText(colors, correct) +
                ". Set the sliders to match, then continue.";
 
            trSay(prefix, msg);
 
            return false;
          }).test.is(true)
        ),
 
      // ---------------- Correct: confirm, then continue ----------------
 
      // Keep the answers before the sliders leave the page
      newFunction("trCapture", () => {
        trFinal[prefix] = trAnswers(prefix, n).join(";");
      }).call(),
 
      getText("trQuestion").remove(),
      getText("trSliders").remove(),
      getButton("trNext").remove(),
 
      newText("trCorrectMsg",
        "<p style='font-size:22px; color:#1b7f3b; font-weight:bold;'>Correct!</p>" +
        "<p style='font-size:18px;'>There are " + trAnswerText(colors, correct) + ".</p>")
        .center()
        .print(),
 
      newButton("trContinue", "Next picture")
        .center()
        .print()
        .wait(),
 
      // ---------------- Save ----------------
 
      newVar("trAttemptCount").global().set(() => trAttempts[prefix] || 0),
      newVar("trGiven").global().set(() => trFinal[prefix] || "")
    )
      .log("Number", row.Number)
      .log("Image", row.Image)
      .log("Colors", row.Colors)
      .log("Correct", row.Correct)
      .log("NColors", row.NColors)
      .log("WrongAttempts", getVar("trAttemptCount"))
      .log("FinalAnswer", getVar("trGiven"));
 
    return trial;
  }
);