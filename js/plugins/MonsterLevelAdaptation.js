(function () {
    var quizEventId = null;

    window.AdjustedBattleExp = 0;
    window.AdjustedBattleGold = 0;
    var _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function () {
        _Game_Event_start.call(this);
        console.log("Event started:", this._eventId);

        window.quizEventId = this._eventId;
        if (this.event().note.includes('<Fight>')) {
            console.log("Starting custom battle for event:", this._eventId);
            startCustomBattle(this._eventId);
        }
    };
    function getAveragePartyLevel() {
        var totalLevel = 0;
        var members = $gameParty.members();
        members.forEach(function (member) {
            totalLevel += member.level;
        });
        return totalLevel / members.length;
    }
    var lastEngagedEventId = null;
    // Sauvegardez la fonction d'initialisation originale
    var _Game_Event_initialize = Game_Event.prototype.initialize;

    // Remplacez la fonction d'initialisation
    Game_Event.prototype.initialize = function (mapId, eventId) {
        // Appelez la fonction d'initialisation originale
        _Game_Event_initialize.call(this, mapId, eventId);

        var note = this.event().note;
        var respawnMatch = note.match(/<Respawn:(\d+)>/i);
        if (respawnMatch) {
            this.respawnTime = Number(respawnMatch[1]) * 60;  // Convertir les secondes en frames
        } else {
            this.respawnTime = null;  // Pas de respawn pour cet événement
        }
        this.respawnTimer = 0;
    };


    var originalEnemyStats = {};

    var _DataManager_loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function () {
        _DataManager_loadDatabase.call(this);
        DataManager._databaseLoaded = false;
    };

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function () {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        if (DataManager._databaseLoaded) return true;
        if ($dataEnemies) {
            initializeEnemyStats();
            DataManager._databaseLoaded = true;
        }
        return false;
    };

    function initializeEnemyStats() {
        $dataEnemies.forEach(function (enemy, index) {
            if (enemy) {
                originalEnemyStats[index] = {
                    hp: enemy.params[0],
                    atk: enemy.params[2],
                    def: enemy.params[3],
                    exp: enemy.exp,
                    gold: enemy.gold
                };
            }
        });
    };
    var combatInitializedForEvents = {};
    function startCustomBattle(eventId) {
        lastEngagedEventId = eventId;
        if (combatInitializedForEvents[eventId]) {
            console.log("Combat already initialized for this event.");
            return;
        }

        var event = $gameMap.event(eventId);
        if (event) {
            combatInitializedForEvents[eventId] = true;  // Marquez cet événement comme ayant initialisé un combat

            var eventInfo = window.eventInfoCache[eventId];
            var eventLevel = eventInfo ? eventInfo.level : 1;

            console.log("Event Level:", eventLevel);
            adjustTroopStats(1, eventLevel);
            BattleManager.setup(1, true, false);
            SceneManager.push(Scene_Battle);
        } else {
            console.error("Event with ID " + eventId + " not found.");
        }
    };



    function adjustTroopStats(troopId, eventLevel) {
        var averagePartyLevel = getAveragePartyLevel();
        var levelDifference = Math.abs(eventLevel - averagePartyLevel);
        var troop = $dataTroops[troopId];
        troop.members.forEach(function (member) {
            window.AdjustedBattleExp = 0;
            window.AdjustedBattleGold = 0;
            var enemy = $dataEnemies[member.enemyId];
            console.log("Original HP:", enemy.params[0]);
            //HP
            enemy.params[0] = enemy.params[0] + Math.round((enemy.params[0] * (eventLevel * 1.2)));
            //ATT
            enemy.params[2] = enemy.params[2] + Math.round((enemy.params[2] * (eventLevel * 0.45)));
            //DEF
            enemy.params[3] = Math.round((enemy.params[3] + (eventLevel * 0.9)));

            //EXPERIENCE
            if (levelDifference <= 6 && averagePartyLevel < eventLevel) { //rouge
                enemy.exp = Math.round(enemy.exp * (eventLevel * 1.2) * 0.9);
            } else if (levelDifference <= 3 && averagePartyLevel >= eventLevel) { //jaune
                enemy.exp = Math.round(enemy.exp * (eventLevel * 1.2));
            } else if (levelDifference >= 6 && averagePartyLevel > eventLevel) { //gris
                enemy.exp = Math.round(enemy.exp * (eventLevel * 1.2) * 0.1);
            } else {
                enemy.exp = Math.round(enemy.exp * (eventLevel * 1.2) * 0.5);
            }

            //GOLD
            enemy.gold = Math.round(enemy.gold * (1 + (eventLevel * 1.1)));
            console.log("Adjusted HP:", enemy.params[0]);
            console.log("Adjusted Attack:", enemy.params[2]);
            console.log("Adjusted Defense:", enemy.params[3]);
            console.log("Adjusted EXP:", enemy.exp);
            console.log("Adjusted Gold:", enemy.gold);
            window.AdjustedBattleExp += enemy.exp;
            window.AdjustedBattleGold += enemy.gold;
        });
    };
    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        this.events().forEach(function (event) {
            if (event.respawnTime !== null && event._erased) {
                event.respawnTimer++;
                if (event.respawnTimer >= event.respawnTime) {
                    event._erased = false;
                    event.refresh();
                    event.respawnTimer = 0;
                }
            }
        });
    };
    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function (result) {
        _BattleManager_endBattle.call(this, result);
        var event = $gameMap.event(lastEngagedEventId);
        // Réinitialisez tous les indicateurs
        combatInitializedForEvents = {};
        var event = $gameMap.event(lastEngagedEventId);

        $dataEnemies.forEach(function (enemy, index) {
            if (enemy && originalEnemyStats[index]) {
                enemy.params[0] = originalEnemyStats[index].hp;
                enemy.params[2] = originalEnemyStats[index].atk;
                enemy.params[3] = originalEnemyStats[index].def;
                enemy.exp = originalEnemyStats[index].exp;
                enemy.gold = originalEnemyStats[index].gold;
            }
        });
        if (event) {
            event._erased = true;
            event.refresh();
        }

        // Ajout de l'expérience au serveur
        if (result === 0) { // Si le combat a été gagné

            updateExperienceOnServer(window.AdjustedBattleExp);
        }
    };

})();