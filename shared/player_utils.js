const _ = require('./constants.js');
const Player = require('./player.js');

const PlayerMap = {};
const ToCreate = [];
const ToRemove = [];

function Connect(socket, init) {
	let player = new Player(socket.id, null, 0, 0, '#00FF00');
	Realise(player);

	socket.on('keypress', function(data) {
		switch (data.type) {
			case _.JUMP : {
				if (data.state == _.KEYDOWN) {
					if (player.active) {
						player.jump();
					}
				}
				break;
			}
			case _.START : {
				if (data.state == _.KEYUP) {
					player.start();
				}
				break;
			}
			case _.RESET : {
				if (data.state == _.KEYUP) {
					player.reset();
				}
				break;
			}
			default: {
				console.log('Unknown keypress type' + data);
			}
		}
	});
}

function Disconnect(socket) {
	ToRemove.push(socket.id);
	delete PlayerMap[socket.id];
}

function GetInitPacket() {
	let packet = [];
	ForEachPlayer((player) => {
		packet.push(player.getInitPacket());
	});
	return packet;
}

function GetUpdatePacket() {
	let packet = [];
	ForEachPlayer((player) => {
		packet.push(player.getUpdatePacket());
	});
	return packet;
}

function UpdatePlayers() {
	ForEachPlayer((player) => {
		player.update();
	});
}

module.exports.PlayerMap = PlayerMap;
module.exports.ToCreate = ToCreate;
module.exports.ToRemove = ToRemove;

module.exports.Connect = Connect;
module.exports.Disconnect = Disconnect;
module.exports.GetInitPacket = GetInitPacket;
module.exports.GetUpdatePacket = GetUpdatePacket;
module.exports.UpdatePlayers = UpdatePlayers;

/*
	Utils
*/

function ForEachPlayer(func) {
	for (let id in PlayerMap) {
		func(PlayerMap[id]);
	}
}

function Realise(player) {
	PlayerMap[player.id] = player;
	ToCreate.push(player.getInitPacket());
}