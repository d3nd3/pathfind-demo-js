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
	}

	
	return new Shapes();
});