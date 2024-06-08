define( ['app/line','app/shared','app/util','app/map','app/path','app/gl','app/shapes'],function (Line,Shared,Util,Map,Path,Gl,Shapes) {
	function Collision () {
		console.log('creating Collision');

		//currently requires center of 'rect'
		/*
			This javascript function is using Bresenham's line algorithm
			 to move 2d square agent's on a 2d tile based game, it highlights
			  if any tiles along the line are collision tiles.  Even though the 
			  agent can have unaligned positions, its collision position is always tile aligned.
				An agent is eg. a 3x3 set of tiles, currently it uses the center of each agent 
				tile to run the line algorithm on. It currently gets the perimeter of the agent's
				 collision tile position, and runs a line intersection for each tile in each edge.
				   I want you to alter it so that it runs the line intersection from every 'vertex'
					of the agent collision tiles instead of from the center of each.  I also want 
					an optimization which only uses the edge used in the direction of the move.
					 So if it was a diagonal-right move, it only performs line intersection 
					 from bottom-edge outer vertices, and right-edge outer vertices.


			There is another way for larger agents:
			  Take the first line output, and row-by-row or column-by-column
			  iterate the nodes until reach output from the second line.
			  3x3 agent requires 7 line intersection calls.
			  4x4 agents requires 9 line interections calls.
			  So the larger the agent, the more cost-savings.
		*/

		const EDGE_UP = 0;
		const EDGE_RIGHT = 1;
		const EDGE_DOWN = 2;
		const EDGE_LEFT = 3;

		//0.05 works
		//0.01 works
		//0.005 works
		//0 breaks
		const PADDING = 0.005;

		/*
			The points here are in 1d index format
			returns array of points.
		*/
		let acquireVertices = function(startPoint,direction,size) {
			// console.log(`size is ${size}`);
			let points = [];
			switch (direction) {
				case EDGE_UP:
					for (let i=1;i<size+1;i++) {
					// for (let i=1;i<size;i++) {
						
						points.push(startPoint + Shared.gridWidth*i);
					}
					
				break;
				case EDGE_DOWN:
					for (let i=1;i<size+1;i++) {
					// for (let i=1;i<size;i++) {
						points.push(startPoint - Shared.gridWidth*i);
					}
					
				break;
				case EDGE_LEFT:

					for (let i=1;i<size+1;i++) {
					// for (let i=1;i<size;i++) {
						points.push(startPoint - i);
					}
					
				break;
				case EDGE_RIGHT:
					for (let i=1;i<size+1;i++) {
					// for (let i=1;i<size;i++) {
						points.push(startPoint + i);
					}
					
				break;
			}

			return points;
		};

		/*
			Uncomment for vertice aligned.
		*/
		let getPointsForPosition = function(dx,dy,cTile,size) {
			let points = [];
			if (dx > 0) {
				//Xright
				if (dy > 0) {
					//top-right
					startPoint = cTile + size * Shared.gridWidth + size;
					let startVert = startPoint;
					startVert = {point: startVert, paddingX:-1,paddingY:-1};

					let topVerts = acquireVertices(startPoint,EDGE_LEFT,size);
					// topVerts = topVerts.map(point => ({ point, paddingX: -1,paddingY:-1 }));
					topVerts = topVerts.map(point => ({ point, paddingX: 0,paddingY:-1 }));
					topVerts[topVerts.length-1].paddingX = 1;

					let rightVerts = acquireVertices(startPoint,EDGE_DOWN,size);
					// rightVerts = rightVerts.map(point => ({ point, paddingX: -1,paddingY:-1 }));
					rightVerts = rightVerts.map(point => ({ point, paddingX: -1,paddingY:0 }));
					rightVerts[rightVerts.length-1].paddingY = 1;

					points.push(...topVerts,startVert,...rightVerts);
				} else {
					//bottom-right
					startPoint = cTile + size;
					let startVert = startPoint;
					startVert = {point: startVert, paddingX:-1, paddingY: 1};

					let rightVerts = acquireVertices(startPoint,EDGE_UP,size);
					// rightVerts = rightVerts.map(point => ({ point, paddingX: -1,paddingY:1 }));
					rightVerts = rightVerts.map(point => ({ point, paddingX: -1,paddingY:0 }));
					rightVerts[rightVerts.length-1].paddingY = -1;

					let botVerts = acquireVertices(startPoint,EDGE_LEFT,size);
					// botVerts = botVerts.map(point => ({ point, paddingX: -1,paddingY:1 }));
					botVerts = botVerts.map(point => ({ point, paddingX: 0,paddingY:1 }));
					botVerts[botVerts.length-1].paddingX = 1;

					points.push(...botVerts,startVert,...rightVerts);
				}
				
			} else {
				//Xleft
				if (dy > 0) {
					//top-left
					startPoint = cTile + size * Shared.gridWidth;
					let startVert = startPoint;
					startVert = {point: startVert, paddingX:1,paddingY:-1};

					let leftVerts = acquireVertices(startPoint,EDGE_DOWN,size);
					// leftVerts = leftVerts.map(point => ({ point, paddingX: 1,paddingY:-1 }));
					leftVerts = leftVerts.map(point => ({ point, paddingX: 1,paddingY:0 }));
					leftVerts[leftVerts.length-1].paddingY = 1;

					let topVerts = acquireVertices(startPoint,EDGE_RIGHT,size);
					// topVerts = topVerts.map(point => ({ point, paddingX: 1,paddingY:-1 }));
					topVerts = topVerts.map(point => ({ point, paddingX: 0,paddingY:-1 }));
					topVerts[topVerts.length-1].paddingX = -1;

					points.push(...topVerts,startVert,...leftVerts);
				} else {
					//bottom-left
					startPoint = cTile;
					let startVert = startPoint;
					startVert = {point: startVert, paddingX: 1,paddingY: 1};

					let leftVerts = acquireVertices(startPoint,EDGE_UP,size);
					// leftVerts = leftVerts.map(point => ({ point, paddingX:1,paddingY:1 }));
					leftVerts = leftVerts.map(point => ({ point, paddingX:1,paddingY:0 }));
					leftVerts[leftVerts.length-1].paddingY = -1;

					let botVerts = acquireVertices(startPoint,EDGE_RIGHT,size);
					// botVerts = botVerts.map(point => ({ point, paddingX:1,paddingY:1 }));
					botVerts = botVerts.map(point => ({ point, paddingX:0,paddingY:1 }));
					botVerts[botVerts.length-1].paddingX = -1;

					points.push(...botVerts,startVert,...leftVerts);
				}
				
			}
			return points;
		};


		this.lineRect = function (startX,startY,destX,destY,size,apply) {
			let cellS = Shared.cellSize;

			/*
				Efficiency improvement can be made by using only perimeter edges that
				move into the direction, like an arrow. 2 edges, instead of 4.
				1 edge if directly straight.
			*/
			if (size == 1) {

				if ( !Line.isWalkable(startX,startY,destX,destY,apply) ) {
					return false;
				}
			} else {
				for ( var b = 0; b < Gl.tubeObjs.length;b++) {
					Gl.scene.remove(Gl.tubeObjs[b]);
				}
				Gl.tubeObjs.length = 0;

				let sClearanceTile = Util.getClearanceTileFromXY(startX,startY,size);
				let dClearanceTile = Util.getClearanceTileFromXY(destX,destY,size);

				let dx = destX - startX;
				let dy = destY - startY;

				let startPoints = getPointsForPosition(dx,dy,sClearanceTile,size);
				let destPoints = getPointsForPosition(dx,dy,dClearanceTile,size);

				for (let i = 0; i < startPoints.length; i++) {
					let point1 = startPoints[i];
					let point2 = destPoints[i];

					let point1X = (Path.x[point1.point] + point1.paddingX*PADDING) * Shared.cellSize;
					let point1Y = (Path.y[point1.point] + point1.paddingY*PADDING) * Shared.cellSize;
					let point2X = (Path.x[point2.point] + point2.paddingX*PADDING) * Shared.cellSize;
					let point2Y = (Path.y[point2.point] + point2.paddingY*PADDING) * Shared.cellSize;

					let tube = Shapes.tube(point1X,point1Y,point2X,point2Y,1);
					Gl.tubeObjs.push(tube);
					Gl.scene.add(tube);

					if (!Line.isWalkable(point1X,point1Y,point2X,point2Y))
						return false;
				}

			}
			return true;
			
		};


		this.pointInPolygon = function(vertArray,px,py) {
			var bbox = new THREE.Box3().setFromPoints(vertArray);
			var min = bbox.min;
			var max = bbox.max;

			if (px < min.x || px > max.x || py < min.y || py > max.y) {
				return false;
			}
			var n = vertArray.length;
			var i,j,c = 0;
			for (i = 0, j = n-1; i < n; j = i++) {
			  if ( ((vertArray[i].y>py) != (vertArray[j].y>py)) &&
			   (px < (vertArray[j].x-vertArray[i].x) * (py-vertArray[i].y) / (vertArray[j].y-vertArray[i].y) + vertArray[i].x) )
				 c = !c;
			}
			return c;
		};
	}

	return new Collision();
});