(function () {
    var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('save', null);
    };
})();
(function () {
    Window_MenuCommand.prototype.addSaveCommand = function () {
        // Cette fonction est intentionnellement laissée vide pour désactiver l'option de sauvegarde.
    };
    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function () {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler('continue', null);
    };
})();
