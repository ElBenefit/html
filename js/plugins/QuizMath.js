(function () {
    var $dataQuestionsQuizMath = null;
    var isInQuizMode = false;
    var currentQuestion = null;
    var playerAnswer = null;
    var shouldDisplayQuestion = false;
    var askQuestionNextTurn = true;
    var feedbackMessage = null;

    DataManager.loadDataFile('QuestionsQuizMath', 'QuestionsQuizMath.json');

    DataManager.onLoad = function (object) {
        if (object === $dataQuestionsQuizMath) {
            QuestionsQuizMath = object;
        }
    };

    BattleManager.setup = function (troopId, canEscape, canLose) {
        this.initMembers();
        this._canEscape = canEscape;
        this._canLose = canLose;
        $gameTroop.setup(troopId);
        $gameScreen.onBattleStart();
        this.makeEscapeRatio();
        $dataTroops[troopId].members.forEach(function (member) {
            if ($dataEnemies[member.enemyId] && $dataEnemies[member.enemyId].note.indexOf("<Quiz:Math>") !== -1) {
                isInQuizMode = true;
                shouldDisplayQuestion = true;
            }
        });
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function () {
        _Scene_Battle_update.call(this);

        // Si nous avons un message de feedback à afficher et que le message précédent est terminé
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
                        $gameActors.actor(1)._damage += 6;
                        feedbackMessage = "Bien joué !";
                    } else {
                        $gameActors.actor(1)._damage -= 3;
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

    var _Game_Actor_performAction = Game_Actor.prototype.performAction;
    Game_Actor.prototype.performAction = function (action) {
        if (isInQuizMode && currentQuestion) {
            if (playerAnswer === currentQuestion.reponse_correcte) {
                this._damage += 6;
            } else {
                this._damage -= 3;
            }
            currentQuestion = null;
            playerAnswer = null;
        }
        _Game_Actor_performAction.call(this, action);
    };

    var _BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function () {
        _BattleManager_endTurn.call(this);
        if (isInQuizMode) {
            shouldDisplayQuestion = true;
        }
    };

})();