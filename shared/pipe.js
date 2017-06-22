const _ = require('./constants.js');

class Pipe {

	constructor(id, x, y, dir) {
		this.id = id,
		this.x = x,
		this.y = y,
		this.dir = dir // 1 = down, -1 = up, 0 = not valid
	}

	playerCollide(player) {
		if (this.dir === 1) {
			return this.playerCollidePipeDown(player);
		}
		if (this.dir === -1) {
			return this.playerCollidePipeUp(player);
		}
		return false;
	}

	playerCollidePipeDown(player) {
		return player.y < this.y && this.playerCollidePipeWidth(player);
	};

	playerCollidePipeUp(player) {
		return player.y + _.PLAYERHEIGHT > this.y && this.playerCollidePipeWidth(player);
	};

	playerCollidePipeWidth(player) {
		let leftx = this.x - (_.PIPEWIDTH / 2);
		let rightx = this.x + (_.PIPEWIDTH / 2);
		return (player.x + _.PLAYERWIDTH) > leftx && player.x < rightx;
	};

	getInitPacket() {
		return this;
	};

}
module.exports = Pipe;


/*

const Pipe = function(x, y, dir) {
	let _self = {
		id: guid(),
		x: x,
		y: y,
		dir: dir // 1 = down, -1 = up, 0 = not valid
	};

	_self.playercollide = function(player) {

		if (_self.dir == 1) {
			return _self.pipedown(player);
		}

		if (_self.dir == -1) {
			return _self.pipeup(player);
		}

		console.error('Pipe [' + _self.id + '] has invalid direction: ' + _self.dir);
		return false;
	};

	_self.pipedown = function(player) {
		return player.y < _self.y && _self.pipe(player);
	};

	_self.pipeup = function(player) {
		return player.y + _.PLAYERHEIGHT > _self.y && _self.pipe(player);
	};

	_self.pipe = function(player) {
		let leftx = _self.x - (_.PIPEWIDTH / 2);
		let rightx = _self.x + (_.PIPEWIDTH / 2);
		return (player.x + _.PLAYERWIDTH) > leftx && player.x < rightx;
	};

	_self.getinitpacket = function() {
		return _self;
	};

	Pipe.$List.push(_self);
	return _self;
};
Pipe.$List = [];
Pipe.$Generate = function() {
	let prevy = _.WORLDHEIGHT / 2;
	for (let x = _.VIEWWIDTH; x <= _.WORLDWIDTH; x += 350) {
		let y = prevy;
		let gap = (_.PLAYERHEIGHT * 2) + (_.PLAYERHEIGHT * getRandomInt(3 , 8));
		// down
		Pipe(x, y - (gap / 2), 1);
		// up
		Pipe(x, y + (gap / 2), -1);
		prevy = y;
	}
	Pipe.$List.sort(function(a, b) {
		if (a.x < b.x)
			return -1;
		if (a.x > b.x)
			return 1;
		if (a.x === b.x)
			return 0;
	});
};
Pipe.$GetInitPacket = function() {
	let packet = [];
	for (let p = 0; p < Pipe.$List.length; p++) {
		packet.push(Pipe.$List[p].getinitpacket());
	}
	return packet;
};
Pipe.$CheckCollision = function(player) {
	for (let p = 0; p < Pipe.$List.length; p++) {
		if (player.x < Pipe.$List[p].x - _.PIPEWIDTH) {
			return false;
		} else if (Pipe.$List[p].playercollide(player)) {
			return true;
		}
	}
	return false;
};

*/