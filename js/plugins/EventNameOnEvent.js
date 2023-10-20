(function () {
    // Variables globales pour stocker les informations des événements
    window.eventInfoCache = {};
    var eventTextSprites = {};

    // Initialise le sprite de texte pour un événement donné
    function initializeTextSprite(eventId) {
        var playerlevel = $gameParty.leader().level;
        var event = $gameMap.event(eventId);
        var levelMeta = event.event().meta.level || "1";
        var level;

        if (event && event.event().meta.showText) {
            if (event._erased) {
                // Si le monstre a été tué, générer un nouveau niveau
                if (levelMeta.includes('-')) {
                    var levelRange = levelMeta.split('-');
                    var minLevel = parseInt(levelRange[0]);
                    var maxLevel = parseInt(levelRange[1]);
                    level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
                } else {
                    level = parseInt(levelMeta);
                }
            } else if (eventInfoCache[eventId] && eventInfoCache[eventId].level) {
                // Si le monstre n'a pas été tué, utiliser le niveau du cache
                level = eventInfoCache[eventId].level;
            } else {
                // Si le monstre apparaît pour la première fois, générer un niveau
                if (levelMeta.includes('-')) {
                    var levelRange = levelMeta.split('-');
                    var minLevel = parseInt(levelRange[0]);
                    var maxLevel = parseInt(levelRange[1]);
                    level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
                } else {
                    level = parseInt(levelMeta);
                }
            }

            eventInfoCache[eventId] = { level: level };  // Mise à jour du cache avec le niveau actuel

            var name = event.event().name;
            var text = name + " Niveau " + level;
            var textSprite = new Sprite(new Bitmap(160, 50));
            textSprite.bitmap.fontSize = 14;
            var textWidth = textSprite.bitmap.measureTextWidth(text);
            textSprite.bitmap.resize(textWidth, 50);

            // Couleur des noms selon level
            var leveldiff = playerlevel - level;
            if (leveldiff < -3) { //rouge
                textSprite.bitmap.textColor = '#E5003F';
            }
            else if (leveldiff >= -3 && leveldiff <= 3) {//jaune   
                textSprite.bitmap.textColor = '#E1E73A'
            }
            else if (leveldiff >= 4 && leveldiff <= 5) { // vert
                textSprite.bitmap.textColor = '#5FE73A'
            }
            else if (leveldiff >= 6) { // gris
                textSprite.bitmap.textColor = '#B1B1B1'
            }
            textSprite.bitmap.drawText(text, 0, 0, textWidth, 50);

            if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._tilemap) {
                SceneManager._scene._spriteset._tilemap.addChild(textSprite);
            }

            textSprite.visible = false;
            eventTextSprites[eventId] = {
                sprite: textSprite,
                width: textWidth
            };
        }
    }

    // Réinitialise les sprites de texte pour tous les événements
    function resetEventTextSprites() {
        var allEvents = $gameMap.events();
        allEvents.forEach(function (event) {
            var eventId = event.eventId();
            if (event.event().meta.showText) {
                initializeTextSprite(eventId);
            }
        });
    }

    // Met à jour la position des sprites de texte pour tous les événements
    function updateAllEventTextSprites() {
        var allEvents = $gameMap.events();
        allEvents.forEach(function (event) {
            var eventId = event.eventId();
            if (eventTextSprites[eventId]) {
                var textSprite = eventTextSprites[eventId].sprite;
                textSprite.x = event.screenX() - eventTextSprites[eventId].width / 2;
                textSprite.y = event.screenY() - 100;
                if (event._erased) {
                    textSprite.visible = false;
                } else {
                    textSprite.visible = Input.isPressed('tab');
                }
            }
        });
    }

    // Alias pour la méthode start de Scene_Map
    var alias_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        alias_Scene_Map_start.call(this);
        resetEventTextSprites();
    };

    // Alias pour la méthode update de Scene_Map
    var alias_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        alias_Scene_Map_update.call(this);
        updateAllEventTextSprites();
    };

    // Alias pour la méthode terminate de Scene_Battle
    var alias_Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function () {
        alias_Scene_Battle_terminate.call(this);
        resetEventTextSprites();
    };

})();
