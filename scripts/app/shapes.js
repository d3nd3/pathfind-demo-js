define(function () {
	function Shapes () {
		console.log('creating Shapes');
		this.cube = function(size) {
			var cube = new THREE.BoxGeometry(size,size,size);
			
			// faces are indexed using characters
			var faceIndices = [ 'a', 'b', 'c', 'd' ];

			// first, assign colors to vertices as desired
			for ( var i = 0; i < cube.vertices.length; i++ ) 
			{
			    point = cube.vertices[ i ];
			    color = new THREE.Color( );
			    color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
			    //color.setRGB(0.0,1.0,0.0);
			    cube.colors[i] = color; // use this array for convenience
			}

			// copy the colors to corresponding positions 
			//     in each face's vertexColors array.
			for ( var i = 0; i < cube.faces.length; i++ ) 
			{
			    face = cube.faces[ i ];
			    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
			    for( var j = 0; j < numberOfSides; j++ ) 
			    {
			        vertexIndex = face[ faceIndices[ j ] ];
			        face.vertexColors[ j ] = cube.colors[ vertexIndex ];
			    }
			}
			
			var mesh = new THREE.Mesh(cube, new THREE.MeshBasicMaterial({wireframe:false ,vertexColors: THREE.VertexColors}));

			return mesh;
		};



		this.rect = function(width,height) {
			var geometry = new THREE.BoxGeometry( width, height, 0 );
			var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
			var rect = new THREE.Mesh( geometry, material );
			
			return rect;
		};

		this.tube = function(startX,startY,endX,endY,thickness) {
			// Define the start and end positions of the line
			const startPos = new THREE.Vector3(startX, startY, 0);
			const endPos = new THREE.Vector3(endX, endY, 0);

			// Create a CatmullRomCurve3 with just the start and end points
			const curve = new THREE.CatmullRomCurve3([startPos, endPos]);

			// Create the tube geometry with a thickness of 1
			const tubeGeometry = new THREE.TubeGeometry(curve, 20, thickness, 8, false); 

			const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
			const mesh = new THREE.Mesh(tubeGeometry, material);
			return mesh;
		}
	}

	
	return new Shapes();
});