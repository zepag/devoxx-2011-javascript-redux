/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false;
		
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 81: // Q
				that.left = true;
				break;
			case 90: // Z
				that.up = true;
				break;
			case 68: // D
				that.right = true; // Will take priority over the left key
				break;
			case 83: // S
				that.down = true;
				break;
		};
	};
	
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 81: // Q
				that.left = false;
				break;
			case 90: // Z
				that.up = false;
				break;
			case 68: // D
				that.right = false;
				break;
			case 83: // S
				that.down = false;
				break;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};