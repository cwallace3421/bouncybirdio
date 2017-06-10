(function(exports){

	exports.PORT = 8081;

	exports.PLAYERWIDTH = 34;
	exports.PLAYERHEIGHT = 24;

	exports.VIEWWIDTH = 800;
	exports.VIEWHEIGHT = 600;

	exports.WORLDWIDTH = exports.VIEWWIDTH * 10;
	exports.WORLDHEIGHT = exports.VIEWHEIGHT;

	exports.DEADZONEX = exports.PLAYERWIDTH * 2;

	exports.STARTX = exports.VIEWWIDTH * 2;
	exports.STARTY = Math.floor((exports.WORLDHEIGHT / 2) - exports.PLAYERHEIGHT / 2);

	exports.SERVERTICK = 20;
	exports.SERVERDELTA = 1.0 / exports.SERVERTICK;

	exports.GRAVITY = exports.PLAYERHEIGHT * 18;
	exports.MOVEVELOCITY = exports.PLAYERWIDTH * 2;
	exports.JUMPVELOCITY = exports.PLAYERHEIGHT * 11;

	exports.TYPESTART = 'start';
	exports.TYPEJUMP = 'jump';
	exports.TYPERESET = 'reset';

	exports.KEYUP = 'up';
	exports.KEYDOWN = 'down';

}(typeof exports === 'undefined' ? this.Constants = {} : exports));