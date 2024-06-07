define(['app/grid','app/path','app/line','app/shared','app/map','app/util','app/gl','app/shapes','app/collision'],function (Grid,Path,Line,Shared,Map,Util,Gl,Shapes,Collision) {
	function Waypoints() {
		/*
			its just every 500 ms
			it does a new line intersection test from current unit position to every astar node(starting deepest, inwards)
			its like re-testing if it can see deeper into the path
			see == line of sight
			so if it sees 'further', it sets that as new point to 'walk towards in straight line'

		*/
		console.log('creating Waypoints');
		var nodePos2f = new Float32Array(2);
		var altNodePos2f = new Float32Array(2);

		var self = this;
		/*
			a waypoint this will be created for each unit
		*/
		this.newWaypoint = function() {
			// this.points = new Float32Array(Shared.gridWidth * Shared.gridHeight);
			// this.sizeNow = 0;
			
			
			this.clickPosX = -1;
			this.clickPosY = -1;

			//reset each round
			this.visionStartNode = Shared.gridArea;
			this.finalGoal = false;
			this.inProgress = false;
			this.sameTileMoveOnly = false;
			this.astarOutput = Shared.gridArea;
		};

		/*
			this.finalGoal is important variable
			it allows the server loop to stop trying move the unit.
		*/
		this.newWaypoint.prototype.intervalCb = function (unit) {
			// console.dir(this);

			if (this.sameTileMoveOnly) return [this.clickPosX,this.clickPosY];

			let agentSize = unit.size;
			//we see the goal.
			// console.log(`clicpos: ${this.clickPosX} ${this.clickPosY} ${unit.mesh.position.x} ${unit.mesh.position.y}`);
			if ( Collision.lineRect(unit.mesh.position.x,unit.mesh.position.y,this.clickPosX,this.clickPosY,agentSize) == true ) {
				// console.log("Can see the goal post!");
				this.finalGoal = true;
				Grid.appearDebugCube(Path.x[this.astarOutput],Path.y[this.astarOutput],0xffff00,32);
				return [this.clickPosX, this.clickPosY];
			}


			let parentNode = this.astarOutput;
			// console.log(`huh ; ${this.astarOutput}`);
			while ( parentNode != this.visionStartNode ) {
				Util.getCenterReal(Path.x[parentNode],Path.y[parentNode],agentSize,nodePos2f);
				//console.log("Finding furthest line of sight");
				if ( Collision.lineRect(unit.mesh.position.x,unit.mesh.position.y,nodePos2f[0],nodePos2f[1],agentSize) == true ) {
					//We have vision, so we connect to it and shrink the list.
					//WAYPOINT 1.
					this.visionStartNode = parentNode;
					this.finalGoal = false;
					
					//end of line.
					Path.parent[parentNode] = Shared.gridArea;

					Grid.appearDebugCube(Path.x[parentNode],Path.y[parentNode],0xffffff,32);
					return [nodePos2f[0], nodePos2f[1]];
				}

				parentNode = Path.parent[parentNode];
			}
			if ( this.visionStartNode != Shared.gridArea ) {
				//no line of sight or no new line of sight.
				Util.getCenterReal(Path.x[this.visionStartNode],Path.y[this.visionStartNode],agentSize,nodePos2f);
				return [nodePos2f[0],nodePos2f[1]];
			} else {
				//no vision to any node.
				alert("This should never happen, no vision to any node");
			}
		};

		/*
			User clicked their mouse, and wants the unit to form a new path.
		*/
		this.newWaypoint.prototype.generate = async function(clickPosX,clickPosY,unit) {
			//reset
			// self.newWaypoint.call(this);

			this.clickPosX = clickPosX;
			this.clickPosY = clickPosY;

			//reset each round
			this.visionStartNode = Shared.gridArea;
			this.finalGoal = false;
			this.inProgress = false;
			this.sameTileMoveOnly = false;
			this.astarOutput = Shared.gridArea;

			//Cube Meshes are placed based on their center
			let origPosX = unit.mesh.position.x;
			let origPosY = unit.mesh.position.y;

			let agentClearanceTile = Util.getClearanceTileFromXY(origPosX,origPosY,unit.size);
			let destClearanceTile = Util.getClearanceTileFromXY(this.clickPosX,this.clickPosY,unit.size);
			
			let timeStamp = Date.now() & 0x3FFFFFFF; // hopefully this is more efficient 'number'


			// Right click on same path-finding tile
			if ( agentClearanceTile == destClearanceTile ) {
				this.sameTileMoveOnly = true;
				this.inProgress = true;

				//Will use this.clickPosX
				return;
			}

			/*
				Rememeber we are running A Star on bottom-left node only.

				If we centerPos click into cliff tile, == find other square.
				If we click on empty space, but we do not fit, astar never finds a valid path.

			*/

			
			//Off-map click.
			//Clearance data is only calculated for emptySpaces. (Because that is its definition).
			if ( !Map.emptySpace[Util.getTile1DFromPos(this.clickPosX,this.clickPosY)] /*|| Path.clearance[destClearanceTile] < unit.size*/ ) {
				//OffMap.
				console.log("Detected BAD CLICK!!")
	
				Collision.lineRect(this.clickPosX,this.clickPosY,origPosX,origPosY,1,(x,y,n) => {
					// console.log(`Hmmm, ??`);
					
					if (Path.clearance[n] >= unit.size) {
						console.log("Used a cheap LineOfSight Tile instead");
						Grid.appearDebugCube(Util.getTileFromReal(x),Util.getTileFromReal(y),0x0000FF,32);
						destClearanceTile = Util.getClearanceTileFromXY(x,y,unit.size);
						Util.getCenterReal(Util.getTileFromReal(x),Util.getTileFromReal(y),unit.size,Util.fconvArr);
						this.clickPosX = Util.fconvArr[0];
						this.clickPosY = Util.fconvArr[1];
						//returns early from lineRect CB.
						return true;
					}
				});

				//else we are stuck to use Astar cap for now, which returns lowest heuristic tile.
			}
			
			//TODO: Put LineOfSight before running AStar too.


			//Performs A* using Agent-size accounted tile-positions.
			this.astarOutput = await Path.astar(agentClearanceTile,destClearanceTile,timeStamp,unit);
			console.log(`astar output: ${this.astarOutput}`);
			this.inProgress = true;

			//error?
			if ( this.astarOutput == Shared.gridArea ){
				console.log("Astar erroed, Oops");
				return;
			}

			//TODO: Set hard limit on number of iterations Astar will perform.

			//Astar searched all nodes and can't reach goal.
			//Use heuristic to approximate nearest tile.
			if ( this.astarOutput != destClearanceTile ) {
				console.log("HEAVY COMPUTE");
				Util.getCenterReal(Path.x[this.astarOutput],Path.y[this.astarOutput],unit.size,nodePos2f);

				this.clickPosX = nodePos2f[0];
				this.clickPosY = nodePos2f[1];
			}

			// uncomment below to see the path generated
			
			let shortlen = 0;
			let thisNode = this.astarOutput;
			while ( thisNode != Shared.gridArea ) {
				let m = Shapes.cube(8);
				m.position.x = Path.x[thisNode] * Shared.cellSize + Shared.cellSize/2;
				m.position.y = Path.y[thisNode] * Shared.cellSize + Shared.cellSize/2;
				Gl.scene.add(m);
				Gl.debugObjs.push(m);
				thisNode = Path.parent[thisNode];
				shortlen +=1;
			}
			console.log(`shortest path length: ${shortlen}`);
		}; // end of wp.generate function
	
	} // end of Waypoints constructor

	return new Waypoints();
});