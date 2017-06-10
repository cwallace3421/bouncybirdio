var game;

window.onload = function() {
	// w, h
    game = new Phaser.Game(Constants.VIEWWIDTH, Constants.VIEWHEIGHT, Phaser.AUTO, 'container');

    game.state.add('Game', Game);
    game.state.add('GameError', GameError);
    game.state.start('Game');

};