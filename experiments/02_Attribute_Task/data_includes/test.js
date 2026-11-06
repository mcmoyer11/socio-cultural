// =====================================================================
// COUNTRY RANKING TASK  (label: "poop_test")
//
// Tables:
//   comparison.csv   Number, ComparisonCountry     -> the cards
//   countries.csv    Number, TrialType, ReferenceCountry, Condition
//
// Trial labels:
//   comparison_list  invisible loader (must run BEFORE poop_test)
//   poop_test        the ranking trials
//   poop_unused      built but never sequenced
//
// Each completed ranking is recorded in window.qRank, keyed
// "<Condition>|<ReferenceCountry>", so zcountryposttest.js can show a
// participant their own top-ranked country afterwards.
//
// Every name here is cty-prefixed so nothing collides with zattn.js,
// zfiller1.js, the training files or the post-tests.
// =====================================================================
 
// Shared with zcountryposttest.js. Lazy init: load order doesn't matter.
window.qRank = window.qRank || {};
window.qSets = window.qSets || {};
 
var ctyTrialUid = 0;                 // unique HTML ids per trial
 
 
// =====================================================================
// 1. LOADER: the comparison countries
// =====================================================================
 
const ctyComparison = [];
 
Template(
  GetTable("comparison.csv"),
  row =>
    newTrial(
      "comparison_list",
 
      newFunction("storeComparison", () => {
        const i = parseInt(row.Number) - 1;
 
        if (Number.isFinite(i)) {
          ctyComparison[i] = row.ComparisonCountry;
        } else {
          ctyComparison.push(row.ComparisonCountry);
        }
 
        window.qSets = window.qSets || {};
        window.qSets.Country = ctyComparison.filter(Boolean);
      }).call()
    )
);
 
function ctyComparisonList() {
  return ctyComparison.filter(Boolean);
}
 
 
// =====================================================================
// 2. STARTING ORDER OF THE CARDS
//    Shuffled once per participant, reused on every trial: random
//    between subjects, fixed within.
// =====================================================================
 
let ctyStartOrder = null;
 
function ctyGetStartOrder(n) {
 
  if (!ctyStartOrder || ctyStartOrder.length !== n) {
 
    ctyStartOrder = [...Array(n).keys()];
 
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ctyStartOrder[i], ctyStartOrder[j]] = [ctyStartOrder[j], ctyStartOrder[i]];
    }
  }
 
  return ctyStartOrder;
}
 
 
// =====================================================================
// 3. STATE PER TRIAL
// =====================================================================
 
const ctyState = {};
 
 
// =====================================================================
// 4. BUILD THE RANKING HTML
// =====================================================================
 
function ctyRankingHtml(countries) {
 
  const chipStyle =
    "padding:8px 10px; margin:4px; background:#e8eef7; border:1px solid #7a8fb0;" +
    "border-radius:6px; cursor:grab; user-select:none; touch-action:none; text-align:center;";
 
  const chips = ctyGetStartOrder(countries.length)
    .map(i => countries[i])
    .map(c => `<div class="cty-chip" data-country="${c}" style="${chipStyle}">${c}</div>`)
    .join("");
 
  const slots = countries.map((_, i) => {
 
    const label =
      (i + 1) +
      (
        i === 0
          ? " (closest)"
          : i === countries.length - 1
            ? " (furthest)"
            : ""
      );
 
    return `
      <div style="display:flex; align-items:center; margin:6px 0;">
        <span style="width:110px; text-align:right; margin-right:10px;">${label}</span>
        <div class="cty-slot" style="width:170px; min-height:46px; border:2px dashed #aaa; border-radius:6px;"></div>
      </div>`;
  }).join("");
 
  return `
    <div class="cty-root" style="display:flex; gap:40px; justify-content:center; align-items:flex-start; margin:20px auto;">
      <div>
        <p style="font-weight:bold; text-align:center;">Countries</p>
        <div class="cty-pool" style="width:170px; min-height:260px; border:2px dashed #aaa; border-radius:6px; padding:4px;">
          ${chips}
        </div>
      </div>
 
      <div>
        <p style="font-weight:bold; text-align:center;">Your ranking</p>
        ${slots}
      </div>
    </div>`;
}
 
 
// =====================================================================
// 5. BUILD ONCE THE TRIAL'S PAGE EXISTS
// =====================================================================
 
function ctyBuildWhenReady(prefix, tries = 0) {
 
  const showProblem = msg => {
    const box = document.createElement("p");
    box.style.cssText = "color:#b00020; font-weight:bold; text-align:center;";
    box.textContent = "[country ranking] " + msg;
    document.body.appendChild(box);
    console.error("[country ranking]", msg);
  };
 
  try {
 
    const holder = document.getElementById(prefix + "_holder");
 
    if (!holder) {
      if (tries < 200) {
        setTimeout(() => ctyBuildWhenReady(prefix, tries + 1), 25);
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
 
    const list = ctyComparisonList();
 
    if (list.length === 0) {
      showProblem('No comparison countries loaded. Check comparison.csv, and make ' +
                  'sure "comparison_list" runs before the ranking trials in Sequence().');
      return;
    }
 
    holder.innerHTML = ctyRankingHtml(list);
 
    const root = holder.querySelector(".cty-root");
 
    if (!root) {
      showProblem("Could not find the ranking root after creating the HTML.");
      return;
    }
 
    ctyState[prefix] = {
      pool:  root.querySelector(".cty-pool"),
      slots: Array.from(root.querySelectorAll(".cty-slot"))
    };
 
    ctyEnableDrag(ctyState[prefix]);
 
  } catch (err) {
    showProblem(`${prefix}: ${err.message}`);
  }
}
 
 
// =====================================================================
// 6. DRAG AND DROP (mouse, trackpad and touch)
// =====================================================================
 
function ctyEnableDrag(state) {
 
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
 
  state.pool.querySelectorAll(".cty-chip").forEach(chip => {
 
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
            const occupant = target.querySelector(".cty-chip");
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
// 7. COMPLETENESS AND READ-OUT
// =====================================================================
 
function ctyComplete(prefix) {
  const state = ctyState[prefix];
  return !!state && state.slots.every(slot => slot.querySelector(".cty-chip"));
}
 
function ctyRankAt(prefix, i) {
  const state = ctyState[prefix];
  const chip  = state && state.slots[i] && state.slots[i].querySelector(".cty-chip");
  return chip ? chip.dataset.country : "";
}
 
 
// =====================================================================
// 8. NUMBER OF RANKING POSITIONS
//    Must match the number of rows in comparison.csv.
// =====================================================================
 
const CTY_RANK_N = 5;
 
 
// =====================================================================
// 9. ONE RANKING TRIAL PER ROW OF countries.csv
// =====================================================================
 
Template(
  GetTable("countries.csv"),
 
  row => {
 
    const label   = "poop_test";
    const country = row.ReferenceCountry;
    const cond    = row.Condition;
    const prefix  = "cty_" + (ctyTrialUid++);        // unique per trial
 
    const trial = newTrial(
      label,
 
      // ---------------- Question ----------------
 
      newText("RankingQuestion",
        "Please order these countries from closest (1) to furthest (" + CTY_RANK_N +
        ") from <strong>" + country + "</strong>. Drag each country into a numbered slot.")
        .center()
        .css("font-size", "24px")
        .print(),
 
      // ---------------- Empty holder, filled once it's on the page ----------------
 
      newText("ranking", `<div id="${prefix}_holder"></div>`)
        .center()
        .print(),
 
      newFunction("buildCtyRanking", () => ctyBuildWhenReady(prefix)).call(),
 
      newText("rankWarning", "")
        .center()
        .css("color", "#b00020")
        .print(),
 
      // ---------------- Next: every slot must be filled ----------------
 
      newButton("Next", "Next")
        .center()
        .print()
        .wait(
          newFunction("ctyRankCheck", () => ctyComplete(prefix))
            .test.is(true)
            .failure(
              getText("rankWarning").text(
                "Please place every country in a slot before continuing.")
            )
        ),
 
      // ---------------- Record for the post-test ----------------
 
      newFunction("ctyRecord", () => {
        window.qRank = window.qRank || {};
        window.qRank[cond + "|" + country] = {
          set: cond,
          country: country,
          top: ctyRankAt(prefix, 0),
          ranking: [...Array(CTY_RANK_N).keys()]
                     .map(i => ctyRankAt(prefix, i)).join("|")
        };
      }).call(),
 
      // ---------------- Save ----------------
 
      newVar("ctyInitialOrder").global().set(() => {
        const list = ctyComparisonList();
        return ctyGetStartOrder(list.length).map(i => list[i]).join("|");
      }),
 
      ...[...Array(CTY_RANK_N).keys()].map(i =>
        newVar("ctyRank" + (i + 1)).global().set(() => ctyRankAt(prefix, i))
      )
    )
      .log("Number", row.Number)
      .log("TrialType", row.TrialType)
      .log("ReferenceCountry", country)
      .log("Condition", cond)
      .log("InitialOrder", getVar("ctyInitialOrder"));
 
    // One results column per rank
    return [...Array(CTY_RANK_N).keys()].reduce(
      (t, i) => t.log("Rank" + (i + 1), getVar("ctyRank" + (i + 1))),
      trial
    );
  }
);