const _ = require('./constants.js');

class Player {

	constructor(id, nick, x, y, color) {
		this.id = id,
		this.nick = nick,
		this.active = false,

		this.x = _.STARTX,
		this.xvel = _.MOVEVELOCITY,
		this.xaccl = 0,

		this.y = _.STARTY,
		this.yvel = _.JUMPVELOCITY,
		this.yaccl = _.GRAVITY,

		this.pressingjump = false,
		this.previous = null
	}

	start() {
		this.active = true;
	}

	update() {
		if (!this.active)
			return;
		this.updatePos();
	}

	updatePos() {
		this.yvel += this.yaccl * _.SERVERDELTA;

		if (this.pressingjump) {
			this.pressingjump = false;
			this.yvel = _.JUMPVELOCITY;
		}

		this.y += this.yvel * _.SERVERDELTA;
		this.x += this.xvel * _.SERVERDELTA;

		if (this.y > 650) {
			this.reset();
		}
	}

	jump() {
		this.pressingjump = true;
	}

	reset() {
		this.active = false;
		this.pressingjump = false;
		this.yvel = _.JUMPVELOCITY;
		this.x = _.STARTX;
		this.y = _.STARTY;
	}

	getInitPacket() {
		return {
			id: this.id,
			nick: this.nick,
			x: this.x,
			y: this.y
		};
	}

	getUpdatePacket() {
		return {
			id: this.id,
			x: this.x,
			y: this.y
		};
	}
}
module.exports = Player;