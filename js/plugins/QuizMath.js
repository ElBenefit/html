(function () {
    var $dataQuestionsQuizMath = null;
    var isInQuizMode = false;
    var currentQuestion = null;
    var playerAnswer = null;
    var shouldDisplayQuestion = false;
    var askQuestionNextTurn = true;
    var feedbackMessage = null;
    var initialAtk; // Variable pour stocker la valeur initiale de l'attaque

    DataManager.loadDataFile('QuestionsQuizMath', 'QuestionsQuizMath.json');

    var quizMath_DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function (object) {
        quizMath_DataManager_onLoad.call(this, object);
        if (object === $dataQuestionsQuizMath) {
            QuestionsQuizMath = object;
        }
    };
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === "BattleProcessing") {
            console.log(this);
            window.lastEventTriggeredBattle = this.eventId();
        }
    }
    BattleManager.setup = function (troopId, canEscape, canLose) {
        this.initMembers();
        this._canEscape = canEscape;
        this._canLose = canLose;
        $gameTroop.setup(troopId);
        $gameScreen.onBattleStart();
        this.makeEscapeRatio();
        initialAtk = $gameActors.actor(1).atk; // Stockez la valeur initiale de l'attaque ici

        var eventId = window.quizEventId; // Utilisez la variable globale pour obtenir l'ID de l'événement
        var event = $gameMap.event(eventId);
        if (event && event.event().note.indexOf("<Quiz:Math>") !== -1) {
            isInQuizMode = true;
            shouldDisplayQuestion = true;
        }
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function () {
        _Scene_Battle_update.call(this);
        if (feedbackMessage && !$gameMessage.isBusy()) {
            $gameMessage.add(feedbackMessage);
            feedbackMessage = null;
        }
        if (isInQuizMode && shouldDisplayQuestion && !$gameMessage.isBusy() && askQuestionNextTurn) {
            currentQuestion = QuestionsQuizMath[Math.floor(Math.random() * QuestionsQuizMath.length)];
            $gameMessage.add(currentQuestion.question);
            var choices = [];
            for (var i = 0; i < currentQuestion.reponses.length; i++) {
                choices.push(currentQuestion.reponses[i]);
            }
            $gameMessage.setChoices(choices, 0, -1);
            $gameMessage.setChoiceCallback(function (responseIndex) {
                if (isInQuizMode && currentQuestion) {
                    playerAnswer = currentQuestion.reponses[responseIndex];
                    if (playerAnswer === currentQuestion.reponse_correcte) {
                        $gameActors.actor(1).addParam(2, 60);
                        feedbackMessage = "Bien joué !";
                    } else {
                        $gameActors.actor(1).addParam(2, -3);
                        feedbackMessage = "Arg c'est faux ! La bonne réponse était : " + currentQuestion.reponse_correcte;
                    }
                    currentQuestion = null;
                    playerAnswer = null;
                    askQuestionNextTurn = true;
                }
            });
            shouldDisplayQuestion = false;
            askQuestionNextTurn = false;
        }
    };

    var _BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function () {
        _BattleManager_endTurn.call(this);
        if (isInQuizMode) {
            shouldDisplayQuestion = true;
            $gameActors.actor(1).addParam(2, initialAtk - $gameActors.actor(1).atk); // Réinitialisez l'attaque à sa valeur initiale
        }
    };
})();
