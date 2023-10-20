
(function () {
    window.updateExperienceAndGoldOnServer = function (experienceToAdd, goldToAdd) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:8000/api/player/update-experience-and-gold');
        xhr.setRequestHeader('Content-Type', 'application/json');
        // Include the token in the request headers
        xhr.setRequestHeader('Authorization', '17bf022324cc6b7913a8b9f3976e256c600361880a720c647f5c77f7919d6c75');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('Experience and gold successfully updated on the server');
            } else if (xhr.readyState === 4) {
                console.log('Error updating experience and gold on the server', xhr.status, xhr.responseText);
            }
        };

        var data = JSON.stringify({
            "experience": experienceToAdd,
            "gold": goldToAdd
        });
        xhr.send(data);
    };

    window.loadPlayerDataFromServer = function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:8000/api/player/get-experience-and-gold');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', '17bf022324cc6b7913a8b9f3976e256c600361880a720c647f5c77f7919d6c75');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);

                console.log('Data retrieved:', response);

                var experience = response.data.experience;
                var gold = response.data.gold;

                console.log('Setting Experience to:', experience);
                console.log('Setting Gold to:', gold);

                // Updating values in RPG Maker MV/MZ
                $gameParty.gainGold(gold - $gameParty.gold()); // Set gold to the retrieved amount
                var actor = $gameActors.actor(1); // Assuming 1 is the actor ID you want to modify
                actor.changeExp(experience, false); // Set experience to the retrieved amount
            }
        };

        xhr.send();
    };


    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);  // Calls the original method
        // Check if the function has already been called
        if (!$gameSwitches.value(1)) {  // Replace 1 with the ID of a switch you are not using
            loadPlayerDataFromServer();  // Your custom function
            // Set the switch to true so the function is not called again
            $gameSwitches.setValue(1, true);
        }
    };

    window.sendBattleRewardsToServer = function (experience, gold) {
        updateExperienceAndGoldOnServer(experience, gold);
    };








})();
