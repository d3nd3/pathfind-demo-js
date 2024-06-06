define(['app/waypoints','app/grid','app/map','app/util','app/shared','app/line'],function (Waypoints,Grid,Map,Util,Shared,Line) {

	/*
	primitive unit -- expects to have its fields updated for a unit-type , eg. runner class or chaser
	*/
	function Units() {
		console.log('creating Units');
		var self = this;
		this.newUnit = function Unit (type) {
			this.wpsystem = new Waypoints.newWaypoint();
			this.spawnTile = [];
			this.revivePos = {};
			this.alive = false;
			this.size = 0;
			this.speed = 0;
			this.mesh = {};
			this.type = type;
			this.radius = 0;
		};


		this.newUnit.prototype.moveStraight = function ( allowedDistance) {

			// let aa = this.wpsystem.intervalCb.call(this.wpsystem,this);
			let [destx,desty] = this.wpsystem.intervalCb(this);

			var dx = destx - this.mesh.position.x;
			var dy = desty - this.mesh.position.y;
			

			var distThere = Math.sqrt(dx*dx+dy*dy);

			var newpos;
			var newposTile;

			/*
				the distance is too far, so only move what u can .. even tho u wont reach the complete dest
				dist to get there is more than allowed distance, so move allowed distance ONLY.
				because this is allowed distance per 'frame' or 'tick', so to speak, so job done. easy.
			*/
			if ( distThere > allowedDistance ) {
				//SMALL STEP. NEED MORE FRAMES TO REACH DEST.

				var ratio = allowedDistance / distThere;
				


				var aNewPosX = this.mesh.position.x + dx * ratio;
				var aNewPosY = this.mesh.position.y + dy * ratio;

				var lolx = Util.getTileFromReal(aNewPosX);
				var loly = Util.getTileFromReal(aNewPosY);
				var n = Util.twoarrayToone(lolx,loly);

				
				/*
				check outer planes of new position ( bound box ) are beyond the sitting in tiles' boundary and that offending tile is a collision tile
				*/
				// if ( ( ( aNewPosY - Shared.cellSize/2 < (loly)*Shared.cellSize ) && ( Map.data[n-Shared.gridWidth] == 0) ) ||
				//   ( ( aNewPosY + Shared.cellSize/2 > (Math.ceil(aNewPosY/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+Shared.gridWidth] == 0) ) ) {
				// 	//clamp vertical
				// 	//console.log('vertical overlap detected');
				// 	aNewPosY = loly * Shared.cellSize + Shared.cellSize/2;
				// 	// this.wpsystem.sizeNow = 0;
				// }
				// if ( ( ( aNewPosX - Shared.cellSize/2 < (lolx)*Shared.cellSize ) && ( Map.data[n-1] == 0) ) ||
				//   ( ( aNewPosX + Shared.cellSize/2 > (Math.ceil(aNewPosX/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+1] == 0) ) ) {
				// 	//clamp horizontal
				// 	//console.log('horizontal overlap detected');
				// 	aNewPosX = lolx * Shared.cellSize + Shared.cellSize/2;
				// 	//console.log('new x is ' + lolx + ' * ' + Shared.cellSize + ' + ' + Shared.cellsize/2);
				// 	// this.wpsystem.sizeNow = 0;
				// }


				this.setPos(aNewPosX,aNewPosY);


				//waypoints remain the same, because haven't actually reached the next waypoint yet, only got closer/nearer
			} 
			/*
				you can make it one step
				you can make it in self tick, and you might even have left over ( if distThere != allowedDistance && distThere < allowedDistance )
			*/
			else {
				//FINAL STEP TO DEST, FETCH A NEW LINE TO MOVE ALONG.
				var lolx = Util.getTileFromReal(destx);
				var loly = Util.getTileFromReal(desty);
				var n = Util.twoarrayToone(lolx,loly);
				/*
				check outer planes of new position ( bound box ) are beyond the sitting in tiles' boundary and that offending tile is a collision tile
				*/
				// if ( ( ( desty - Shared.cellSize/2 < (loly)*Shared.cellSize ) && ( Map.data[n-Shared.gridWidth] == 0) ) ||
				//   ( ( desty + Shared.cellSize/2 > (Math.ceil(desty/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+Shared.gridWidth] == 0) ) ) {
				// 	//clamp vertical
				// 	//console.log('vertical overlap detected');
				// 	desty = loly * Shared.cellSize + Shared.cellSize/2;
				// 	// this.wpsystem.sizeNow = 0;
				// }
				// if ( ( ( destx - Shared.cellSize/2 < (lolx)*Shared.cellSize ) && ( Map.data[n-1] == 0) ) ||
				//   ( ( destx + Shared.cellSize/2 > (Math.ceil(destx/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+1] == 0) ) ) {
				// 	//clamp horizontal
				// 	//console.log('horizontal overlap detected');
				// 	destx = lolx * Shared.cellSize + Shared.cellSize/2;
				// 	//console.log('new x is ' + lolx + ' * ' + Shared.cellSize + ' + ' + Shared.cellsize/2);
				// 	// this.wpsystem.sizeNow = 0;
				// }

				this.setPos(destx,desty); // tweak self .. you need interpolate carefully.
			


				if (this.wpsystem.finalGoal) {
					console.log("final goal reached");
					//prevents further steps
					this.wpsystem.inProgress = false;
					return;
				}
				if ( distThere < allowedDistance ) {

					//surplass energy this frame.
					var distRemain = allowedDistance - distThere;
					this.moveStraight(distRemain);
				}

			}
		};

		/*
			steps towards a point in a straight line at max stepsize of unit's speed
		*/
		this.newUnit.prototype.step = function () {

			if ( this.wpsystem.inProgress )
				this.moveStraight(this.speed);

		};

		this.newUnit.prototype.setPos = function (x,y) 
		{
			//console.log('old pos is ' + this.mesh.position.x);
			//console.log('new pos is ' + x);
			this.mesh.position.x = x;// + this.radius;
			this.mesh.position.y = y;// - this.radius;
		};

		this.newUnit.prototype.setColor = function (color) {
			this.mesh.material.color.setHex( color );
		};

	};
	

	return new Units();
});






