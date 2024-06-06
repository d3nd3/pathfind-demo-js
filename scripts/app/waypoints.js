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
			this.visionStartNode = Grid.totalSize;
			this.finalGoal = false;
			this.inProgress = false;
			this.sameTileMoveOnly = false;
			this.astarOutput = Grid.totalSize;
		};

		this.newWaypoint.prototype.intervalCb = function (unit) {
			// console.dir(this);

			if (this.sameTileMoveOnly) return [this.clickPosX,this.clickPosY];

			let agentSize = unit.size;
			//we see the goal.
			// console.log(`clicpos: ${this.clickPosX} ${this.clickPosY} ${unit.mesh.position.x} ${unit.mesh.position.y}`);
			if ( Collision.lineRect(unit.mesh.position.x,unit.mesh.position.y,this.clickPosX,this.clickPosY,agentSize) == true ) {
				console.log("Can see the goal post!");
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
					Path.parent[parentNode] = Shared.totalSize;

					Grid.appearDebugCube(Path.x[parentNode],Path.y[parentNode],0xffffff,32);
					return [nodePos2f[0], nodePos2f[1]];
				}

				parentNode = Path.parent[parentNode];
			}
			if ( this.visionStartNode != Grid.totalSize ) {
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
			this.visionStartNode = Grid.totalSize;
			this.finalGoal = false;
			this.inProgress = false;
			this.sameTileMoveOnly = false;
			this.astarOutput = Grid.totalSize;

			
			//Cube Meshes are placed based on their center
			let origPosX = unit.mesh.position.x;
			let origPosY = unit.mesh.position.y;

			//translate agentCornerTile and destCornerTile tiles to the top left
			//( positive y and negative x)
			//the clearance data was set using (positive x,negative y)
			//Acquires center of the agent. (Accounting for their size).
			let agentCornerTile = Util.twoarrayToone(Util.getTileFromReal(origPosX) - (unit.size-1),Util.getTileFromReal(origPosY) + (unit.size-1));
			let destCornerTile = Util.twoarrayToone(Util.getTileFromReal(this.clickPosX) - (unit.size-1),Util.getTileFromReal(this.clickPosY) + (unit.size-1));

			// snap destCornerTile if breaks a collision rule
			if ( Collision.boundRect(this.clickPosX,this.clickPosY,unit,Util.fconvArr,destCornerTile) ) {
				this.clickPosX = Util.fconvArr[0];
				this.clickPosY = Util.fconvArr[1];
			}

			
			let timeStamp = Date.now() & 0x3FFFFFFF; // hopefully this is more efficient 'number'

			// Right click on same path-finding tile
			if ( agentCornerTile == destCornerTile ) {
				this.sameTileMoveOnly = true;
				this.inProgress = true;
				return;
			}
			//Performs A* using Agent-size accounted tile-positions.
			this.astarOutput = await Path.astar(agentCornerTile,destCornerTile,timeStamp,unit);
			console.log(`astar output: ${this.astarOutput}`);
			this.inProgress = true;

			//error?
			if ( this.astarOutput == Shared.totalSize ){
				console.log("Astar erroed, Oops");
				return;
			}

			//Astar returned non ClickPos Tile.
			if ( this.astarOutput != destCornerTile ) {
				console.log("couldn't get to the destination... Using heuristic nearest.");
				Util.getCenterReal(Path.x[this.astarOutput],Path.y[this.astarOutput],unit.size,nodePos2f);

				this.clickPosX = nodePos2f[0];
				this.clickPosY = nodePos2f[1];
			}

			// uncomment below to see the path generated
			
			let shortlen = 0;
			let thisNode = this.astarOutput;
			while ( thisNode != Shared.totalSize ) {
				let m = Shapes.cube(8);
				m.position.x = Path.x[thisNode] * Shared.cellSize + Shared.cellSize/2;
				m.position.y = Path.y[thisNode] * Shared.cellSize + Shared.cellSize/2;
				Gl.scene.add(m);
				Gl.debugObjs.push(m);
				thisNode = Path.parent[thisNode];
				shortlen +=1;
			}
			console.log(`shortest path length: ${shortlen}`);
			
			
			//iterate through the linked list
			let totalDist = 0;

		
			//We want greedy join to the furthest away node directly.
			//If we have vision, we go direct.
			//TODO: mb some procecssing before Astar, to prevent AStar when not needed.

			//check clickpos first
			

			// this.intervalCb(unit,endNodeFromAstar,unit.size);
				
				/*
				this.sizeNow = 0;
				Util.getCenterReal(Path.x[visionStartNode],Path.y[visionStartNode],agentSize,nodePos2f);
				this.points[this.sizeNow++] = nodePos2f[0];
				this.points[this.sizeNow++] = nodePos2f[1];
				*/

				

			/*
			//Remove any node that has a parent and child that form a straight line.
			parentNode = Path.parent[endNodeFromAstar];
			//ignore first node, because we use clickPos instead.
			if ( parentNode != Shared.totalSize ) {
				let childNode = parentNode;
				parentNode = Path.parent[parentNode];

				Util.getCenterReal(Path.x[parentNode],Path.y[parentNode],agentSize,nodePos2f);
				let childNodePosX = nodePos2f[0];
				let childNodePosY = nodePos2f[1];
				
				while ( parentNode != visionStartNode ) {
					
					//get real world co ordinates of tile
					Util.getCenterReal(Path.x[parentNode],Path.y[parentNode],agentSize,nodePos2f);
					
					//dist(direction), child to parent
					let dx = nodePos2f[0] - childNodePosX;
					let dy = nodePos2f[1] - childNodePosY;

					//update oldpos for next iteration/frame	
					childNodePosX = nodePos2f[0];
					childNodePosY = nodePos2f[1];

					//keep track of distance of route
					totalDist = totalDist + Math.sqrt((dx*dx)+(dy*dy));
					
					//requires 3 nodes to detect a change in direction , so use old , current, future ( child , node, parent )
					let grandParentNode = Path.parent[parentNode];
					if ( grandParentNode != Shared.totalSize ) {
						Util.getCenterReal(Path.x[grandParentNode],Path.y[grandParentNode],agentSize,altNodePos2f);

						let dx2 = altNodePos2f[0] - nodePos2f[0];
						let dy2 = altNodePos2f[1] - nodePos2f[1];

						//only push the nodes which change direction
						if ( dx/dy == dx2/dy2 ) {
							// sets parent of child to parent?
							Path.parent[childNode] = grandParentNode;
							childNode = parentNode;
						}
					} 							

					parentNode = grandParentNode;
				} //endwhile
			}
			*/
			/*
				Build the waypoints.
				We construct them backwards.
			*/
			
			//FINAL WAYPOINT.

			/*
			this.points[this.sizeNow++] = clickPosX;
			this.points[this.sizeNow++] = clickPosY;

			//TODO Apply same smoothing for dest as we did for source.

			//We don't want to include endNodeFromAstar or agentCornerTile if we can help it
			parentNode = Path.parent[endNodeFromAstar];
			while ( parentNode != visionStartNode ) {
				Util.getCenterReal(Path.x[parentNode],Path.y[parentNode],agentSize,nodePos2f);
				this.points[this.sizeNow++] = nodePos2f[0];
				this.points[this.sizeNow++] = nodePos2f[1];
				
				parentNode = Path.parent[parentNode];
			}
			
			//VisionStartMode
			Util.getCenterReal(Path.x[visionStartNode],Path.y[visionStartNode],agentSize,nodePos2f);
			this.points[this.sizeNow++] = nodePos2f[0];
			this.points[this.sizeNow++] = nodePos2f[1];

			*/

			/*
			for ( let t = 0 ; t < this.sizeNow; t+=2 ) {
				Grid.appearDebugCubeReal(this.points[t],this.points[t+1],0x00ffff,32);
			}
			*/

		}; // end of wp.generate function
	
	} // end of Waypoints constructor

	return new Waypoints();
});