var MyGameNamespace = MyGameNamespace || {};

(function ($) {

    $.DatabaseURL = "https://senkusei-4aa52-default-rtdb.europe-west1.firebasedatabase.app/.json";

    $.portailsArray = [];

    $.xhr = new XMLHttpRequest();
    $.xhr.open('GET', $.DatabaseURL, true);
    $.xhr.onreadystatechange = function () {
        if ($.xhr.readyState === 4 && $.xhr.status === 200) {
            $.portailsArray = JSON.parse($.xhr.responseText);
        }
    };
    $.xhr.send();

    // Désactiver les mouvements du joueur
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

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);
        this.createChoiceWindow();
    };

    Scene_Map.prototype.createChoiceWindow = function () {
        this._choiceWindow = new ($.Window_MultipleChoice)(0, 0);
        this._choiceWindow.setHandler('ok', this.onChoiceOk.bind(this));
        this._choiceWindow.setHandler('cancel', this.onChoiceCancel.bind(this));
        this._choiceWindow.setHandler('close', this.onChoiceCancel.bind(this));
        this.addWindow(this._choiceWindow);
    };

    Scene_Map.prototype.onChoiceOk = function () {
        var selectedItem = this._choiceWindow.currentData();
        var mapName = selectedItem.name;
        var mapId = $.getMapIdByName(mapName);
        if (mapId) {
            setTimeout(function () {
                $gamePlayer.reserveTransfer(mapId, $gamePlayer.x, $gamePlayer.y, $gamePlayer.direction(), 1);
            }, 300);
            this._choiceWindow.close();
        }
    };

    Scene_Map.prototype.onChoiceCancel = function () {
        this._choiceWindow.close();
    };

    $.getMapIdByName = function (mapName) {
        for (var i = 1; i < $dataMapInfos.length; i++) {
            if ($dataMapInfos[i] && $dataMapInfos[i].name === mapName) {
                return $dataMapInfos[i].id;
            }
        }
        console.error("Failed to find map with name:", mapName);
        return null;
    };

    $.Window_MultipleChoice = function () {
        this.initialize.apply(this, arguments);
    };

    $.Window_MultipleChoice.prototype = Object.create(Window_Command.prototype);
    $.Window_MultipleChoice.prototype.constructor = $.Window_MultipleChoice;

    //... [Reste du code Window_MultipleChoice sans modification nécessaire]

    $.Window_MultipleChoice.prototype.initialize = function (x, y) {
        Window_Command.prototype.initialize.call(this, x, y);
        this.openness = 0;
        this.deselect();
    };

    $.Window_MultipleChoice.prototype.makeCommandList = function () {
        for (var i = 0; i < $.portailsArray.length; i++) {
            this.addCommand($.portailsArray[i].nom, 'choice' + i);
        }
        this.addCommand("Fermer", 'close');
    };

    $.Window_MultipleChoice.prototype.numVisibleRows = function () {
        return 8;
    };

    $.Window_MultipleChoice.prototype.itemTextAlign = function () {
        return 'center';
    };

    $.Window_MultipleChoice.prototype.update = function () {
        Window_Command.prototype.update.call(this);
        if (this.active && this._list.length > 0 && this.index() === -1) {
            this.select(0);
        }
    };

    $.Window_MultipleChoice.prototype.open = function () {
        Window_Command.prototype.open.call(this);
        this.activate(); // Activate the window explicitly
        $gamePlayer.setInputDisabled(true);
    };

    $.Window_MultipleChoice.prototype.close = function () {
        Window_Command.prototype.close.call(this);
        $gamePlayer.setInputDisabled(false);
    };

})(MyGameNamespace);