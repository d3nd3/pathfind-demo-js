define(['app/waypoints','app/grid','app/map','app/util','app/shared','app/line','app/path'],function (Waypoints,Grid,Map,Util,Shared,Line,Path) {

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

		/*
			Called by server frame.
			Calculates the destination need to travel, every step.

			allowedDistance is the unit's speed. Think of it like fuel.
			Atm it guarantees to spend its fuel, so if the unit was blocked or prevented from moving,
			this would hang the processing. == bad.
			It should rather just try to move once, if it can't move, give up this frame.
		*/
		this.newUnit.prototype.moveStraight = function ( allowedDistance) {

			//Find the next line of sight node.
			let [destx,desty] = this.wpsystem.LineOfSightSmoother(this);

			//This is outputting the same point even after reaching it.
			//Might wanna fix that eventually.
			//So that it doesn't recurse indefinitely on same point.
			//Even though it reached it.


			console.log(`Destx: ${destx} Desty: ${desty}`);
			var dx = destx - this.mesh.position.x;
			var dy = desty - this.mesh.position.y;

			var distThere = Math.sqrt(dx*dx+dy*dy);

			

			// var directionVector = new THREE.Vector3(movementX, movementY, 0).normalize();

			/*
				TODO:
					Handle collision with dynamic objects. (everything except map cliffs.)
					Highlight tiles which intersect with Speed Vector.
					Check them for collision.
			*/

			/*
				Take your largest step. You still won't reach 'goal'.
			*/
			if ( distThere > allowedDistance ) {

				//get unit vector. 
				let unitVectorX = dx/distThere;
				let unitVectorY = dy/distThere;
				//TODO: Use deltaTime here?
				//Apply the "speed"
				let movementX = unitVectorX * allowedDistance;
				let movementY = unitVectorY * allowedDistance;

				var aNewPosX = this.mesh.position.x + movementX;
				var aNewPosY = this.mesh.position.y + movementY;

				this.setPos(aNewPosX,aNewPosY);

			} 
			/*
				you _WILL_ reach the goal, and might have excess fuel/speed for new goal.
			*/
			else {
				console.log(`SpeedStepDistance = ${allowedDistance} DistMoved = ${distThere}`);

				this.setPos(destx,desty);
			
				if (this.wpsystem.finalGoal) {
					console.log("final goal reached");
					//prevents further steps
					this.wpsystem.inProgress = false;
					return;
				}
				let distRemain = allowedDistance - distThere;
				if ( distRemain > 0 ) {
					//surplass energy this frame.
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

		/*
			Before settings its position, center it so it behaves nicely close to other objects.
			Fixes the _Overlapping_ problem.
		*/
		this.newUnit.prototype.setPos = function (x,y) 
		{
			/*
				If any of these points contain collision, we center.
			*/

			let bCenterHori = false;
			let bCenterVert = false;
			//bottom-left of unit's new position.
			let clearanceTile = Util.getClearanceTileFromXY(x,y,this.size);
			//lower horizontal edge
			for (let i=0;i<this.size;i++) {
				if ( Path.clearance[clearanceTile-Shared.gridWidth+i] < this.size) {
					bCenterHori = true;
					break;
				}
			}
			if (!bCenterHori) {
				//upper horizontal edge
				for (let i=0;i<this.size;i++) {
					if (Path.clearance[clearanceTile+this.size*Shared.gridWidth+i] < this.size) {
						bCenterHori = true;
						break;
					}
				}
			}
			//left vertical edge
			for (let i=0;i<this.size;i++) {
				if (Path.clearance[clearanceTile+Shared.gridWidth*i-1] < this.size) {
					bCenterVert = true;
					break;
				}
				
			}
			if (!bCenterVert) {
				//right vertical edge
				for (let i=0;i<this.size;i++) {
					if (Path.clearance[clearanceTile+Shared.gridWidth*i+this.size] < this.size) {
						bCenterVert = true;
						break;
					}
				}
			}

			// if (bCenterVert) y = ~~(y)+Shared.cellSize*0.5;
			// if (bCenterHori) x = ~~(x)+Shared.cellSize*0.5;


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






