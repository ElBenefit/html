var lastEngagedEventId = null;

(function () {
    // Étendre Game_Event pour inclure la logique de réapparition
    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function (mapId, eventId) {
        _Game_Event_initialize.call(this, mapId, eventId);
        var note = this.event().note;
        var respawnMatch = note.match(/<Respawn:(\d+)>/i);
        if (respawnMatch) {
            this.respawnTime = Number(respawnMatch[1]) * 60;  // Convertir en frames
        }
    };

    var _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function () {
        _Game_Event_start.call(this);
        if (this.page() && this.list().length > 0) {
            var command = this.list()[0];
            if (command && command.code === 301) { // Battle processing
                lastEngagedEventId = this._eventId;
            }
        }
    };

    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        _Game_Map_update.call(this, sceneActive);

        if (!sceneActive) return;

        this.events().forEach(function (event) {
            if (event.respawnTime) {
                if (event._erased) {
                    if (!event._respawnTimer) {
                        event._respawnTimer = event.respawnTime;
                    }
                    event._respawnTimer--;
                    if (event._respawnTimer <= 0) {
                        event._erased = false;
                        event.refresh();
                        event._respawnTimer = null;
                    }
                } else {
                    if (lastEngagedEventId === event._eventId) {
                        event._erased = true;
                        event.refresh();
                        lastEngagedEventId = null;
                    }
                }
            }
        });
    };
})();