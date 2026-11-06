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
    newText("In this experiment, your job is to do a series of ranking tasks. For some questions you will rank words based on how likely you would be to use them in a given scenario. In other questions you will order a group of countries based on distance from a specific reference country.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("When ranking words, number 1 will be the word that fits the scenario best and number 5 will be the word that fits the scenario the worst.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print()
    ,
    newText("When ranking countries, number 1 will be the closest country and number 5 will be the furthest country.")
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
    newText("<br>")
        .center()
        .print() 
    ,
    newText("In this task we will be using drag and drops.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("To use this function click and hold on an item on the left side of the screen and drag it to the desired box on the right side of the screen, making sure your cursor is within the box when you let go.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("The boxes on the right side are numbered and have reminders about what you are ordering based on.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print()
    ,
    newText("When all five items are on the right side and you are happy with your order hit next to proceed.")
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
    newText("For our practice questions we will be ordering numbers based on their distance from a reference number.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("The distance between numbers is based on how many digits apart numbers are. So, 2 is 1 digit away from both 1 and 3.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("You can find how many digits apart numbers are by subtracting the smaller number from the larger one. So, to find how many digits apart 1 and 3 are you would subtract 1 from 3 to get 2.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("The fewer digits apart numbers are, the closer they are. Let's compare 1, 5, and 12 to the number 6. 5 is the closest because it is 1 digit away, 1 is the next closest because it is 5 digits away, and 12 is the furthest because it is 6 digits away.")
        .center()
        .print()
    ,
    newText("<br>")
        .center()
        .print() 
    ,
    newText("If you were asked to order 1, 5, and 12 in order of closest to furthest from 6 the answer would be 5, 1, 12. Remember, this is not an order of least to greatest, it is an order of number of digits away from the reference number, in this case 6.")
        .center()
        .print()
    ,
    newText("Press the space bar to continue.")
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