newTrial("instructions1",
    newText("<b>INSTRUCTIONS</b>")
        .settings.css("font-size","20")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("In this experiment, your job is to say what you think the social demographic of certain countries are. You will be shown a series of labeled sliders and asked to report either the <b>proportion</b> of the country that is part of that group or the <b>probability</b> that the country is part of that category.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("For <b>proportions</b>, approximate what percentage of the population you expect to be part of each group. For <b>probabilities</b>, indicate how likely you think it is that the country is part of a category.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print()
    ,
    newText("In both cases, the sliders will be labeled with options from a larger category and your percantages across all the sliders must sum to 100. Your total will appear at the bottom of the screen and you won't be able to proceed if it is not exactly 100.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newButton("continue")
        .center()
        .print()
        .wait()
    );
    
newTrial("instructions2",
    newText("<b>INSTRUCTIONS</b>")
        .settings.css("font-size","20")
        .center()
        .print()
    ,
    newText("Importantly, <b>DO NOT</b> look up the correct answer.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("It's okay if you're wrong, just answer based on your gut.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newButton("continue")
        .center()
        .print()
        .wait()
    );
    

newTrial("practice_intro",
    newText("<b>INSTRUCTIONS</b>")
        .settings.css("font-size","20")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("Lets practice before we begin.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("In the next few questions you're going to practice using sliders. You will be shown an image of 10 marbles of varrying colors and asked to say what percent of the marbles are each color. Keep in mind that one marble is ten percent of the ten marbles. So if you had 1 pink marble and 9 blue marbles, the marbles would be 10 percent pink and 90 percent blue.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
     newText("The total percentage across your different sliders will show at the bottom of your screen. You will only be able to proceed if the total equals exactly 100. When using the sliders you can either drag your mouse across the bar or click along the line to set the slider.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("Now let's try out some questions.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newButton("continue")
        .center()
        .print()
        .wait()
    );
    
newTrial("end_instructions",

    newText("Great! Now you're ready for the experiment.")
        .settings.css("font-size","25")
        .center()
        .print()
    ,  
    newText("<br>")
        .center()
        .print()
    ,
    newText("Make sure you're in a quiet room with no distractions.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("Once you start the experiment, do not stop until the end.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("Press the button when you're ready to start.")
        .center()
        .print()
    ,
    newButton("continue")
        .center()
        .print()
        .wait()
    );
// .setOption("countsForProgressBar", false);