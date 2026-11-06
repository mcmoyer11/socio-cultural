PennController.ResetPrefix(null); // For shorter commands
// DebugOff();

Sequence(
     "consent", 
     "ask_ID", 
     "instructions1", 
     "instructions2",
     "practice_intro",
     "training",
     "instructions2",
    "end_instructions",
    rshuffle(
       rshuffle("attn"), rshuffle("religion"), rshuffle("race"), rshuffle("region")),
    
   "demo", "send", "end")

    
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