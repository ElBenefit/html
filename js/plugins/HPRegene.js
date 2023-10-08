/*:
* @plugindesc Régénère 1 HP toutes les 2 secondes pour tous les acteurs du groupe sur la carte du monde.
*
* @author Votre Nom
*
* @help Ce plugin régénère les points de vie de vos personnages à intervalles réguliers sur la carte du monde.
*/

(function () {

    // Paramètres de régénération
    var REGEN_RATE = 90; // Nombre de frames entre chaque régénération (60 frames = 1 seconde)
    var REGEN_HP_AMOUNT = 1; // Montant de HP à régénérer

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Scene_Map_update.call(this); // Appelle la fonction d'origine
        this.updateRegen(); // Appelle la nouvelle fonction de régénération
    };

    Scene_Map.prototype.updateRegen = function () {
        if (this._regenCounter === undefined) {
            this._regenCounter = REGEN_RATE; // Initialise le compteur si non défini
        }
        this._regenCounter--; // Décompte chaque frame
        if (this._regenCounter <= 0) {
            this._regenCounter = REGEN_RATE; // Réinitialise le compteur
            $gameParty.members().forEach(function (actor) { // Pour chaque acteur du groupe
                if (actor.isAlive()) { // Si l'acteur est en vie
                    actor._hp = Math.min(actor._hp + REGEN_HP_AMOUNT, actor.mhp); // Augmente les HP sans dépasser le max
                }
            });
        }
    };

})();
