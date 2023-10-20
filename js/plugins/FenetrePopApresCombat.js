/*:
 * @plugindesc Affiche des informations supplémentaires après un combat victorieux.
 *
 * @author VotreNom
 *
 * @help Ce plugin affiche une fenêtre avec des informations supplémentaires après
 * une victoire en combat.
 *
 */

var VictoryInfo = VictoryInfo || {};
VictoryInfo.shouldDisplay = false;
VictoryInfo.lastBattleExp = 0;
VictoryInfo.lastBattleGold = 0;
VictoryInfo.lastBattleItems = [];

(function () {

    // Sauvegarde des fonctions originales
    VictoryInfo.originalProcessVictory = BattleManager.processVictory;
    VictoryInfo.originalStart = Scene_Map.prototype.start;

    BattleManager.processVictory = function () {
        VictoryInfo.originalProcessVictory.call(this);
        VictoryInfo.lastBattleExp = window.AdjustedBattleExp;
        VictoryInfo.lastBattleGold = window.AdjustedBattleGold;
        VictoryInfo.lastBattleItems = $gameTroop.makeDropItems();
        VictoryInfo.shouldDisplay = true;
    };

    Scene_Map.prototype.start = function () {
        VictoryInfo.originalStart.call(this);
        if (VictoryInfo.shouldDisplay) {
            var x = (Graphics.boxWidth - 700) / 2;
            var y = (Graphics.boxHeight - 400) / 2;
            var width = 700;
            var height = 400;
            var victoryWindow = new VictoryInfo.Window(x, y, width, height);
            this.addWindow(victoryWindow);
            $gamePlayer.setInputDisabled(true);  // Désactiver le mouvement du joueur ici
        }
    };

    VictoryInfo.Window = function () {
        this.initialize.apply(this, arguments);
    };

    VictoryInfo.Window.prototype = Object.create(Window_Base.prototype);
    VictoryInfo.Window.prototype.constructor = VictoryInfo.Window;

    VictoryInfo.Window.prototype.initialize = function (x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.contents.fontSize = 20;
        this.contents.fontName = 'GameFont';

        this._closeButton = new Sprite(new Bitmap(100, 50));
        this._closeButton.bitmap.fontSize = 20;
        this._closeButton.bitmap.drawText("Fermer", 0, 0, 100, 32, 'center');

        // Position en bas au centre
        this._closeButton.x = (this.width - 100) / 2;
        this._closeButton.y = this.height - 52;

        this._closeButton.isPressed = false;
        this._closeButton.update = function () {
            if (this.isPressed && TouchInput.isReleased()) {
                this.isPressed = false;
                this.parent.close();
                this.parent.visible = false;
                $gamePlayer.setInputDisabled(false);  // Réactivez le mouvement du joueur ici
                VictoryInfo.shouldDisplay = false;    // Réinitialisez cette variable
            }
            if (TouchInput.isTriggered() && this.isTouching()) {
                this.isPressed = true;
            }
        };



        this._closeButton.isTouching = function () {
            const x = this.parent.canvasToLocalX(TouchInput.x);
            const y = this.parent.canvasToLocalY(TouchInput.y);
            return x >= this.x && y >= this.y && x < this.x + this.width && y < this.y + this.height;
        };

        this.addChild(this._closeButton);
        this.refresh();
    };

    VictoryInfo.Window.prototype.refresh = function () {
        this.contents.clear();
        this.drawText('XP gagné : ' + VictoryInfo.lastBattleExp, 50, 0);
        this.drawText('Or gagné : ' + VictoryInfo.lastBattleGold, 250, 0);
        this.showDroppedItems();
    };

    VictoryInfo.Window.prototype.showDroppedItems = function () {
        var yPos = 0;
        this.drawText('Objets gagnés :', 450, yPos);
        yPos += this.lineHeight();
        for (var i = 0; i < VictoryInfo.lastBattleItems.length; i++) {
            this.drawItemName(VictoryInfo.lastBattleItems[i], 450, yPos);
            yPos += this.lineHeight();
        }
    };

    // Désactiver l'appel du menu avec le bouton droit ou le bouton B
    VictoryInfo.originalIsMenuCalled = Scene_Map.prototype.isMenuCalled;
    Scene_Map.prototype.isMenuCalled = function () {
        if (VictoryInfo.shouldDisplay) return false;
        return VictoryInfo.originalIsMenuCalled.call(this);
    };

})();
