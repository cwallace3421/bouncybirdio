var Client = {};

Client.Connect = function() {
	Client.socket = io.connect();

	Client.socket.on('init', function(data) {
		if (data.players) {
			for (var p in data.players) {
				Game.addPlayer(data.players[p]);
			}
		}
		if (data.pipes) {
			for (var p in data.pipes) {
				Game.addPipe(data.pipes[p]);
			}
		}
	});

	Client.socket.on('update', function(data) {
		if (data.init) {
			for (var p in data.init) {
				if (!Game.playerExists(data.init[p].id)) {
					Game.addPlayer(data.init[p]);
				}
			}
		}
			
		Game.PlayerListNewState = data.update || [];

		if (data.remove) {
			for (let i = 0; i < data.remove.length; i++) {
				Game.removePlayer(data.remove[i]);
			}
		}
	});

	Client.socket.on('connect_error', function() {
		Client.socket.disconnect();
		GameError.setmessage('Server Unavailable');
		game.state.start('GameError');
	});
};

Client.Start = function() {
	hasSocket();
	console.log('Client.Start');
	Client.socket.emit('keypress', {
		type: Constants.START,
		state: Constants.KEYUP
	});
};

Client.Jump = function() {
	hasSocket();
	console.log('Client.Jump');
	Client.socket.emit('keypress', {
		type: Constants.JUMP,
		state: Constants.KEYDOWN
	});
};

Client.Reset = function() {
	hasSocket();
	console.log('Client.Reset');
	Client.socket.emit('keypress', {
		type: Constants.RESET,
		state: Constants.KEYUP
	});
};


/*
	Helpers
*/
function hasSocket() {
	if (!Client.socket)
		throw 'Client not connected to server';
}




/*

Client.join = function() {
	Client.socket.emit('join', Game.uuid);
};

Client.socket.on('join', function(data) {
	Game.join(data.uuid, data.x, data.y);
});

Client.socket.on('leave', function(uuid) {
	Game.leave(uuid);
});





Client.sendTest = function() {
	console.log('test send');
	Client.socket.emit('test');
};

Client.askNewPlayer = function() {
	Client.socket.emit('newplayer');
};

Client.sendClick = function(x, y) {
	Client.socket.emit('click', {
		x: x,
		y: y
	});
};

Client.socket.on('newplayer', function(data) {
	Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function(data) {
	for (var i = 0; i < data.length; i++) {
		Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
	}
});

Client.socket.on('move', function(data) {
	Game.movePlayer(data.id, data.x, data.y);
});

Client.socket.on('remove', function(id) {
	Game.removePlayer(id);
})
*/