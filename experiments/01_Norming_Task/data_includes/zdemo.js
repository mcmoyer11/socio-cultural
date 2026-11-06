
newTrial("demo",
    defaultText
        .center()
        .print()
    ,
    newText("<b>The experiment is now over!</b>")
        .settings.css("font-size","30")
        .center()
        .print()
    ,
    newText("1","<br> <br> <br>")
        .print()
    ,
    newText("Please take a couple of minutes to complete the survey below.")
        .center()
        .print()
    ,
    newText("2","<br> <br> <br>")
        .print()
    ,
    newTextInput("NativeLang")
        .log()
        .before( newText("before", "What is your first/native language?&nbsp;") )
        .center()
        .print()
    ,
    newText("warning", "Please enter your native/first language.&nbsp;")
        .color("red")
        .bold()
        .center()
        .visible(false)  // Initially hidden
        .print()         // Print to make its position in layout
    ,
    newText("3","<br> <br>")
        .print()
    ,
    newTextInput("OtherLangs")
        .before( newText("before", "Do you speak any other languages?&nbsp;") )
        .center()
        .print()
    ,
    newText("4","<br> <br>")
        .print()
    ,
    newTextInput("Gender")
        .log()
        .before( newText("before", "What is your gender?&nbsp;") )
        .center()
        .print()
    ,
    newText("5","<br> <br>")
        .print()
    ,
    newTextInput("Education")
        .log()
        .before( newText("before", "What is your highest level of education?&nbsp;") )
        .center()
        .print()
    ,
    newText("6","<br> <br>")
        .print()
    ,
    newTextInput("Difficulty")
        .before( newText("before", "Did you find this task difficult?&nbsp;") )
        .center()
        .print()
    ,   
    newText("7","<br> <br>")
        .print()
    ,
    newTextInput("Comments")
        .before( newText("before", "Please enter any other comments you have about the task.&nbsp;") )
        .center()
        .print()
    ,
    newButton("Submit")
        .center()
        .print()
        .wait(
            getTextInput("NativeLang")
                .testNot.text("")
                .failure( getText("warning").visible(true) )  // Show warning if field is empty
        )
    ,
    // Hide warning if the input is filled successfully
    getText("warning").visible(false)
    ,
    newVar("NativeLang")
        .global()
        .set( getTextInput("NativeLang") )
    ,
    newVar("OtherLangs")
        .global()
        .set( getTextInput("OtherLangs") )
)
.log( "NativeLang" , getVar("NativeLang") )
.log( "OtherLangs" , getVar("OtherLangs") )
.log( "Gender" , getVar("Gender") )
.log( "Education" , getVar("Education") )
.log( "Comments" , getVar("Comments") );
