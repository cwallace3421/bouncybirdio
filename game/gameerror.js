var GameError = {};


GameError.init = function() {
	game.stage.disableVisibilityChange = true;
};

GameError.preload = function() {

};

GameError.create = function() {
	game.stage.setBackgroundColor(0x000000);
	let = textobj = game.add.text(game.world.centerX, game.world.centerY, "UNKNOWN");
	textobj.anchor.setTo(0.5);
	textobj.font = 'Roboto';
	textobj.fontSize = 32;
	textobj.fill = 'white';
	textobj.align = 'center';
	GameError.textobj = textobj;
};

GameError.update = function() {
	if (GameError.textobj)
		GameError.textobj.text = GameError.message;
};

GameError.setmessage = function(message) {
	GameError.message = message;
};