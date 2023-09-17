(function () {
    // Variable globale pour stocker les informations des �v�nements
    window.eventInfoCache = {};
    var eventTextSprites = {};

    // Initialise le sprite de texte pour un �v�nement donn�
    function initializeTextSprite(eventId) {
        var event = $gameMap.event(eventId);
        if (event && event.event().meta.showText) {
            var levelMeta = event.event().meta.level || "1";
            var level;

            if (levelMeta.includes('-')) {
                var levelRange = levelMeta.split('-');
                var minLevel = parseInt(levelRange[0]);
                var maxLevel = parseInt(levelRange[1]);
                level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
            } else {
                level = parseInt(levelMeta);
            }

            var name = event.event().name;
            var text = name + " Niveau " + level;

            var textSprite = new Sprite(new Bitmap(160, 50));
            textSprite.bitmap.fontSize = 14;
            var textWidth = textSprite.bitmap.measureTextWidth(text);
            textSprite.bitmap.resize(textWidth, 50);
            textSprite.bitmap.drawText(text, 0, 0, textWidth, 50);

            if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._tilemap) {
                SceneManager._scene._spriteset._tilemap.addChild(textSprite);
            }

            textSprite.visible = false;
            eventTextSprites[eventId] = {
                sprite: textSprite,
                width: textWidth
            };

            // Mettre � jour le cache global
            eventInfoCache[eventId] = { level: level, name: name };
        }
    }

    // R�initialise les sprites de texte pour tous les �v�nements
    function resetEventTextSprites() {
        eventTextSprites = {};
        var allEvents = $gameMap.events();
        allEvents.forEach(function (event) {
            var eventId = event.eventId();
            if (event.event().meta.showText) {
                initializeTextSprite(eventId);
            }
        });
    }

    // Met � jour la position des sprites de texte pour tous les �v�nements
    function updateAllEventTextSprites() {
        var allEvents = $gameMap.events();
        allEvents.forEach(function (event) {
            var eventId = event.eventId();
            if (eventTextSprites[eventId]) {
                var textSprite = eventTextSprites[eventId].sprite;
                textSprite.x = event.screenX() - eventTextSprites[eventId].width / 2;
                textSprite.y = event.screenY() - 100;
                textSprite.visible = Input.isPressed('tab');
            }
        });
    }

    // Alias pour la m�thode start de Scene_Map
    var alias_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        alias_Scene_Map_start.call(this);
        resetEventTextSprites();
    };

    // Alias pour la m�thode update de Scene_Map
    var alias_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        alias_Scene_Map_update.call(this);
        updateAllEventTextSprites();
    };

    // Alias pour la m�thode terminate de Scene_Battle
    var alias_Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function () {
        alias_Scene_Battle_terminate.call(this);
        resetEventTextSprites();
    };

    // Alias pour la m�thode setup de Game_Enemy
    var alias_Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function (enemyId, x, y) {
        alias_Game_Enemy_setup.call(this, enemyId, x, y);

        // Essayez de r�cup�rer le niveau du monstre � partir du cache
        var eventInfo = eventInfoCache[enemyId];
        if (eventInfo && eventInfo.level) {
            this._hp *= Number(eventInfo.level);
        }
    };
})();
