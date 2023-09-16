(function () {
    var originalBattleManagerSetup = BattleManager.setup;

    BattleManager.setup = function (troopId, canEscape, canLose) {
        originalBattleManagerSetup.call(this, troopId, canEscape, canLose);

        // Parcourir chaque ennemi dans la troupe
        $gameTroop.members().forEach(function (enemy) {
            console.log(enemy._hp);
            // Obtenir le niveau de l'ennemi (Supposons que le niveau est stocké dans enemy.level)
            var enemyLevel = enemy.level || 1;  // Si le niveau n'est pas défini, on suppose que c'est 1

            // Calculer les nouveaux HP en fonction du niveau
            var newHp = enemy._hp+ 40;

            // Mettre à jour les HP et les HP max de l'ennemi
            enemy._mhp = newHp;
            enemy._hp = newHp;
            console.log(enemy._hp);
            // Log pour le débogage
            console.log("Enemy ID:", enemy.enemyId(), "New HP:", enemy._hp, "New Max HP:", enemy._mhp);
        });
    };
})();
