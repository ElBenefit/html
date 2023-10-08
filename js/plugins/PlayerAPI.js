
(function () {
    window.updateExperienceOnServer = function (experienceToAdd) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:8000/api/player/update-experience');
        xhr.setRequestHeader('Content-Type', 'application/json');
        // Inclure le token dans les headers de la requête
        xhr.setRequestHeader('Authorization', '9b08e56fd086f85dd1ac533912f4ad9ff899590186bffaed82b7710000318076');


        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('Expérience mise à jour avec succès sur le serveur');
            } else if (xhr.readyState === 4) {
                console.log('Erreur lors de la mise à jour de l\'expérience sur le serveur', xhr.status, xhr.responseText);
            }
        };

        var data = JSON.stringify({ "experience": experienceToAdd });
        xhr.send(data);
    };
    var showLevelUpMessage = true;

    async function getExperienceFromServer() {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "http://127.0.0.1:8000/api/player/get-experience", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        console.log("Expérience obtenue du serveur: ", response.experience);
                        resolve(response.experience);
                    } else {
                        console.log("Erreur lors de la récupération de l'expérience du serveur.");
                        reject(new Error("Failed to fetch experience from server."));
                    }
                }
            };
            xhr.send();
        });
    }

    async function addExperienceToPlayer() {
        try {
            const expPoints = await getExperienceFromServer();
            console.log("Experience Points to Add: " + expPoints);

            if ($gameParty && $gameActors && $gameActors.actor(1)) {
                var actor = $gameActors.actor(1);

                console.log("=== ADDING EXPERIENCE ===");
                console.log("Adding experience: " + expPoints);
                console.log("Current experience: " + actor.currentExp());
                console.log("Next level at: " + actor.nextRequiredExp());
                console.log("Current level: " + actor.level);

                // Save the current level before adding experience
                var lastLevel = actor.level;

                // Temporarily override the displayLevelUp function to do nothing
                var originalDisplayLevelUp = actor.displayLevelUp;
                actor.displayLevelUp = function (newSkills) { };

                actor.gainExp(expPoints);

                // Restore the original displayLevelUp function after gaining experience
                actor.displayLevelUp = originalDisplayLevelUp;

                console.log("--- AFTER ADDING EXPERIENCE ---");
                console.log("New current experience: " + actor.currentExp());
                console.log("New next level at: " + actor.nextRequiredExp());
                console.log("New level: " + actor.level);

                actor.refresh();

                if (SceneManager._scene instanceof Scene_Map) {
                    SceneManager._scene._spriteset.update();
                }
            } else {
                console.error("Actors are not yet loaded. Cannot adjust experience.");
            }
        } catch (error) {
            console.error("Failed to add experience to player: ", error);
        }
    }


    var _Scene_Map_start = Scene_Map.prototype.start;

    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);  // Calls the original method

        // Check if the function has already been called
        if (!$gameSwitches.value(1)) {  // Replace 1 with the ID of a switch you are not using
            addExperienceToPlayer();  // Your custom function

            // Set the switch to true so the function is not called again
            $gameSwitches.setValue(1, true);
        }
    };
})();
