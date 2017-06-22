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
		// this packet might contain all the functions and be unnessacrily bloated
	};

}
module.exports = Pipe;