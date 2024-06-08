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

			caution, when size is even, this returns a tile boundary.

			Essentially
			ClearanceTile grid pos To Center coordinates.
		*/
		
		this.getCenterReal = function(x_pos,y_pos,size,outArr) {
			let centerTile = 0;
			//if ( size % 2 == 0 ) centerTile = 0.5;
			//center of agent
			outArr[0] = (x_pos + size * 0.5 + centerTile) * Shared.cellSize; 
			outArr[1] = (y_pos + size * 0.5 + centerTile) * Shared.cellSize;
		};

		/*
			up is +
			right is +

			returns the Tile 1d
			that can be used into the Path.clearance array.

			CenterTile In Coordinates To ClearanceTile
		*/
		this.getClearanceTileFromXY = function(realPosX,realPosY,agentSize) {

			let cellSize = Shared.cellSize;
			let tileX = ~~(realPosX/cellSize);
			let tileY = ~~(realPosY/cellSize);

			if (agentSize == 1) return Shared.gridWidth * tileY + tileX;

			let isOdd = true;
			if ( agentSize % 2 == 0 ) isOdd = false;
			//If even, the node cannot be a center node, even sized agents have no center node
			//Must use rounding.
			//First get tile.
			let clearanceOffsetX = ~~(agentSize/2);
			let clearanceOffsetY = clearanceOffsetX;
			if (!isOdd) {
				//With even, assume center is 2x2, instead of 1x1.
				

				//0->1
				let coverageX = (realPosX % cellSize)/cellSize;
				let coverageY = (realPosY % cellSize)/cellSize;
				/*
				if (coverageX <= 0.5) {
					//closer to left
					//It centers to the left, so this tile given is right of 2x2 center.
					clearanceOffsetX = agentSize/2;
				} else {
					//closer to right
					//It centers to the right, so this tile given is left of 2x2 center.
					clearanceOffsetX = agentSize/2-1
				}
				*/
				clearanceOffsetX = agentSize/2-Math.Round(coverageX);

				/*
				if (coverageY <= 0.5) {
					//closer to lower
					clearanceOffsetY = agentSize/2;
				} else {
					//closer to upper
					clearanceOffsetY = agentSize/2;
				}
				*/
				clearanceOffsetY = agentSize/2-Math.Round(coverageY);

			}

			let clearanceTileX = tileX - clearanceOffsetX;
			let clearanceTileY = tileY - clearanceOffsetY;

			return Shared.gridWidth * clearanceTileY + clearanceTileX;

		};

		//divide realPos by cellSize , convert to int, gets the tile.
		//this corresponds to point bottom-left
		this.getTileFromReal = function(x) {
			return ~~(x/Shared.cellSize);
		};

		this.getTile1DFromPos = function(x,y) {
			return Shared.gridWidth * ~~(y/Shared.cellSize) + ~~(x/Shared.cellSize);
		}


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