const _ = require('./constants.js');

class Pipe {

	constructor(id, x, y, dir) {
		this.id = id,
		this.x = x,
		this.y = y,
		this.dir = dir // 1 = down, -1 = up, 0 = not valid
	}

	entityCollide(entity, width, height) {
		if (this.dir === 1) {
			return this.entityCollidePipeDown(entity, width, height);
		}
		if (this.dir === -1) {
			return this.entityCollidePipeUp(entity, width, height);
		}
		return false;
	}

	entityCollidePipeDown(entity, width, height) {
		return entity.y < this.y && this.entityCollidePipeWidth(entity, width);
	};

	entityCollidePipeUp(entity, width, height) {
		return entity.y + height > this.y && this.entityCollidePipeWidth(entity, width);
	};

	entityCollidePipeWidth(entity, width) {
		let leftx = this.x - (_.PIPEWIDTH / 2);
		let rightx = this.x + (_.PIPEWIDTH / 2);
		return (entity.x + width) > leftx && entity.x < rightx;
	};

	getInitPacket() {
		return this;
	};

}
module.exports = Pipe;