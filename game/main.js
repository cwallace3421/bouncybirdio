var game;

window.onload = function() {
	// w, h
    game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'container', null, false, false);

    game.state.add('Game', Game);
    game.state.add('GameError', GameError);
    game.state.start('Game');

};