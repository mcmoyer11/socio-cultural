Template(GetTable("practice.csv"),
    
    row => newTrial("practice",

        newText("Word1", row.Word1)
            .center()
            .css("font-size", "24px")
            .css("color", "red")
            .print()
        ,
        newText("Word2", row.Word2)
            .center()
            .css("font-size", "24px")
            .css("color", "green")
            .print()
        ,
        newText("spacer1", "<br><br>").print()
        ,
        newText("question", "How similar is the word in red to the word in green?")
            .center()
            .css("font-size", "20px")
            .print()
        ,
        
        newText("spacer2", "<br><br>").print()
        ,
        newScale("slider", 100)
            .slider()
            .center()
            .before(newText("left", "completely&nbsp;<br> dissimilar&nbsp;").css("margin-right", "20px"))
            .after(newText("right", "&nbsp;completely <br>&nbsp;similar").css("margin-left", "20px"))
            .log()
            .print()
        ,
        newText("error", "Please move the slider.")
            .center()
            .css("color", "red")
            .css("margin-top", "10px")
            .hidden()
            .print()
        ,
        newButton("Next")
            .center()
            .print()
            .wait(
                getScale("slider").test.selected()
                    .failure(getText("error").visible())
            )
    )
    .log("FeatureMatch", row.FeatureMatch)
    .log("Word1", row.Word1)
    .log("Word2", row.Word2)

);