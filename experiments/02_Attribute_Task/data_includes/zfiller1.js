// =====================================================================
// QUANTIFIER / NUMBER RANKING TASK  --  low set and high set
//
// One set of helpers, used for both quantifier sets.
//
// Tables:
//   lowquantifier.csv    Number, TrialType, Quantifier, Condition
//   highquantifier.csv   Number, TrialType, Quantifier, Condition
//   number.csv           Number, QuestionNumber, NumberType
//
// Trial labels created here:
//   lowQuant_list    invisible loader  (must run BEFORE lowq_test)
//   highQuant_list   invisible loader  (must run BEFORE highq_test)
//   lowq_test        ranking trials, low + intermediate numbers
//   highq_test       ranking trials, intermediate + high numbers
//   qrank_unused     built but never sequenced (rows that don't apply)
//
// Every name here is q-prefixed, so nothing collides with test.js
// (countries) or the training files.
// =====================================================================
 
// Shared with zposttest.js. Lazy init, so load order doesn't matter.
window.qRank = window.qRank || {};
window.qSets = window.qSets || {};
 
 
// =====================================================================
// 0. SETTINGS
// =====================================================================
 
const Q_RANK_N = 5;                             // cards per ranking
 
const Q_TABLE  = { Low: "lowquantifier.csv", High: "highquantifier.csv" };
const Q_LOADER = { Low: "lowQuant_list",     High: "highQuant_list" };
const Q_LABEL  = { Low: "lowq_test",         High: "highq_test" };
 
// Which NumberType values each set is tested on
const Q_NUMBERS = {
  Low:  ["low", "intermediate"],
  High: ["intermediate", "high"]
};
 
var qRankUid = 0;                                // unique HTML ids per trial
 
const qLists      = { Low: [],   High: [] };     // quantifiers, in CSV order
const qStartOrder = { Low: null, High: null };   // card order, fixed per participant
const qRankState  = {};                          // DOM refs, keyed by trial prefix
 
 
// =====================================================================
// 1. LOADERS  (invisible trials that read the quantifier CSVs)
// =====================================================================
 
function qStore(set, row) {
 
  const i = parseInt(row.Number) - 1;
 
  if (Number.isFinite(i)) {
    qLists[set][i] = row.Quantifier;
  } else {
    qLists[set].push(row.Quantifier);
  }
 
  window.qSets[set] = qLists[set].filter(Boolean);
}
 
Template(
  GetTable(Q_TABLE.Low),
  row => newTrial(
    Q_LOADER.Low,
    newFunction("storeLowQ", () => qStore("Low", row)).call()
  )
);
 
Template(
  GetTable(Q_TABLE.High),
  row => newTrial(
    Q_LOADER.High,
    newFunction("storeHighQ", () => qStore("High", row)).call()
  )
);
 
function qListOf(set) {
  return qLists[set].filter(Boolean);
}
 
 
// =====================================================================
// 2. STARTING ORDER OF THE CARDS
//    Shuffled once per participant per set, then reused on every trial
//    of that set: random between subjects, fixed within.
// =====================================================================
 
function qGetStartOrder(set, n) {
 
  if (!qStartOrder[set] || qStartOrder[set].length !== n) {
 
    const a = [...Array(n).keys()];
 
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
 
    qStartOrder[set] = a;
  }
 
  return qStartOrder[set];
}
 
 
// =====================================================================
// 3. BUILD THE RANKING HTML
// =====================================================================
 
function qRankHtml(set, quantifiers) {
 
  const chipStyle =
    "padding:8px 10px;" +
    "margin:4px;" +
    "background:#e8eef7;" +
    "border:1px solid #7a8fb0;" +
    "border-radius:6px;" +
    "cursor:grab;" +
    "user-select:none;" +
    "touch-action:none;" +
    "text-align:center;";
 
  const chips = qGetStartOrder(set, quantifiers.length)
    .map(i => quantifiers[i])
    .map(q =>
      `<div class="q-chip" data-quantifier="${q}" style="${chipStyle}">${q}</div>`
    )
    .join("");
 
  const slots = quantifiers.map((_, i) => {
 
    const label =
      (i + 1) +
      (
        i === 0
          ? " (fits best)"
          : i === quantifiers.length - 1
            ? " (fits worst)"
            : ""
      );
 
    return `
      <div style="display:flex; align-items:center; margin:6px 0;">
        <span style="width:110px; text-align:right; margin-right:10px;">${label}</span>
        <div class="q-slot" style="
          width:170px;
          min-height:46px;
          border:2px dashed #aaa;
          border-radius:6px;
        "></div>
      </div>
    `;
  }).join("");
 
  return `
    <div class="q-root" style="
      display:flex;
      gap:40px;
      justify-content:center;
      align-items:flex-start;
      margin:20px auto;
    ">
      <div>
        <p style="font-weight:bold; text-align:center;">Words</p>
        <div class="q-pool" style="
          width:170px;
          min-height:260px;
          border:2px dashed #aaa;
          border-radius:6px;
          padding:4px;
        ">
          ${chips}
        </div>
      </div>
 
      <div>
        <p style="font-weight:bold; text-align:center;">Your ranking</p>
        ${slots}
      </div>
    </div>
  `;
}
 
 
// =====================================================================
// 4. BUILD ONCE THE TRIAL'S PAGE EXISTS
// =====================================================================
 
function qBuildWhenReady(prefix, set, tries = 0) {
 
  const showProblem = msg => {
    const box = document.createElement("p");
    box.style.cssText = "color:#b00020; font-weight:bold; text-align:center;";
    box.textContent = "[ranking] " + msg;
    document.body.appendChild(box);
    console.error("[ranking]", msg);
  };
 
  try {
 
    const holder = document.getElementById(prefix + "_holder");
 
    if (!holder) {
      if (tries < 200) {
        setTimeout(() => qBuildWhenReady(prefix, set, tries + 1), 25);
      } else {
        const holders = Array.from(
          document.querySelectorAll("[id$='_holder']")
        ).map(h => h.id);
 
        showProblem(
          `Could not find ${prefix}_holder. Holders on page: ${holders.join(", ") || "none"}`
        );
      }
      return;
    }
 
    const list = qListOf(set);
 
    if (list.length === 0) {
      showProblem(
        'No quantifiers loaded for the ' + set + ' set. Check ' + Q_TABLE[set] +
        ', and make sure "' + Q_LOADER[set] +
        '" runs before the ranking trials in Sequence().'
      );
      return;
    }
 
    holder.innerHTML = qRankHtml(set, list);
 
    const root = holder.querySelector(".q-root");
 
    if (!root) {
      showProblem("Could not find the ranking root after creating the HTML.");
      return;
    }
 
    const state = {
      pool:  root.querySelector(".q-pool"),
      slots: Array.from(root.querySelectorAll(".q-slot"))
    };
 
    qRankState[prefix] = state;
 
    qEnableDrag(state);
 
  } catch (err) {
    showProblem(`${prefix}: ${err.message}`);
  }
}
 
 
// =====================================================================
// 5. DRAG AND DROP (mouse, trackpad and touch)
// =====================================================================
 
function qEnableDrag(state) {
 
  const targets = [...state.slots, state.pool];
 
  // Which of THIS trial's slots (or the pool) is under the pointer
  const hit = (x, y) =>
    targets.find(el => {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        x >= r.left && x <= r.right &&
        y >= r.top  && y <= r.bottom
      );
    });
 
  state.pool.querySelectorAll(".q-chip").forEach(chip => {
 
    const baseCss = chip.style.cssText;
 
    chip.addEventListener("pointerdown", e => {
 
      e.preventDefault();
 
      const origin = chip.parentElement;
      const rect   = chip.getBoundingClientRect();
      const dx     = e.clientX - rect.left;
      const dy     = e.clientY - rect.top;
 
      Object.assign(chip.style, {
        position: "fixed",
        left:  rect.left  + "px",
        top:   rect.top   + "px",
        width: rect.width + "px",
        zIndex: 1000,
        pointerEvents: "none",
        cursor: "grabbing"
      });
 
      const move = ev => {
        chip.style.left = (ev.clientX - dx) + "px";
        chip.style.top  = (ev.clientY - dy) + "px";
      };
 
      const finish = ev => {
 
        document.removeEventListener("pointermove",   move);
        document.removeEventListener("pointerup",     finish);
        document.removeEventListener("pointercancel", finish);
 
        chip.style.cssText = baseCss;
 
        const target = hit(ev.clientX, ev.clientY);
 
        if (target) {
 
          if (target !== state.pool) {
            const occupant = target.querySelector(".q-chip");
            if (occupant && occupant !== chip) {
              origin.appendChild(occupant);        // swap
            }
          }
 
          target.appendChild(chip);
 
        } else {
          origin.appendChild(chip);                // dropped outside: put it back
        }
      };
 
      document.addEventListener("pointermove",   move);
      document.addEventListener("pointerup",     finish);
      document.addEventListener("pointercancel", finish);
    });
  });
}
 
 
// =====================================================================
// 6. COMPLETENESS AND READ-OUT
// =====================================================================
 
function qComplete(prefix) {
  const state = qRankState[prefix];
  return !!state && state.slots.every(slot => slot.querySelector(".q-chip"));
}
 
function qRankAt(prefix, i) {
  const state = qRankState[prefix];
  const chip  = state && state.slots[i] && state.slots[i].querySelector(".q-chip");
  return chip ? chip.dataset.quantifier : "";
}
 
 
// =====================================================================
// 7. ONE RANKING TRIAL
// =====================================================================
 
function qRankTrial(set, row) {
 
  const label  = Q_LABEL[set];
  const number = row.QuestionNumber;
  const prefix = set.toLowerCase() + "q_" + (qRankUid++);   // unique per trial
 
  const trial = newTrial(
    label,
 
    // -----------------------------------------------------------------
    // QUESTION
    // -----------------------------------------------------------------
 
    newText(
      "RankingQuestion",
      "Imagine someone is describing exactly <strong>" + number +
      "</strong> things, by saying &ldquo;There are ______ things.&rdquo;<br>" +
      "Drag the words into order, from the one that fits best (1) to the " +
      "one that fits worst (" + Q_RANK_N + ")."
    )
      .center()
      .css("font-size", "22px")
      .print(),
 
    // -----------------------------------------------------------------
    // EMPTY HOLDER (filled once it's on the page)
    // -----------------------------------------------------------------
 
    newText("ranking", `<div id="${prefix}_holder"></div>`)
      .center()
      .print(),
 
    newFunction("qBuild", () => qBuildWhenReady(prefix, set)).call(),
 
    // -----------------------------------------------------------------
    // WARNING
    // -----------------------------------------------------------------
 
    newText("rankWarning", "")
      .center()
      .css("color", "#b00020")
      .print(),
 
    // -----------------------------------------------------------------
    // NEXT BUTTON: only works when every slot is filled
    // -----------------------------------------------------------------
 
    newButton("Next", "Next")
      .center()
      .print()
      .wait(
        newFunction("qCheck", () => qComplete(prefix))
          .test.is(true)
          .failure(
            getText("rankWarning").text(
              "Please place every word in a slot before continuing."
            )
          )
      ),
 
    // -----------------------------------------------------------------
    // RECORD THIS RANKING FOR THE POST-TEST
    // -----------------------------------------------------------------
 
    newFunction("qRecord", () => {
      window.qRank = window.qRank || {};
      window.qRank[set + "|" + number] = {
        set: set,
        number: number,
        top: qRankAt(prefix, 0),
        ranking: [...Array(Q_RANK_N).keys()]
                   .map(i => qRankAt(prefix, i)).join("|")
      };
    }).call(),
 
    // -----------------------------------------------------------------
    // SAVE THE STARTING ORDER AND THE RANKS
    // -----------------------------------------------------------------
 
    newVar("qInitialOrder")
      .global()
      .set(() => {
        const list = qListOf(set);
        return qGetStartOrder(set, list.length).map(i => list[i]).join("|");
      }),
 
    ...[...Array(Q_RANK_N).keys()].map(i =>
      newVar("qRank" + (i + 1))
        .global()
        .set(() => qRankAt(prefix, i))
    )
  )
    .log("Number", row.Number)
    .log("QuestionNumber", number)
    .log("NumberType", row.NumberType)
    .log("QuantifierSet", set)
    .log("InitialOrder", getVar("qInitialOrder"));
 
  // One results column per rank
  return [...Array(Q_RANK_N).keys()].reduce(
    (t, i) => t.log("Rank" + (i + 1), getVar("qRank" + (i + 1))),
    trial
  );
}
 
 
// =====================================================================
// 8. BUILD THE TRIALS
//    Rows whose NumberType does not apply to a set get a label that is
//    never in the Sequence, so they are built but never shown.
// =====================================================================
 
Template(
  GetTable("number.csv"),
  row => Q_NUMBERS.Low.includes(row.NumberType)
           ? qRankTrial("Low", row)
           : newTrial("qrank_unused")
);
 
Template(
  GetTable("number.csv"),
  row => Q_NUMBERS.High.includes(row.NumberType)
           ? qRankTrial("High", row)
           : newTrial("qrank_unused")
);