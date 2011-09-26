var AnswerApp = Spine.Controller.create({
    events: {
        "click .submit": "answer",
        "click .start" : "initNextQuestion" 
    },
    elements: {
        "#map":         "mapEl", 
        "#question":    "questionEl", 
    },
    proxied: ["initNextQuestion", "answer", "finish"],
    init: function() {
        // Create map controller
        this.map = Map.init({ 
            el: this.mapEl,
            paths: this.data.Path,
            markers: this.data.Marker
        });

        // Create question models
        for (var i in this.data.Question) {
            Question.create(this.data.Question[i]);
        }

        // Current question num
        this.questionNum = 0;
        // Stored answers
        this.answers = [];

        // Show welcome text
        this.questionEl.html($.tmpl("welcomeTmpl", this.data.Poll));
        this.map.hide();
    },
    initNextQuestion: function() {
        this.questionNum++;
        var num = this.questionNum;
        this.activeQuestion = Question.select(function(q) {
            if (q.num == num) {
                return true;
            }
        })[0];

        if (!this.activeQuestion) {
            // No more questions
            this.finish();
            return;
        }

        if ( this.activeQuestion.lat && this.activeQuestion.lng ) {
            this.map.setCenter(
                this.activeQuestion.lat, 
                this.activeQuestion.lng,
                this.activeQuestion.zoom
            );
            if (this.activeQuestion.answer_location == "1") {
                this.map.setSelectable(true);
            } else {
                this.map.setSelectable(false);
            }
        } else {
            this.map.hide();
        }
        this.questionEl.html($.tmpl("questionTmpl", this.activeQuestion));
    },
    finish: function() {
        var answers = JSON.stringify(this.answers);
        this.el.find( "#dataField" ).val(answers);
        this.el.find( "#postForm" ).submit();
    },
    answer: function() {
        var answerSelector;
        if ( this.activeQuestion.type == 1 ) {
            answerSelector = "textarea";
        } else {
            answerSelector = "input:checked";
        }

        var continueSubmit = true;

        var answerLoc = "";
        if ( this.activeQuestion.answer_location == "1" ) {
            // Make sure user has selected location
            answerLoc = this.map.getAnswerLoc();

            if ( !answerLoc ) {
                this.mapEl.qtip({
                    content: "Et ole valinnut sijaintia kartalta",
                    position: {
                        my: "bottom center",
                        at: "top center",
                        adjust: {
                            x: 200
                        }
                    },
                    show: {
                        ready: true,
                        event: null
                    },
                    hide: {
                        event: null
                    },
                    style: {
                        classes: "ui-tooltip-shadow ui-tooltip-rounded ui-tooltip-red"
                    }
                })
                continueSubmit = false;
            } else {
                this.mapEl.qtip( "destroy" );
            }
        }

        // Make sure user has answered something
        var answerVal = this.questionEl.find( answerSelector ).val();
        if ( !answerVal ) {
            $( answerSelector ).focus();
            $( ".answer-field", this.el ).qtip({
                content: "Et ole vastannut kysymykseen",
                position: {
                    my: "top center",
                    at: "bottom center",
                    adjust: {
                        x: -200
                    }
                },
                show: {
                    ready: true,
                    event: "focus"
                },
                hide: {
                    event: null
                },
                style: {
                    classes: "ui-tooltip-shadow ui-tooltip-rounded ui-tooltip-red"
                }
            });
            continueSubmit = false;
        } else {
            $( ".answer-field", this.el ).qtip( "destroy" );
        }
        
        if (continueSubmit) {
            this.answers.push({
                text: answerVal,
                loc: answerLoc
            });
            this.initNextQuestion();
        }

        return false;
    }
});




// jQuery(function($){
//     var app = new App({
//         el: $("#poll"),
//         poll: new Poll(data.Poll)
//     });

// LiveController.create({
//     el: $("#poll"),

//     elements: {
//         "#questions": "questionsEl"
//     },

//     events: {
//         "change input, textarea": "changed"
//     },

//     proxied: ["render", "changed"],

//     init: function(data) {
//         this.initLive();
//         console.info("app init");
//         $.template("pollTmpl", $("#pollTmpl"));
//         this.poll = Poll.init(data.Poll);
//         this.poll.bind("refresh change", this.render);
//         this.render();
//         // this.sidebar = Sidebar.init({el: this.sidebarEl});
//         // this.contact = Contacts.init({el: this.contactsEl});
//     },
//     render: function() {
//         this.el.html($.tmpl("pollTmpl", this.poll));
//         return this;
//     },
//     changed: function(e) {
//         var target = e.currentTarget,
//             value = $(target).val();
//         console.info({target: value});
//     }
// }).init(data);


// });