var game;

window.onload = function() {

    game = new Phaser.Game(800, 600, Phaser.AUTO, 'container');

    game.state.add('Game', Game);
    game.state.start('Game');

};