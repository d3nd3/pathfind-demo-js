define(['app/shared'],function (Shared) {

	function Util () {
		console.log('creating Util');
		//variables that will hold the return value
		this.iconvArr = new Int32Array(2);
		this.fconvArr = new Float32Array(2);


		this.aVector = new THREE.Vector3( 0, 0, 0 );


		this.getRandomInt = function (min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;	
		};

		this.randHex = function() {
			var out = 0;
			for ( var i = 0; i < 8; i++ )
			{	
				out = out + this.getRandomInt(0,16)*Math.pow(16,i)
			}

			return out;
		};

		this.twoarrayToone = function (x,y) {
			return Shared.gridWidth * y + x;
		};

		this.onearrayTotwo = function ( n , outArr ) {
			outArr[0] = n % Shared.gridWidth;
			outArr[1] = (n - outArr[0]) / Shared.gridWidth;
		};

		/*
			convert x,y with size
			return outArr , 2d vector

			INTEGER TO REAL

			x= -  +
			y=  +
				-
			negative x, positive y (TOP LEFT)
			the clearance data was set using (positive x,negative y) (towards BOTTOM RIGHT)
		*/
		
		this.getCenterReal = function(x_pos,y_pos,size,outArr) {
			let centerTile = 0;
			if ( size % 2 == 0 ) centerTile = 0.5;
			//center of agent
			outArr[0] = (x_pos + size * 0.5 + centerTile) * Shared.cellSize; 
			outArr[1] = (y_pos + size * 0.5 + centerTile) * Shared.cellSize;
		};
		/*this.getCenterReal = function(x,y,size,outArr) {
			var p = Shared.cellSize * 0.5;
			var s = ~~(size * 0.5);
			outArr[0] = (x + s) * Shared.cellSize + p;
			outArr[1] = (y - s) * Shared.cellSize + p;
		};*/

		//divide realPos by cellSize , convert to int, gets the tile.
		this.getTileFromReal = function(x) {
			return ~~(x/Shared.cellSize);
		};

		/*make sub's prototype be an object created from another prototype(base) so there is a [prototype] chain
			thus when the 'extended' prototype is instantiated, it'll look like
			child1 =p> sub.prototype =p> base.prototype
		*/
		this.extend = function (base, sub) {
			var origProto = sub.prototype;
			// returns an object with internal prototype linked to base.prototype
			sub.prototype = Object.create(base.prototype);

			//move any currently set prototype proprties onto the new one
			for (var key in origProto)  {
				sub.prototype[key] = origProto[key];
			}

			//update constructor as it was before
			// Remember the constructor property was set wrong, let's fix it
			sub.prototype.constructor = sub;
			// In ECMAScript5+ (all modern browsers), you can make the constructor property
			// non-enumerable if you define it like this instead
			Object.defineProperty(sub.prototype, 'constructor', { 
				enumerable: false, 
				value: sub 
			});
		};



		this.getExactCoordinates = function(startElement,event) {
				var totalOffsetX = 0;
			    var totalOffsetY = 0;
			    var canvasX = 0;
			    var canvasY = 0;
			    var currentElement = startElement;

			    do{
			        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
			        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
			    }
			    while(currentElement = currentElement.offsetParent)

			    this.fconvArr[0] = event.pageX - totalOffsetX;
			    this.fconvArr[1] = event.pageY - totalOffsetY;
		}
	}
	return new Util();
});