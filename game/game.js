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

	game.load.spritesheet('character', 'assets/character.png', Constants.PLAYERWIDTH, Constants.PLAYERHEIGHT, 4);
};

Game.create = function() {
	game.world.setBounds(0, 0, Constants.WORLDWIDTH, Constants.WORLDHEIGHT);

	Game.sprBackground = game.add.tileSprite(0, 0, Constants.WORLDWIDTH, Constants.WORLDHEIGHT, 'background_repeating');

	Game.PlayerMap = {};
	Game.PlayerListNewState = [];
	Game.initPipePools();

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
		game.camera.deadzone = new Phaser.Rectangle(Constants.DEADZONEX, 0, 1, Constants.VIEWHEIGHT);
	}

	Game.updatePipes();
};

Game.addPlayer = function(player) {
	console.log('Creating player: ' + player.id);
	player.sprite = game.add.sprite(Constants.PLAYERWIDTH, Constants.PLAYERHEIGHT, 'character');
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

Game.updatePipes = function() {
	for (var p in Game.PipeList) {
		let pipe = Game.PipeList[p];
		if (pipe.x > (game.camera.world.x - Constants.PIPEWIDTH) && pipe.x < ((game.camera.world.x + game.camera.world.width) + Constants.PIPEWIDTH)) {
			// If pipe inside camera, get pipe if sprite doesn't exist
			if (!Game.PipeList[p].sprite) {
				if (pipe.dir == 1) {
					Game.PipeList[p].sprite = Game.DownPipePool.getFirstDead(false, pipe.x, pipe.y);
				} else if (pipe.dir == -1) {
					Game.PipeList[p].sprite = Game.UpPipePool.getFirstDead(false, pipe.x, pipe.y);
				}
			}
		} else {
			// If pipe outside camera, kill sprite if exists and set sprite to null
			if (Game.PipeList[p].sprite) {
				Game.PipeList[p].sprite.kill();
			}
			Game.PipeList[p].sprite = null;
		}
	}
};

Game.initPipePools = function() {
	Game.DownPipePool = game.add.group(undefined, 'down-pipe-pool');
	for (let i = 1; i <= 5; i++) {
		let parent = game.add.sprite(0, 0, null);
		parent.anchor.setTo(0.5, 0.5);
		parent.x = 0;
		parent.y = (Constants.WORLDHEIGHT / 2); // Comes down from the top of the screen to this y
		parent.outOfCameraBoundsKill = true;
		parent.autoCull = true;
		parent.kill();

		let pipestem = game.add.sprite(52, 1, 'pipe');
		pipestem.anchor.setTo(0.5, 1);
		pipestem.height = Constants.WORLDHEIGHT;
		pipestem.x = 0;
		pipestem.y = 0;
		parent.addChild(pipestem);

		let pipecap = game.add.sprite(52, 26, 'pipe-down');
		pipecap.anchor.setTo(0.5, 1);
		pipecap.x = 0;
		pipecap.y = 0;
		parent.addChild(pipecap);

		Game.DownPipePool.add(parent);
	}

	Game.UpPipePool = game.add.group(undefined, 'up-pipe-pool');
	for (let i = 1; i <= 5; i++) {
		let parent = game.add.sprite(0, 0, null);
		parent.anchor.setTo(0.5, 1);
		parent.x = 0;
		parent.y = (Constants.WORLDHEIGHT / 2); // Comes up from the bottom of the screen to this y
		parent.outOfCameraBoundsKill = true;
		parent.autoCull = true;
		parent.kill();

		let pipestem = game.add.sprite(52, 1, 'pipe');
		pipestem.anchor.setTo(0.5, 0);
		pipestem.height = Constants.WORLDHEIGHT;
		pipestem.x = 0;
		pipestem.y = 0;
		parent.addChild(pipestem);

		let pipecap = game.add.sprite(52, 26, 'pipe-up');
		pipecap.anchor.setTo(0.5, 0);
		pipecap.x = 0;
		pipecap.y = 0;
		parent.addChild(pipecap);

		Game.UpPipePool.add(parent);
	}
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