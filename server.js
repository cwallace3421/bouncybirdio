var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/css'));
app.use('/game', express.static(__dirname + '/game'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 8081, function() {
	console.log('Listening on ' + server.address().port);
});

// Private _name
// Static $Name
// Object Name

let Tick_Rate = 20;
let Socket_Map = {};

let Player = function(id, nick, x, y, color) {
	let _self = {
		id: id,
		nick: nick,
		active: false,
		x: 800 / 2,
		xvel: 0,
		xvel_max: 0,
		y: 600 / 3,
		yvel: 0,
		yvel_max: 0,
		pressingjump: false,
		previous: null
	};

	_self.update = function() {
		if (!_self.active)
			return;

		_self.updatepos();
	};

	_self.updatepos = function() {
		if (_self.pressingjump) {
			_self.pressingjump = false;
		}

		_self.x += 16 / Tick_Rate;
		_self.y += 24 / Tick_Rate;

		_self.updatecollision();
	};

	_self.updatecollision = function() {
		if (_self.y > 650) {
			_self.reset();
		}
	};

	_self.reset = function() {
		_self.active = false;
		_self.x = (Math.random() * 600) + 100,
		_self.y = 600 / 3
	};

	_self.getinitpacket = function() {
		return {
			id: _self.id,
			nick: _self.nick,
			x: _self.x,
			y: _self.y
		};
	};

	_self.getupdatepacket = function() {
		return {
			id: _self.id,
			x: _self.x,
			y: _self.y
		};
	};

	Player.$Map[_self.id] = _self;
	Player.$ToCreate.push(_self.getinitpacket());
	return _self;
};
Player.$Map = {};
Player.$ToCreate = [];
Player.$ToRemove = [];
Player.$Connect = function(socket) {
	//when a client connects
	//create new player obj, send init packets
	let player = Player(socket.id, null, 0, 0, '#00FF00');

	// Listen for keypress from client
	socket.on('keypress', function(data) {
		//data.type, ie. jump, attack etc
		//data.state, up down
		switch (data.type) {
			case 'jump': {
				if (data.state === 'down') {
					player.pressingjump = true;
					debug(1, player.id + ' has jumped');
				}
				break;
			}
			case 'start': {
				if (data.state === 'up') {
					player.active = true;
					debug(1, player.id + ' has started');
				}
				break;
			}
			case 'reset': {
				if (data.state === 'up') {
					player.reset();
					debug(1, player.id + ' has reset');
				}
				break;
			}
			default: {
				console.log('Unknown keypress type' + data);
			}
		}
	});

	// On connect inform client of all players
	socket.emit('init', {
		init: Player.$GetInitPacket()
	});
};
Player.$Disconnect = function(socket) {
	Player.$ToRemove.push(socket.id);
	delete Player.$Map[socket.id];
};
Player.$GetInitPacket = function() {
	let packet = [];
	for (let p in Player.$Map) {
		packet.push(Player.$Map[p].getinitpacket());
	}
	return packet;
};
Player.$GetUpdatePacket = function() {
	let packet = [];
	for (let p in Player.$Map) {
		packet.push(Player.$Map[p].getupdatepacket());
	}
	return packet;
};
Player.$UpdatePlayers = function() {
	for (let p in Player.$Map) {
		Player.$Map[p].update();
	}
};



io.on('connection', function(socket) {

	Socket_Map[socket.id] = socket;

	Player.$Connect(socket);

	socket.on('disconnect', function() {
		Player.$Disconnect(socket);
		delete Socket_Map[socket.id];
	});

});


let Update_Packet;

setInterval(function() {

	Player.$UpdatePlayers();

	Update_Packet = {
		update: Player.$GetUpdatePacket()
	};

	if (Player.$ToCreate.length) {
		debug(1, 'Create:', Player.$ToCreate);
		Update_Packet['init'] = Player.$ToCreate;
	}

	if (Player.$ToRemove.length) {
		debug(1, 'Remove:', Player.$ToRemove);
		Update_Packet['remove'] = Player.$ToRemove;
	}

	for (let s in Socket_Map) {
		Socket_Map[s].emit('update', Update_Packet);
	}

	// Cleanup
	Player.$ToCreate = [];
	Player.$ToRemove = [];

	debug(5, 'Update_Packet: ', Update_Packet);
}, Tick_Rate);


/*
	Helpers
*/

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

/*
	Logging
*/
let DEBUG_LEVEL = 1;

function debug(level, message, object) {
	if (DEBUG_LEVEL == 0)
		return;

	if (level <= DEBUG_LEVEL) {
		if (object) {
			console.log(message, object);
		} else {
			console.log(message);
		}
	}
}