// =====================================================================
// NUMBER RANKING TRAINING TASK
// =====================================================================

var trainingRankTrialUid = 0;


// =====================================================================
// LOAD COMPARISON NUMBERS FROM comparisonnumber.csv
// =====================================================================

const trainingComparisonNumbers = [];

Template(
    GetTable("comparisonnumber.csv"),

    row =>
        newTrial(
            "comparisonnumber_list",

            newFunction(
                "storeTrainingNumber",

                () => {
                    trainingComparisonNumbers[
                        parseInt(row.Number) - 1
                    ] = row.ComparisonNumber;
                }
            ).call()
        )
);


function getTrainingComparisonList() {

    return trainingComparisonNumbers.filter(Boolean);

}


// =====================================================================
// RANDOMIZE STARTING ORDER
// =====================================================================

let trainingRankingOrder = null;


function getTrainingRankingOrder(n) {

    if (!trainingRankingOrder) {

        trainingRankingOrder =
            [...Array(n).keys()];

        for (
            let i = n - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                trainingRankingOrder[i],
                trainingRankingOrder[j]
            ] = [
                trainingRankingOrder[j],
                trainingRankingOrder[i]
            ];
        }
    }

    return trainingRankingOrder;
}


// =====================================================================
// KEEP STATE FOR EACH TRAINING TRIAL
// =====================================================================

const trainingRankingState = {};


// =====================================================================
// BUILD THE RANKING HTML
// =====================================================================

function trainingRankingHtml(numbers) {

    const chipStyle =
        "padding:8px 10px; margin:4px; background:#e8eef7;" +
        "border:1px solid #7a8fb0; border-radius:6px;" +
        "cursor:grab; user-select:none; touch-action:none;" +
        "text-align:center;";


    const chips =
        getTrainingRankingOrder(numbers.length)

            .map(
                i => numbers[i]
            )

            .map(
                n =>
                    `<div class="training-rk-chip"
                          data-number="${n}"
                          style="${chipStyle}">
                        ${n}
                    </div>`
            )

            .join("");


    const slots =
        numbers

            .map(
                (_, i) => {

                    const label =
                        (i + 1) +
                        (
                            i === 0
                                ? " (closest)"
                                : i === numbers.length - 1
                                    ? " (furthest)"
                                    : ""
                        );


                    return `
                        <div style="display:flex;
                                    align-items:center;
                                    margin:6px 0;">

                            <span style="width:100px;
                                         text-align:right;
                                         margin-right:10px;">
                                ${label}
                            </span>

                            <div class="training-rk-slot"
                                 style="width:170px;
                                        min-height:46px;
                                        border:2px dashed #aaa;
                                        border-radius:6px;">
                            </div>

                        </div>
                    `;
                }
            )

            .join("");


    return `
        <div class="training-rk-root"
             style="display:flex;
                    gap:40px;
                    justify-content:center;
                    align-items:flex-start;
                    margin:20px auto;">

            <div>

                <p style="font-weight:bold;
                          text-align:center;">
                    Numbers
                </p>

                <div class="training-rk-pool"
                     style="width:170px;
                            min-height:260px;
                            border:2px dashed #aaa;
                            border-radius:6px;
                            padding:4px;">

                    ${chips}

                </div>

            </div>


            <div>

                <p style="font-weight:bold;
                          text-align:center;">
                    Your ranking
                </p>

                ${slots}

            </div>

        </div>
    `;
}


// =====================================================================
// BUILD RANKING WHEN HOLDER EXISTS
// =====================================================================

function buildTrainingRankingWhenReady(
    prefix,
    tries = 0
) {

    const holder =
        document.getElementById(
            prefix + "_holder"
        );


    if (!holder) {

        if (tries < 200) {

            setTimeout(
                () =>
                    buildTrainingRankingWhenReady(
                        prefix,
                        tries + 1
                    ),
                25
            );

        } else {

            console.log(
                "Training ranking: could not find holder",
                prefix + "_holder"
            );
        }

        return;
    }


    const numbers =
        getTrainingComparisonList();


    if (numbers.length === 0) {

        console.log(
            "Training ranking: comparisonnumber.csv is empty or has not loaded."
        );

        return;
    }


    holder.innerHTML =
        trainingRankingHtml(numbers);


    const root =
        holder.querySelector(
            ".training-rk-root"
        );


    const state = {

        pool:
            root.querySelector(
                ".training-rk-pool"
            ),

        slots:
            Array.from(
                root.querySelectorAll(
                    ".training-rk-slot"
                )
            )

    };


    trainingRankingState[prefix] =
        state;


    enableTrainingRanking(state);
}


// =====================================================================
// ENABLE DRAGGING
// =====================================================================

function enableTrainingRanking(state) {

    const targets = [
        ...state.slots,
        state.pool
    ];


    const hit = (x, y) => {

        return targets.find(
            el => {

                const r =
                    el.getBoundingClientRect();


                return (
                    r.width > 0 &&
                    x >= r.left &&
                    x <= r.right &&
                    y >= r.top &&
                    y <= r.bottom
                );

            }
        );
    };


    state.pool
        .querySelectorAll(
            ".training-rk-chip"
        )
        .forEach(
            chip => {

                const baseCss =
                    chip.style.cssText;


                chip.addEventListener(
                    "pointerdown",

                    e => {

                        e.preventDefault();


                        const origin =
                            chip.parentElement;


                        const rect =
                            chip.getBoundingClientRect();


                        const dx =
                            e.clientX -
                            rect.left;


                        const dy =
                            e.clientY -
                            rect.top;


                        Object.assign(
                            chip.style,
                            {
                                position: "fixed",
                                left: rect.left + "px",
                                top: rect.top + "px",
                                width: rect.width + "px",
                                zIndex: 1000,
                                pointerEvents: "none",
                                cursor: "grabbing"
                            }
                        );


                        const move = ev => {

                            chip.style.left =
                                (
                                    ev.clientX - dx
                                ) + "px";


                            chip.style.top =
                                (
                                    ev.clientY - dy
                                ) + "px";
                        };


                        const finish = ev => {

                            document.removeEventListener(
                                "pointermove",
                                move
                            );


                            document.removeEventListener(
                                "pointerup",
                                finish
                            );


                            document.removeEventListener(
                                "pointercancel",
                                finish
                            );


                            chip.style.cssText =
                                baseCss;


                            const target =
                                hit(
                                    ev.clientX,
                                    ev.clientY
                                );


                            if (target) {

                                if (
                                    target !== state.pool
                                ) {

                                    const occupant =
                                        target.querySelector(
                                            ".training-rk-chip"
                                        );


                                    if (
                                        occupant &&
                                        occupant !== chip
                                    ) {

                                        origin.appendChild(
                                            occupant
                                        );
                                    }
                                }


                                target.appendChild(
                                    chip
                                );

                            } else {

                                origin.appendChild(
                                    chip
                                );
                            }
                        };


                        document.addEventListener(
                            "pointermove",
                            move
                        );


                        document.addEventListener(
                            "pointerup",
                            finish
                        );


                        document.addEventListener(
                            "pointercancel",
                            finish
                        );

                    }
                );

            }
        );
}


// =====================================================================
// CHECK WHETHER ALL SLOTS ARE FILLED
// =====================================================================

function trainingRankingComplete(prefix) {

    const state =
        trainingRankingState[prefix];


    return (
        !!state &&
        state.slots.every(
            slot =>
                slot.querySelector(
                    ".training-rk-chip"
                )
        )
    );
}


// =====================================================================
// GET NUMBER IN A GIVEN SLOT
// =====================================================================

function trainingRankingAt(
    prefix,
    i
) {

    const state =
        trainingRankingState[prefix];


    const chip =
        state &&
        state.slots[i] &&
        state.slots[i].querySelector(
            ".training-rk-chip"
        );


    return chip
        ? chip.dataset.number
        : "";
}


// =====================================================================
// NUMBER OF RANKING POSITIONS
// =====================================================================

const TRAINING_RANK_N = 5;


// =====================================================================
// TRAINING TRIALS
// =====================================================================

Template(
    GetTable("training.csv"),

    row => {

        const label =
            "training_test";


        const prefix =
            label +
            "_" +
            (trainingRankTrialUid++);


        const trial =
            newTrial(

                label,


                // -----------------------------------------------------
                // QUESTION
                // -----------------------------------------------------

                newText(
                    "TrainingRankingQuestion",

                    "Please order these numbers from closest (1) to furthest (" +
                    TRAINING_RANK_N +
                    ") from <strong>" +
                    row.ReferenceNumber +
                    "</strong>. Drag each number into a numbered slot."

                )
                    .center()
                    .css(
                        "font-size",
                        "24px"
                    )
                    .print(),


                // -----------------------------------------------------
                // RANKING HOLDER
                // -----------------------------------------------------

                newText(
                    "trainingRanking",

                    `<div id="${prefix}_holder"></div>`
                )
                    .center()
                    .print(),


                // -----------------------------------------------------
                // BUILD RANKING
                // -----------------------------------------------------

                newFunction(
                    "buildTrainingRanking",

                    () =>
                        buildTrainingRankingWhenReady(
                            prefix
                        )
                )
                    .call(),


                // -----------------------------------------------------
                // WARNING
                // -----------------------------------------------------

                newText(
                    "trainingRankWarning",
                    ""
                )
                    .center()
                    .css(
                        "color",
                        "#b00020"
                    )
                    .print(),


                // -----------------------------------------------------
                // NEXT BUTTON
                // -----------------------------------------------------

                newButton(
                    "TrainingNext",
                    "Next"
                )
                    .center()
                    .print()

                    .wait(

                        newFunction(
                            "trainingRankCheck",

                            () =>
                                trainingRankingComplete(
                                    prefix
                                )
                        )
                            .test.is(true)

                            .failure(

                                getText(
                                    "trainingRankWarning"
                                )
                                    .text(
                                        "Please place every number in a slot before continuing."
                                    )
                            )
                    ),


                // -----------------------------------------------------
                // SAVE INITIAL ORDER
                // -----------------------------------------------------

                newVar(
                    "trainingInitialOrder"
                )
                    .global()
                    .set(
                        () => {

                            const numbers =
                                getTrainingComparisonList();


                            return getTrainingRankingOrder(
                                numbers.length
                            )
                                .map(
                                    i =>
                                        numbers[i]
                                )
                                .join("|");
                        }
                    ),


                // -----------------------------------------------------
                // SAVE EACH RANK
                // -----------------------------------------------------

                ...[
                    ...Array(
                        TRAINING_RANK_N
                    ).keys()
                ]
                    .map(
                        i =>

                            newVar(
                                "trainingRank" +
                                (i + 1)
                            )
                                .global()
                                .set(
                                    () =>
                                        trainingRankingAt(
                                            prefix,
                                            i
                                        )
                                )
                    )

            );


        // -------------------------------------------------------------
        // LOG TRIAL INFORMATION
        // -------------------------------------------------------------

        trial
            .log(
                "ReferenceNumber",
                row.ReferenceNumber
            )

            .log(
                "Condition",
                row.Condition
            )

            .log(
                "TrialType",
                row.TrialType
            )

            .log(
                "Number",
                row.Number
            )

            .log(
                "TrainingInitialOrder",
                getVar(
                    "trainingInitialOrder"
                )
            );


        // -------------------------------------------------------------
        // LOG EACH RANK
        // -------------------------------------------------------------

        return [
            ...Array(
                TRAINING_RANK_N
            ).keys()
        ]

            .reduce(
                (t, i) =>

                    t.log(
                        "TrainingRank" +
                        (i + 1),

                        getVar(
                            "trainingRank" +
                            (i + 1)
                        )
                    ),

                trial
            );

    }
);