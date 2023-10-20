(function () {

    function CustomWindow() {
        this.initialize.apply(this, arguments);
    }

    CustomWindow.prototype = Object.create(Window_Command.prototype);
    CustomWindow.prototype.constructor = CustomWindow;

    CustomWindow.prototype.initialize = function (x, y, width, height) {
        Window_Command.prototype.initialize.call(this, x, y);
        this._data = null;
        this.width = width;
        this.height = height;
        this.openness = 0;
        this.deselect();
        this.deactivate();
    };
    CustomWindow.prototype.drawItem = function (index) {
        this.contents.fontSize = 18;
        Window_Command.prototype.drawItem.call(this, index);
    };
    CustomWindow.prototype.setData = function (data) {
        this._data = data.filter(item => item.is_validated && !item.retrieved);
        this.refresh();
        this.open();
        this.activate();
    };

    CustomWindow.prototype.makeCommandList = function () {

        if (this._data) {
            this._data.forEach((item) => {
                console.log("Adding item to command list:", item);  // Debugging line
                this.addCommand(`${item.assignment.title} - ${item.experience_earned}XP, ${item.gold_earned}Senku`, "choose", true, item);
            });
        }
        this.addCommand("Fermer", "cancel", true);
    };

    CustomWindow.prototype.callOkHandler = function () {
        const selectedItem = this.currentExt();
        console.log("Selected item in callOkHandler:", selectedItem);  // Debugging line

        if (this.index() === this.maxItems() - 1) {
            this.close();
            $gamePlayer.setMoveRoute({ list: [{ code: 0 }], repeat: false, skippable: false });
            $gamePlayer.setDirection(2);
        } else {
            this.updatePlayerAndDB(selectedItem);
        }
        Window_Selectable.prototype.callOkHandler.call(this);
    };

    CustomWindow.prototype.updatePlayerAndDB = function () {
        const item = this.currentExt();
        console.log(item);

        // API request to update DB and retrieve updated player info
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://127.0.0.1:8000/api/submissions/${item.id}/claim/`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                console.log(response);

                // Update player in the game using the correct property names
                $gameParty.gainGold(item.gold_earned);

                var actor = $gameActors.actor(1);
                actor.gainExp(item.experience_earned);

                console.log(`New EXP: ${actor.currentExp()}, Level: ${actor.level}`);  // Debug log

                // Remove the claimed submission from the list and refresh the window
                this._data = this._data.filter(submission => submission.id !== item.id);
                this.refresh();

                // Check if there are no more submissions. If true, close the window.
                if (this._data.length === 0) {
                    this.deactivate();
                    this.close();
                    $gamePlayer.setInputDisabled(false);  // Re-enable player input
                } else {
                    this.select(0);  // Reset selection
                    this.activate();
                }
            }
        }.bind(this);

        xhr.send(JSON.stringify({ retrieved: true }));
    };




    async function fetchSubmissionsAsync() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/submissions');
            return response.json();
        } catch (error) {
            console.error("An error occurred while fetching submissions:", error);
            return null;
        }
    }

    CustomWindow.prototype.open = function () {
        Window_Command.prototype.open.call(this);
        this.activate();
        $gamePlayer.setInputDisabled(true);
    };

    CustomWindow.prototype.close = function () {
        Window_Command.prototype.close.call(this);
        $gamePlayer.setInputDisabled(false);
    };

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);
        this._customWindow = new CustomWindow(100, 100, 600, 400);
        this.addWindow(this._customWindow);
    };

    window.showSubmissionsAsChoices = async function () {
        try {
            const submissions = await fetchSubmissionsAsync();
            const scene = SceneManager._scene;

            // Vérifier si submissions est défini et s'il y a des soumissions non récupérées.
            const hasUnretrievedSubmissions = submissions && submissions.submissions.some(sub => !sub.retrieved);

            if (!hasUnretrievedSubmissions) {
                // Aucune submission non récupérée trouvée, affichez un message.
                $gameMessage.setFaceImage('People1', 4);
                $gameMessage.setBackground(0);
                $gameMessage.setPositionType(1);
                $gameMessage.add("Désolé, je n'ai aucune récompense \npour toi pour le moment.");
            } else {
                // Des submissions non récupérées ont été trouvées, affichez-les.
                scene._customWindow.setData(submissions.submissions.filter(sub => !sub.retrieved).slice(0, 6));
                scene._customWindow.activate();
            }
        } catch (error) {
            console.error("An error occurred while showing submissions:", error);
        }
    };

    Game_Player.prototype._inputDisabled = false;

    Game_Player.prototype.setInputDisabled = function (value) {
        this._inputDisabled = value;
    };

    var _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function () {
        if (this._inputDisabled) {
            return false;
        }
        return _Game_Player_canMove.call(this);
    };

})();