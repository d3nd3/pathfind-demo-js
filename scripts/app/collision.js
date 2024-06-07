define( ['app/line','app/shared','app/util','app/map','app/path'],function (Line,Shared,Util,Map,Path) {
	function Collision () {
		console.log('creating Collision');
		//currently requires center of 'rect'
		/*
			Initialization and Setup:
				It takes the coordinates of the centers of the two rectangles (rect1x, rect1y, rect2x, rect2y) and a 
				size parameter (possibly representing the side length of the rectangles).
				It initializes arrays c1 and c2 to store the coordinates of the perimeter points for the two rectangles.
				It calculates values used for determining the positions of the perimeter points, such as s (half the size) 
				and c (likely the cell size of the grid).
			
			Perimeter Point Calculation:
				It enters a loop to calculate the perimeter points for both rectangles in a clockwise manner.
				It divides the loop into four sections, each representing a side of the rectangle (top, right, bottom, left).
				In each section, it iterates over the segments of that side, incrementing the x or y coordinates as 
				needed and storing the coordinates in c1 and c2.
				
			Walkability Check:
				It iterates through the pairs of corresponding perimeter points in c1 and c2.
				For each pair, it calls the Line.isWalkable function (which is presumably defined elsewhere) to check 
				if the line between those points is walkable.
				If any line segment is not walkable, it sets the walkable flag to false and breaks out of the loop.

			Return Value:
				It returns the walkable flag, which indicates whether a walkable path exists between the two rectangles.
		*/
		this.lineRect = function (rect1x,rect1y,rect2x,rect2y,size,apply) {
			let radi = size*0.5;
			/*
				Conundurum:
				  Do we support only center of tiles, tile aligned?
				  I think it can still function if use non-aligned abs positions for source.
			*/
			var c1 = [], c2 = [];
			
			// var padding = 0.4;
			
			var c = Shared.cellSize;

			var i;

			//get TOPLEFT of each 'agent'
			

			//1,4,8,12
			
			//Takes the perimeter of the agent collision box
			//Runs a lineWalk for each.

			//size*2 ensures size 1 has only 1 position
			//size 2 has 2 positions
			//size 3 has 3 positions etc.
			//clockwise
			var walkable = true;
			if (size == 1) {
				if ( !Line.isWalkable(rect1x,rect1y,rect2x,rect2y,apply) ) {
					walkable = false;
				}
			} else {
				let rect1KK = rect1x - radi * c;
				let rect2KK = rect2x - radi * c;
				let rect1LL = rect1y + radi * c;
				let rect2LL = rect2y + radi * c;

				for ( i = 0 ; i < size*2; i+=2 ) {
					//top
					//large static y
					//dynamic increasing x

					//1 cell up X
					rect1KK = rect1KK + c;
					rect2KK = rect2KK + c;

					//c1:x,y
					c1[i] = rect1KK;
					c1[i+1] = rect1LL;

					//c2:x,y
					c2[i] = rect2KK;
					c2[i+1] = rect2LL;
				} 

				for ( i = size*2; i < 2  * size*2; i+=2 ) {
					//right
					//large static x
					//dynamic decreasing y
					rect1LL = rect1LL - c;
					rect2LL = rect2LL - c;
					
					c1[i] = rect1KK;
					c1[i+1] = rect1LL;

					c2[i] = rect2KK;
					c2[i+1] = rect2LL;

				}
				for ( i = 2  * size*2 ; i < 3 * size*2; i+=2 ) {
					//bottom
					//small static y
					//dynamic decreasing x
					
					rect1KK = rect1KK - c;
					rect2KK = rect2KK - c;
					
					c1[i] = rect1KK;
					c1[i+1] = rect1LL;

					c2[i] = rect2KK;
					c2[i+1] = rect2LL;

				}

				for ( i = 3 * size*2 ; i < 4 * size*2; i+=2 ) {
					//left
					//small static x
					//dynamic increasing y

					rect1LL = rect1LL + c;
					rect2LL = rect2LL + c;

					c1[i] = rect1KK;
					c1[i+1] = rect1LL;

					c2[i] = rect2KK;
					c2[i+1] = rect2LL;

				}

				for ( var h = 0; h < (size*4)*2; h+=2 ) {
					
					if ( !Line.isWalkable(c1[h],c1[h+1],c2[h],c2[h+1]) ) {
						walkable = false;
						break;
					}
				}
			}
			
			return walkable;
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