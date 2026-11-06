// ---------- Helpers for the sliders ----------

// Builds the HTML: one slider per item (0–100, steps of 10, starting at 0) plus a live total line
function allocationSlidersHtml(prefix, items) {
  let html = '<div style="margin:20px auto; width:460px;">';
  items.forEach((item, i) => {
    html += `
      <div style="display:flex; align-items:center; margin:14px 0;">
        <label for="${prefix}_s${i}" style="width:110px; text-align:left;">${item}</label>
        <input type="range" id="${prefix}_s${i}" min="0" max="100" step="10" value="0" style="flex:1;">
        <span id="${prefix}_v${i}" style="width:50px; text-align:right;">0%</span>
      </div>`;
  });
  html += `<p id="${prefix}_total" style="margin-top:20px; font-weight:bold; color:#b00020;">
             Total: 0 / 100 (too low: add 100 more)
           </p>`;
  return html + '</div>';
}

// Adds up the current slider values
function sliderTotal(prefix, n) {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += parseInt(document.getElementById(prefix + "_s" + i).value);
  }
  return total;
}

// Updates each slider's number and the total message whenever a slider moves
function watchSliders(prefix, n) {
  const totalLine = document.getElementById(prefix + "_total");
  const update = () => {
    for (let i = 0; i < n; i++) {
      document.getElementById(prefix + "_v" + i).textContent =
        document.getElementById(prefix + "_s" + i).value + "%";
    }
    const total = sliderTotal(prefix, n);
    if (total < 100) {
      totalLine.textContent = `Total: ${total} / 100 (too low: add ${100 - total} more)`;
      totalLine.style.color = "#b00020";
    } else if (total > 100) {
      totalLine.textContent = `Total: ${total} / 100 (too high: remove ${total - 100})`;
      totalLine.style.color = "#b00020";
    } else {
      totalLine.textContent = "Total: 100 / 100 (you can continue)";
      totalLine.style.color = "#1b7f3b";
    }
  };
  for (let i = 0; i < n; i++) {
    document.getElementById(prefix + "_s" + i).addEventListener("input", update);
  }
}

// Builds one full trial for any number of items
function allocationTrial(label, row, questionHtml, items) {
  const n = items.length;
  const trial = newTrial(label,
    newText("question", questionHtml).center().css("font-size", "20px").print(),
    newText("spacer", "<br>").print(),
    newText("instr", "Distribute 100 points across the " + n +
            " items. The total must equal exactly 100 before you can continue.")
      .center().print(),
    newText("sliders", allocationSlidersHtml(label, items)).center().print(),
    newFunction("watch", () => watchSliders(label, n)).call(),
    newText("warning", "").center().css("color", "#b00020").print(),

    // Next only works when the total is exactly 100
    newButton("Next", "Next").center().print()
      .wait(
        newFunction("check", () => sliderTotal(label, n) === 100)
          .test.is(true)
          .failure( getText("warning").text("Your answers must add up to exactly 100 before you continue.") )
      ),

    // Save the final values
    ...items.map((item, i) =>
      newVar("pct" + i).global().set(() => document.getElementById(label + "_s" + i).value)
    )
  )
  .log("ReferenceCountry", row.ReferenceCountry);

  // One results column per item
  return items.reduce((t, item, i) => t.log(item, getVar("pct" + i)), trial);
}

// ---------- The three trials ----------

Template(GetTable("countries.csv"), row =>
  allocationTrial("religion", row,
    "What is the distribution of religions in <strong>" + row.ReferenceCountry +
    "</strong>? Using the sliders below, indicate what percent of people in " +
    row.ReferenceCountry + " are members of each religion.",
    ["Christian", "Muslim", "Non-religious", "Other"])
);

Template(GetTable("countries.csv"), row =>
  allocationTrial("race", row,
    "What is the distribution of races in <strong>" + row.ReferenceCountry +
    "</strong>? Using the sliders below, indicate what percent of people in " +
    row.ReferenceCountry + " are members of each race.",
    ["White", "Black","Asian","Other"])
);

Template(GetTable("countries.csv"), row =>
  allocationTrial("region", row,
    "What region is <strong>" + row.ReferenceCountry +
    "</strong> part of? Using the sliders below, indicate how likely it is that " +
    row.ReferenceCountry + " is part of each region.",
    ["Asia", "Africa", "Middle East", "Europe"])
);

