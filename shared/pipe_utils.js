const _ = require('./constants.js');
const Pipe = require('./pipe.js');

const PipeList = [];

function Generate() {
	let prevy = _.WORLDHEIGHT / 2;
	for (let x = _.VIEWWIDTH; x <= _.WORLDWIDTH; x += 350) {
		let y = prevy;
		let gap = (_.PLAYERHEIGHT * 2) + (_.PLAYERHEIGHT * GetRandomInt(3 , 8));
		// down
		Realise(new Pipe(x, y - (gap / 2), 1));
		// up
		Realise(new Pipe(x, y + (gap / 2), -1));
		prevy = y;
	}
	PipeList.sort((a, b) => {
		if (a.x < b.x)
			return -1;
		if (a.x > b.x)
			return 1;
		if (a.x === b.x)
			return 0;
	});
}

function GetInitPacket() {
	let packet = [];
	ForEachPipe((pipe) => {
		packet.push(pipe.getInitPacket());
	});
	return packet;
}

function CheckCollision(player) {
	for (let i = 0; i < PipeList.length; i++) {
		if (player.x < PipeList[i].x - _.PIPEWIDTH) {
			return false;
		} else if (PipeList[i].playerCollide(player)) {
			return true;
		}
	}
	return false;
}

module.exports.PipeList = PipeList;

module.exports.Generate = Generate;
module.exports.GetInitPacket = GetInitPacket;
module.exports.CheckCollision = CheckCollision;

/*
	Utils
*/

function ForEachPipe(func) {
	for (let i = 0; i < PipeList.length; i++) {
		func(PipeList[i]);
	}
}

function Realise(pipe) {
	PipeList.push(pipe);
	return pipe;
}

function GetRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}