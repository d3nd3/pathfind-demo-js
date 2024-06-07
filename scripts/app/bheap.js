define( ['app/shared'],function (Shared){

	/*
		Heap is initially size 1.
		MaxSize = totalSize
	*/
	//Module consturctor.
	function Bheap() {
		console.log('creating Heap');
		this.theHeap = new Uint32Array(Shared.gridArea);
		this.sizeNow = 1;
		
		//this represents the f value?
		this.score = null;
		this.setScoreArr = function ( scoreArr ) {
			this.score = scoreArr;
		};

		this.insert = function (data ) {

			//push data onto heap
			this.theHeap[this.sizeNow++] = data;
			//percolate the entry just added
			this.percolateUp(this.sizeNow-1);
		};

		this.deinsert = function ( index ) {
			var a = this.theHeap;
			
			// requested node out of bounds
			if ( index >= this.sizeNow || index < 1 )
				return;

			// remove the end node + store in 'last'
			var last = this.theHeap[--this.sizeNow];
			
			// the requested node to remove was already the end node, no need to shuffle
			if ( index == this.sizeNow )
				return;

			// move 'last' data into requested for deletion's node
			a[index] = last;

			// shuffle
			this.percolateUp(index);
			this.percolateDown(index);

		};

		this.percolateUp = function ( index ) {
			var a = this.theHeap;
			var node = a[index];

			//var doit = false;
			for (var n = index; n > 1; n = ~~(n/2) ) {

				// if 'moving data' is not less than parent, current position is fine
				if ( this.score[node] >= this.score[a[~~(n/2)]]){
					break;
				}
				//doit = true;
				// move parent down
				a[n] = a[~~(n/2)];
			}
			//if ( doit == true ) 
			//plant object here
			a[n] = node;
		};


		/*
			left child = 2*pos
			right child = 2*pos+1
			idea is to move the object down as far as it can go and still obey rule of being <= children?
		*/
		this.percolateDown = function ( index ) {
			var a = this.theHeap;
			var data = a[index];
			var pos = index;
			//var doit = false;
			
			// while children exist
			while ( 2 * pos < this.sizeNow ) { 
				var comparitor = data;

				var leftChild = a[2*pos];


				//left child comparison
				// does this node violate the rules ?
				if ( this.score[data] > this.score[leftChild] ) {
					// yes it does - now compare left child with right child
					comparitor = leftChild;
				}
				
				var rightChild = a[2*pos+1];
				//right child comparison
				// does this node violate the rules ?
				// comparitor is either the left child or the parent node
				if ( 2 * pos+1 < this.sizeNow && this.score[comparitor] > this.score[rightChild] ) {
					
					//doit = true;
					// right child moves up
					a[pos] = a[2*pos+1];
					pos = pos * 2 + 1;
					
				}
				// if we dealing with case 2 : left child is equal or smaller than right child
				else if ( comparitor != data ) {
					//doit = true;
					// left child moves up
					a[pos] = a[2*pos];
					pos = 2*pos;
				}	
				// this is case 1 : comparitor was data, so left child didn't violate any rules, neither did right child
				else
				{
					//can't percolate any more
					break;
				}
			}
			//if ( doit == true )
			// plant object here
			a[pos] = data;
		};

		this.dump = function ( ) {

			var rofl = ~~ ( Math.log(this.sizeNow-1) / Math.log(2) );

			console.log( 'level = ' + (rofl) + ' nodes = ' + this.dump_r(rofl,rofl+1) );

		};


		this.dump_r = function (  level , depth) {
			if ( level == 0 ) {
				var outstring = "";
				for ( var i = 0; i < depth-(level+1);i+=1 ) {
					outstring = outstring + ' ';
				}
				return outstring + this.score[this.theHeap[1]];
			}
				
			

			console.log( 'level = ' + (level-1) + ' nodes = ' + this.dump_r(level-1,depth) );


			//dump all on that row
			var outstring = "";
			for ( var i = 0; i < depth-(level+1);i++ ) {
				outstring = outstring + ' ';
			}
			var x = Math.pow(2,level);
			for ( var j = 0; j < x && x+j < this.sizeNow; j += 1 ) {
					outstring = outstring.concat(this.score[this.theHeap[x+j]] + ' ');
			}
			return outstring;
		};
	}

	return new Bheap();	
});