PennController.ResetPrefix(null); // For shorter commands
// DebugOff();
//let trialUid = 0;   // gives every trial its own unique HTML ids

// let highNumbersArray = [];
// GetTable("highnumber.csv").forEach(row => {
//   highNumbersArray.push(row.HighNumber);
// });

Sequence(
    // ----- Front matter -----
    "welcome",
    "consent",
    // "ask_ID",                      // no trial has this label yet

    "instructions1",
    "practice_intro",

    // ----- Training (loader first, then the training rankings) -----
    "comparisonnumber_list",
    rshuffle("training_test"),

    "instructions2",
    "end_instructions",

    // ----- Loaders for the main task: never shuffled, always before their trials -----
    "comparison_list",                // cards for the country rankings
    "lowQuant_list",                  // low quantifier set
    "highQuant_list",                 // high quantifier set
    "attn1_list",                     // A-E cards for the attention checks

    // ----- Main task, interleaved -----
    rshuffle("poop_test", "lowq_test", "highq_test", "attn_test"),

    // ----- Post-tests: must come after the rankings they read -----
    "posttest_intro",
    rshuffle("posttest"),
    "posttest_check",

    "countryposttest_intro",
    rshuffle("countryposttest"),

    // ----- Wrap up -----
    "demo",
    "send",
    "end"
);
  
// This is run at the beginning of each trial
Header(
    // Declare a global Var element "ID" in which we will store the participant's ID
    newVar("ID").global()    
)
.log( "ID" , getVar("ID") ) // Add the ID to all trials' results lines


newTrial( "welcome" ,
    newImage("labs_long.png")
        .size( 500,100 )      
        .center()
        .print()
    ,
    newText("<b>WELCOME</b>")
        .settings.css("font-size","30")
        .center()
        .print()
    ,
    newText("<p>The following experiment is conducted by a collaboration between the Sorbonne University, the École Normale Superieur, and the Centre National de la Recherche Scientifique.</p>")
        .settings.css("font-size","15")
        .center()
        .print()
    ,
    
    newText("<p>Before continuing, please make sure that you are in a calm and quiet environment. The task will require your full attention and concentration. Please remove any potential source of distraction and turn off any sound system around you (please mute speakers, put phone on silence mode, turn the TV off, etc).</p>")
        .settings.css("font-size","15")
        .center()
        .print()
    ,
    newButton("next", "Continue")
        .center()
        .print()
        .wait()
    );


// End screen
PennController("end",
    newText("Thank you for your participation!<br><br>")
        .center()
        .print()
        ,
    newText("link",'<a href="https://app.prolific.com/submissions/complete?cc=CHFTNE6M">Click here if you do not automatically redirect.</a><br><br>')
        .center()
        .print()
    ,
    newText("Or, enter this completion code: CHFTNE6M")
        .center()
        .print()
    ,
    newKey("end", " ")
        .wait()
).setOption("countsForProgressBar", false);

// Send results at the end of the experiment
PennController.SendResults("send");