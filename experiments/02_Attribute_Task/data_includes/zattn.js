// =====================================================================
// ATTENTION CHECK  (drag-and-drop, same format as the country task)
//
// Tables:
//   attn1.csv   Number, AttnComparison          -> the cards (A, B, C, D, E)
//   attn.csv    Number, RankingItems, Order, Condition
//               RankingItems  A;B;C;D;E
//               Order         1;3;4;2;5   (A->slot 1, B->slot 3, ...)
//
// Trial labels:
//   attn1_list  invisible loader (must run BEFORE attn_test)
//   attn_test   the checks themselves
//
// Participants can always continue, right or wrong. Each trial logs
// whether it was passed, plus a running count of failures.
//
// Every name here is attn-prefixed so nothing collides with test.js
// (country ranking), zfiller1.js or the post-test files.
// =====================================================================
 
var attnUid = 0;                  // unique HTML ids per trial
 
window.attnFails  = 0;            // running count of failed checks
window.attnChecks = 0;            // running count of checks seen
 
 
// ---------------------------------------------------------------------
// 1. LOADER: the cards, from attn1.csv
// ---------------------------------------------------------------------
 
const attnItems = [];
 
Template(
  GetTable("attn1.csv"),
  row =>
    newTrial(
      "attn1_list",
      newFunction("storeAttnItem", () => {
        const i = parseInt(row.Number) - 1;
        if (Number.isFinite(i)) attnItems[i] = row.AttnComparison;
        else attnItems.push(row.AttnComparison);
      }).call()
    )
);
 
function attnItemList() {
  return attnItems.filter(Boolean);
}
 
 
// ---------------------------------------------------------------------
// 2. STARTING ORDER OF THE CARDS
//    Shuffled once per participant, reused on every check.
// ---------------------------------------------------------------------
 
let attnStartOrder = null;
 
function attnGetStartOrder(n) {
  if (!attnStartOrder || attnStartOrder.length !== n) {
    attnStartOrder = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [attnStartOrder[i], attnStartOrder[j]] = [attnStartOrder[j], attnStartOrder[i]];
    }
  }
  return attnStartOrder;
}
 
 
// ---------------------------------------------------------------------
// 3. STATE PER TRIAL
// ---------------------------------------------------------------------
 
const attnState = {};
 
 
// ---------------------------------------------------------------------
// 4. BUILD THE HTML
// ---------------------------------------------------------------------
 
function attnHtml(items) {
 
  const chipStyle =
    "padding:8px 10px; margin:4px; background:#e8eef7; border:1px solid #7a8fb0;" +
    "border-radius:6px; cursor:grab; user-select:none; touch-action:none; text-align:center;";
 
  const chips = attnGetStartOrder(items.length)
    .map(i => items[i])
    .map(c => `<div class="attn-chip" data-item="${c}" style="${chipStyle}">${c}</div>`)
    .join("");
 
  const slots = items.map((_, i) => `
      <div style="display:flex; align-items:center; margin:6px 0;">
        <span style="width:110px; text-align:right; margin-right:10px;">Slot ${i + 1}</span>
        <div class="attn-slot" style="width:170px; min-height:46px; border:2px dashed #aaa; border-radius:6px;"></div>
      </div>`).join("");
 
  return `
    <div class="attn-root" style="display:flex; gap:40px; justify-content:center; align-items:flex-start; margin:20px auto;">
      <div>
        <p style="font-weight:bold; text-align:center;">Items</p>
        <div class="attn-pool" style="width:170px; min-height:260px; border:2px dashed #aaa; border-radius:6px; padding:4px;">
          ${chips}
        </div>
      </div>
      <div>
        <p style="font-weight:bold; text-align:center;">Your placement</p>
        ${slots}
      </div>
    </div>`;
}
 
 
// ---------------------------------------------------------------------
// 5. BUILD ONCE THE PAGE EXISTS
// ---------------------------------------------------------------------
 
function attnBuildWhenReady(prefix, tries = 0) {
 
  const problem = msg => {
    const box = document.createElement("p");
    box.style.cssText = "color:#b00020; font-weight:bold; text-align:center;";
    box.textContent = "[attn] " + msg;
    document.body.appendChild(box);
    console.error("[attn]", msg);
  };
 
  try {
 
    const holder = document.getElementById(prefix + "_holder");
 
    if (!holder) {
      if (tries < 200) setTimeout(() => attnBuildWhenReady(prefix, tries + 1), 25);
      else problem("Could not find " + prefix + "_holder.");
      return;
    }
 
    const list = attnItemList();
 
    if (list.length === 0) {
      problem('No items loaded. Check attn1.csv, and make sure "attn1_list" ' +
              'runs before the checks in Sequence().');
      return;
    }
 
    holder.innerHTML = attnHtml(list);
 
    const root = holder.querySelector(".attn-root");
    if (!root) { problem("Could not find the root after creating the HTML."); return; }
 
    attnState[prefix] = {
      pool:  root.querySelector(".attn-pool"),
      slots: Array.from(root.querySelectorAll(".attn-slot"))
    };
 
    attnEnableDrag(attnState[prefix]);
 
  } catch (err) {
    problem(prefix + ": " + err.message);
  }
}
 
 
// ---------------------------------------------------------------------
// 6. DRAG AND DROP (mouse, trackpad and touch)
// ---------------------------------------------------------------------
 
function attnEnableDrag(state) {
 
  const targets = [...state.slots, state.pool];
 
  const hit = (x, y) =>
    targets.find(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
 
  state.pool.querySelectorAll(".attn-chip").forEach(chip => {
 
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
            const occupant = target.querySelector(".attn-chip");
            if (occupant && occupant !== chip) origin.appendChild(occupant);   // swap
          }
          target.appendChild(chip);
        } else {
          origin.appendChild(chip);                                           // put it back
        }
      };
 
      document.addEventListener("pointermove",   move);
      document.addEventListener("pointerup",     finish);
      document.addEventListener("pointercancel", finish);
    });
  });
}
 
 
// ---------------------------------------------------------------------
// 7. READ-OUT AND SCORING
// ---------------------------------------------------------------------
 
// What is in slot i, or "" if empty
function attnSlotContent(prefix, i) {
  const state = attnState[prefix];
  const chip  = state && state.slots[i] && state.slots[i].querySelector(".attn-chip");
  return chip ? chip.dataset.item : "";
}
 
function attnGiven(prefix, n) {
  return [...Array(n).keys()].map(i => attnSlotContent(prefix, i)).join(";");
}
 
// Passed only if every item sits in the slot it was told to sit in
function attnPassed(prefix, items, order) {
  return items.every((item, k) => attnSlotContent(prefix, order[k] - 1) === item);
}
 
 
// ---------------------------------------------------------------------
// 8. ONE ATTENTION CHECK PER ROW OF attn.csv
// ---------------------------------------------------------------------
 
Template(
  GetTable("attn.csv"),
 
  row => {
 
    const label  = "attn_test";
    const prefix = label + "_" + (attnUid++);           // unique per trial
 
    const items = String(row.RankingItems || "").split(";").map(s => s.trim()).filter(Boolean);
    const order = String(row.Order || "").split(";").map(s => parseInt(s.trim()))
                    .filter(x => Number.isFinite(x));
    const n     = Math.max(items.length, order.length, 1);
 
    // "A in slot 1, B in slot 3, C in slot 4, D in slot 2 and E in slot 5"
    const parts = items.map((item, k) =>
      "<strong>" + item + "</strong> in slot <strong>" + order[k] + "</strong>");
 
    const instruction = parts.length > 1
      ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1]
      : (parts[0] || "the items as instructed");
 
    const trial = newTrial(
      label,
 
      newText("AttnQuestion",
        "To show that you are reading the questions carefully, please place " +
        instruction + ". Once you have placed every item, click Next.")
        .center()
        .css("font-size", "22px")
        .print(),
 
      newText("attnHolder", `<div id="${prefix}_holder"></div>`)
        .center()
        .print(),
 
      newFunction("attnBuild", () => attnBuildWhenReady(prefix)).call(),
 
      // Always allowed: a failed check is data, not a dead end
      newButton("attnNext", "Next")
        .center()
        .print()
        .wait(),
 
      // Score it and keep a running tally
      newFunction("attnScore", () => {
        window.attnChecks = (window.attnChecks || 0) + 1;
        if (!attnPassed(prefix, items, order)) {
          window.attnFails = (window.attnFails || 0) + 1;
        }
      }).call(),
 
      newVar("attnGivenVar").global().set(() => attnGiven(prefix, n)),
      newVar("attnPassVar").global().set(() => attnPassed(prefix, items, order) ? 1 : 0),
      newVar("attnFailsVar").global().set(() => window.attnFails || 0),
      newVar("attnChecksVar").global().set(() => window.attnChecks || 0)
    )
      .log("Number", row.Number)
      .log("Condition", row.Condition)
      .log("AttnItems", row.RankingItems)
      .log("AttnTargetOrder", row.Order)
      .log("AttnGiven", getVar("attnGivenVar"))
      .log("AttnPass", getVar("attnPassVar"))
      .log("AttnFailsSoFar", getVar("attnFailsVar"))
      .log("AttnChecksSoFar", getVar("attnChecksVar"));
 
    return trial;
  }
);