const _ = require('./constants.js');
const Player = require('./player.js');

const PlayerMap = {};
const ToCreate = [];
const ToRemove = [];

function Connect(socket, init) {
	//when a client connects
	//create new player obj, send init packets
	let player = new Player(socket.id, null, 0, 0, '#00FF00');
	Realise(player);

	// Listen for keypress from client
	socket.on('keypress', function(data) {
		//data.type, ie. jump, attack etc
		//data.state, up down
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

	// On connect inform client of all players
	// socket.emit('init', {
	// 	players: GetInitPacket(),
	// 	pipes: GetInitPacket()
	// });
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
	// for (let id in PlayerMap) {
	// 	packet.push(PlayerMap[id].getInitPacket());
	// }
	return packet;
}

function GetUpdatePacket() {
	let packet = [];
	ForEachPlayer((player) => {
		packet.push(player.getUpdatePacket());
	});
	// for (let id in Player.$Map) {
	// 	packet.push(Player.$Map[p].getupdatepacket());
	// }
	return packet;
}

function UpdatePlayers() {
	ForEachPlayer((player) => {
		player.update();
	});
	// for (let p in Player.$Map) {
	// 	Player.$Map[p].update();
	// }
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