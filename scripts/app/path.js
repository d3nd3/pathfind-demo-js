define( ['app/shared','app/map','app/bheap','app/grid','app/gl'], function (Shared,Map,Heap,Grid,Gl) {

	/*
		Pathfinding Constructor code.

		Why would you not just hard code the distance from every tile to every other tile in memory.
		Cache the entire grid/world.
		Surely thats not much memory.
		Then you would know the shortest path.
		The issue is when the world is dynamic and the shape is not known at runtime or is constantly changing.


		Precompute the A* for every node to every other node == Cache.

		So you still need A* system to compute the cache.

		Manhattan Distance metric is the distance if no collisions.

		The heuristic must be <= the sum of all cost to the goal.

		https://youtu.be/A60q6dcoCjw?t=916
		Octile Distance...
		Heuristic must...
			Consistency
			Admissibility

			octile = max(dx,dy) + (Sqrt(2) - 1) * min(dx,dy)

			diagSteps = min(dx,dy)
			nonDiag = max(dx,dy)
			diagCost = Sqrt(2) - 1
			nonDiagCost = 1

			----------------------------
			imagine a long rectangle, apply 1 diagonal, its reduced the distance on both axis.
			but diagonal only takes you so far, and the remaining distance must be done non-diagonally.

		this.h[start] = this.scale * this.nonDiagMoveCost * Math.max(dx, dy) + this.scale * (this.diagMoveCost  - this.nonDiagMoveCost) * Math.min(dx, dy);

	*/
	function Path () {
		console.log('creating Path');
		
		
		var self = this;
		var t = Shared.totalSize;

		//The pointing best path
		this.parent = new Uint32Array(t);

		//16bit - //1d mappings to column/row mappings cached.
		this.x = new Uint16Array(t);
		this.y = new Uint16Array(t);

		//32bit
		this.timestamp = new Uint32Array(t);

		//f value
		this.f = new Float32Array(t);

		//g value
		this.g = new Float32Array(t);

		//h value
		this.h = new Float32Array(t);
		

		//8bit
		this.onHeap = new Uint8Array(t); 

		this.occupied = new Uint8Array(t); // occcupied bool
		// clearance size - how large agent can access this square.
		this.clearance = new Uint8Array(t); 

		this.nonDiagMoveCost = 1;
		this.diagMoveCost = Math.sqrt(2);

		this.scale = 1;
		//Set this to max distance in grid spaces.
		this.hScaler = 1+1/500;
		// this.hScaler = 1;

		//Clearance used for allow agents of different size.
		var maxClearance = 6;
		var stop;
		var m;
		var z;
		//iterating totalSize
		for ( var o = 0;o < t;o++ ) {

			//1d mappings to column/row mappings cached.
			this.x[o] = o % Shared.gridWidth; //remainder
			//total - remainder , TODO:(just do division then round to int)
			this.y[o] = (o - this.x[o]) / Shared.gridWidth; 
			
			stop = false;
			//if this 1d position is empty space
			if ( Map.data[o] == 1 ) {
				/*
					Searches for clearance:
					  x,y
					  x,y+1
					  x,y+2

					  x+1,y
					  x+1,y+1
					  x+1,y+2

					  x+2,y
					  x+2,y+1
					  x+2,y+2

					  Would have to check every square
					  but return true only when all squares
					  are clear.
				*/
				//2,3,4,5
				for ( var h = 2 ; h < maxClearance; h++ ) {
					//0,1,2 ... 0,1,2,3 ... 0,1,2,3,4 ... 0,1,2,3,4,5
					for ( var e = 0; e < h; e++ ) {
						//0,1,2 ... 0,1,2,3 ... 0,1,2,3,4 ... 0,1,2,3,4,5
						for ( var f = 0; f < h; f++ ) {
							//column-f_column ... to 1d + row + e_row
							m = (this.y[o]-f) * Shared.gridWidth + this.x[o] + e;

							//if that 1d position has cliff/collision
							if ( m != o && Map.data[m] == 0 ) {
								//invalidate current h.
								stop = true;
							}
						}
					}
					if ( stop == true ) {
						// z = h;
						break;
					}
				}
				//max_clearance was found using h value of:
				//uses h-1 because it stopped when it broke/invalidated.
				/*
					I think this is measuring whether a larger unit can fit in the square.
				*/
				this.clearance[o] = h-1;
			} else
			{
				//this 1d position is cliff/collision
				this.clearance[o] = 0;
			}		
		}

		// Make the heap use the f array as the sorting data.
		Heap.setScoreArr(this.f);

		/*
			End Init.
		*/

		/*
			Astar compute.
		*/
		this.astar = async function (start,goal,timeStamp,unit) {

			let before = performance.now();
			let ticktock = 0;
			ticktock++;
			//Debug Nodes
			let visitedNodes = [];
			let unvisitedNodes = [];

			let unvisitedNodesCount = 0;
			let visitedNodesCount = 0;
			let numTimeBreakers = 0;



			//translate center to top left
			var size = unit.size;

			/*if ( this.clearance[goal] < size ) {
				console.log('you cant go there mr.orc!');
				return Shared.totalSize;
			}*/

			//reset Heap
			Heap.sizeNow = 1;
			Heap.insert(start);


			/*
				--Minimise--
				f(n)=g(n)+h(n)
				g(n) is the cost of the path
				h(n) is the heuristic
			*/
			//the initial node will be trusted so give it acceptable values
			this.parent[start] = Shared.totalSize; // why???

			//cost
			this.g[start] = 0;

			//Positive(row_goal - row-start)
			var dx = Math.abs(this.x[goal]-this.x[start]);
			//Positive(column_goal - column_start)
			var dy = Math.abs(this.y[goal]-this.y[start]);


			this.h[start] = this.scale * this.nonDiagMoveCost * Math.max(dx, dy) + this.scale * (this.diagMoveCost  - this.nonDiagMoveCost) * Math.min(dx, dy);
			this.h[start] *= this.hScaler;
			// this.h[n] = this.scale * this.nonDiagMoveCost * (dx+dy) + this.scale * (this.diagMoveCost  - 2*this.nonDiagMoveCost) * Math.min(dx, dy);
			//sum - combined
			this.f[start] = this.h[start];//f = g + h(start,goal) 

			//Heap.dump(openHeap);

			/*
				Node is just an id represeting 1 dimensional posiiton
				The heap has an array, Heap.score.
				We set it to be equal to the Path.f array.
				So the heap indices will be sorted by values in Path.f[].
			*/

			var lowestHNode = Shared.GridSize;

			// Iterate the elements ON the heap (aren't these just unvisited nodes?)
			// Every iteration it collects more univisited nodes, because they are just 'neighbours' of startNode.
			while ( Heap.sizeNow > 1 ) {
				//Heap.sizeNow 1 == empty

				// Lowest f-value node always next in line.
				var thisNode = Heap.theHeap[1];

				
				let heapIdx = 1;
				/*
				//tie-breaker doesn't seem to make a difference.
				
				let highestG = thisNode;
				
				//find tie-breaker length
				let t;
				for (t=1;t<Heap.sizeNow-1;t++) {
					let nextInLine = Heap.theHeap[1+t];
					
					if ( this.f[nextInLine] > this.f[thisNode] )
						break;

					if ( this.g[nextInLine] > this.g[Heap.theHeap[highestG]] ) {
						highestG = nextInLine;
						heapIdx = 1+t;
						numTimeBreakers++;
					}
				}
				thisNode = highestG;
				*/

				// Since we are processing this node, we call it 'visited', it comes off the heap.
				//this.onHeap[thisNode] = 0;
				Heap.deinsert(heapIdx);

				// use space to remove.
				// Grid.appearDebugCube(this.x[thisNode],this.y[thisNode],0x00ff00);
				// visitedNodes.push([this.x[thisNode],this.y[thisNode]]);
				visitedNodesCount++;
				//Instead of clearing all data, we use a counter to know if _FRESH_.
				// Date.now() & 0x3FFFFFFF
				this.timestamp[thisNode] = timeStamp;


				// Have we selected the node that is the goal?
				if ( thisNode == goal ) {
					
					/*
					for (const node of visitedNodes) {
						Grid.appearDebugCube(node[0],node[1],0x00ff00);
					}

					for (const node of unvisitedNodes) {
						Grid.appearDebugCube(node[0],node[1],0xff0000);
					}
					*/
					console.log(`found the goal : ${performance.now()-before} ... UV: ${unvisitedNodesCount}, V: ${visitedNodesCount} , TB: ${numTimeBreakers}`);
					return goal;
				}
				
				/*
				Grid.appearDebugCube(this.x[thisNode],this.y[thisNode],0x00ff00, 8,2);
				
				for (const node of unvisitedNodes) {
					Grid.appearDebugCube(node[0],node[1],0xff0000);
				}
				*/
				unvisitedNodes = [];

				//visualization
				/*
				await new Promise((resolve,reject)=> {
					setTimeout(()=>{
						resolve();
					},2);
				})
				*/

				var n;
				//iterate neighbouring nodes.
				for ( var i=0;i<8;i++)
				{		
					//down,up,right,left : 0,1,2,3
					//down-left, up-right : 4,5
					//down-right, up-left : 6,7
					n = getNodeWhere[i][0](thisNode);
					if ( n != null )
					{

						//or Map Collision
						//or Agent doesnt' fit
						//or diagonal off map
						// ---> skip
						if ( 
							Map.data[n] == 0 
							|| (this.clearance[n] < size) 
							|| ( i > 3 && getNodeWhere[i][2](size,thisNode))
						)
							continue;

						// Dist to neighbour = current_Cost + costOfMove.
						// Pythagoros Theorem, C^2 = A^2 + B^2
						// if A==1 and B==1
						// C==Sqrt(2).
						var newDist = this.g[thisNode] + getNodeWhere[i][1]; 
						
						// && has high precedence.

						// DirtyData or
						// ( newPathToNeighbourCost < neighbourCurrentRecordedCost AND neighbourIsOpen )
						if ( this.timestamp[n] < timeStamp || newDist < this.g[n] ) {
							//neighbour which is visited node can never reach here, if heuristic CONSISTENT.
							//thus this.onHeap[n] == 1 guaranteed WHEN touched
							//if untouched, its a new neighbour completely.
	
							//if a node goes on the minHeap, it can only be removed when visitted.
							//so these 2 are mutually exclusive.
							//issue : 3 states, onMinHeap or offMinHeap->[Visited?]
							//when not onMinHeap, can be either visited or untouched.
							//timestamp[n] < timeStamp == untouched (impossible to be onMinHeap)
							//(timestamp[n] == timeStamp) == onMinHeap(unvisited=1) or Visited(unvisited=0).
							//When touched, can be either onMinHeap or Visited.

							this.parent[n] = thisNode;
							this.g[n] = newDist;

							//this is f = g + h ... TODO: cache the heuristics
							dx = Math.abs(this.x[goal]-this.x[n]);
							dy = Math.abs(this.y[goal]-this.y[n]);

							
							this.h[n] = this.scale * this.nonDiagMoveCost * Math.max(dx, dy) + this.scale * (this.diagMoveCost  - this.nonDiagMoveCost) * Math.min(dx, dy);
							this.h[n] *= this.hScaler;
							// this.h[n] = this.scale * this.nonDiagMoveCost * (dx+dy) + this.scale * (this.diagMoveCost  - 2*this.nonDiagMoveCost) * Math.min(dx, dy);
							//f = g + h(start,goal)
							this.f[n] = this.g[n] + this.h[n];

							// This will be returned if goal not found.
							if ( lowestHNode == Shared.gridSize || this.h[n] < this.h[lowestHNode] ) {
								lowestHNode = n;
							}
							
							// Only add to Heap Once, this neighbour is Fresh.
							if ( this.timestamp[n] < timeStamp) {
								//Update timestamp
								this.timestamp[n] = timeStamp;

								// This node exists on heap so tag it 'unvisited'
								//this.onHeap[n] = 1;
								Heap.insert(n);

								// use space to remove.
								// Grid.appearDebugCube(this.x[n],this.y[n],0xff0000);
								unvisitedNodes.push([this.x[n],this.y[n]]);
								unvisitedNodesCount++;
								/*for ( var o = 1 ; o < openHeap.theArray.length;o++) {
									////console.log(openHeap.theArray[o]);
								}*/
							}

						}
					}
				}
				// Heap.dump();
			} // end while loop a*
			
			// the goal was not found, so return lowest H node instead.
			return lowestHNode;
		};

		//0 get node
		//1 cost
		//2 offset y
		//3 offset x
		var getNodeWhere = [
			[
				//down
				function ( fromNode ) {
					// don't traverse off map
					if ( self.y[fromNode] == 0 ) return null; 
					// decrement y value
					return (self.y[fromNode]-1)*Shared.gridWidth + self.x[fromNode];
				},
				this.nonDiagMoveCost*this.scale
			],
			[
				//up
				function ( fromNode ) {
					// don't traverse off map
					if ( self.y[fromNode] == Shared.gridHeight-1 ) return null; 
					// increment y value
					return (self.y[fromNode]+1)*Shared.gridWidth + self.x[fromNode];
				},
				this.nonDiagMoveCost*this.scale
			],
			[
				//right
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == Shared.gridWidth-1 ) return null;
					// increment x value
					return self.y[fromNode]*Shared.gridWidth + self.x[fromNode] + 1;
				},
				this.nonDiagMoveCost*this.scale
			],
			[
				//left
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == 0 ) return null;
					// decrement x value
					return self.y[fromNode]*Shared.gridWidth + self.x[fromNode] - 1;
				},
				this.nonDiagMoveCost*this.scale
			],
			[
				//down-left
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == 0 || self.y[fromNode] == 0 ) return null;
					// decrement x and y value
					return (self.y[fromNode]-1)*Shared.gridWidth + self.x[fromNode] - 1;
				},
				this.diagMoveCost*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) + (soize-1) )] == 0 || //southern 2
								Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) )] == 0 ||
								Map.data[fromNode -1] == 0 || //western 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  -1] == 0);
				}

			],
			[
				//up-right
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == Shared.gridWidth-1 || self.y[fromNode] == Shared.gridHeight-1 ) return null;
					// increment x and y value
					return (self.y[fromNode]+1)*Shared.gridWidth + self.x[fromNode] + 1;
				},
				this.diagMoveCost*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+Shared.gridWidth] == 0 || //northern 2
								Map.data[fromNode+Shared.gridWidth + (soize-1)] == 0 ||
								Map.data[fromNode + soize] == 0 || //eastern 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  +soize] == 0);
				}

			],
			[
				//down-right
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == Shared.gridWidth-1 || self.y[fromNode] == 0 ) return null;
					// increment x value , decremeent y value
					return (self.y[fromNode]-1)*Shared.gridWidth + self.x[fromNode] + 1;
				},
				this.diagMoveCost*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) + (soize-1) )] == 0 || //southern 2
								Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) )] == 0 ||
								Map.data[fromNode + soize] == 0 || //eastern 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  +soize] == 0);
				}
			],
			[
				//up-left
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == 0 || self.y[fromNode] == Shared.gridHeight-1 ) return null;
					// decrement x value, increment y value
					return (self.y[fromNode]+1)*Shared.gridWidth + self.x[fromNode] - 1;
				},
				this.diagMoveCost*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+Shared.gridWidth] == 0 || //northern 2
								Map.data[fromNode+Shared.gridWidth + (soize-1)] == 0 ||
								Map.data[fromNode -1] == 0 || //western 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  -1] == 0);
				}
			]
		];
	
	}
	return new Path();
});



