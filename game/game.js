var Game = {};

Game.init = function() {
	game.stage.disableVisibilityChange = true;
	game.renderer.renderSession.roundPixels = true
};

Game.preload = function() {
	game.load.image('background_repeating', 'assets/background_repeating.png');
	game.load.image('pipe', 'assets/pipe.png');
	game.load.image('pipe-up', 'assets/pipe-up.png');
	game.load.image('pipe-down', 'assets/pipe-down.png');

	game.load.spritesheet('character', 'assets/character.png', 34, 24, 4);
};

Game.create = function() {
	game.world.setBounds(0, 0, game.width * 10, game.height);

	Game.sprBackground = game.add.tileSprite(0, 0, game.width * 10, game.height, 'background_repeating');
	Game.sprPlaceholder = game.add.sprite(0, 0, 'pipe-down');

	Game.PlayerMap = {};
	Game.PlayerListNewState = [];

	Client.Connect();

	Game.playerinput();
};

Game.playerinput = function() {
	var jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	jumpKey.onDown.add(Client.Jump, this);
	var startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	startKey.onUp.add(Client.Start, this);
	var resetKey = game.input.keyboard.addKey(Phaser.Keyboard.R);
	resetKey.onUp.add(Client.Reset, this);
};

Game.update = function() {
	if (Game.PlayerListNewState.length > 0) {
		for (var i = 0; i < Game.PlayerListNewState.length; i++) {
			var newstate = Game.PlayerListNewState[i];

			Game.PlayerMap[newstate.id].sprite.x = newstate.x;
			Game.PlayerMap[newstate.id].sprite.y = newstate.y;
		}
		// Could potentially lose a packet here, if we have just received a new one
		Game.PlayerListNewState.length = 0;
	}

	if (game.camera.target == null && Game.PlayerMap[Client.socket.id]) {
		game.camera.follow(Game.PlayerMap[Client.socket.id].sprite);
		game.camera.deadzone = new Phaser.Rectangle(Math.floor(34 * 2), 0, 1, game.height);
	}
};

Game.addPlayer = function(player) {
	console.log('Creating player: ' + player.id);
	player.sprite = game.add.sprite(34, 24, 'character');
	player.sprite.animations.add('flap');
	player.sprite.animations.play('flap', 8, true);
	player.sprite.x = player.x;
	player.sprite.y = player.y;
	Game.PlayerMap[player.id] = player;
};

Game.removePlayer = function(id) {
	Game.PlayerMap[id].sprite.destroy();
	delete Game.PlayerMap[id];
};

Game.playerExists = function(id) {
	return Game.PlayerMap[id];
};





/*

Game.join = function(uuid, x, y) {
	Game.mpPlayers[uuid] = {
		nick: 'unknown',
		active: false,
		sprite: game.add.sprite(x, y, 'character')
	};
};

Game.leave = function(uuid) {
	Game.mpPlayers[uuid].sprite.destroy();
	delete Game.mpPlayers[uuid];
};

Game.jump = function(uuid) {
	
};



Game.getCoordinates = function(layer, pointer) {
	Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.movePlayer = function(id, x, y) {
	var player = Game.playerMap[id];
	var distance = Phaser.Math.distance(player.x, player.y, x, y);
	var duration = distance * 10;
	var tween = game.add.tween(player);
	tween.to({
		x: x,
		y: y
	}, duration);
	tween.start();
};


Game.newRandomUUID = function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
*/