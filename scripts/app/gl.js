define(['app/shared','app/util'],function (Shared,Util) {

	function Gl () {
		console.log('creating Gl');
		var self = this;
		var w = window.innerWidth;
		var h = window.innerHeight;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70, w/h, 0.5, 2000); //100 4000
		// this.scene.add(this.camera);
		

		this.sceneUi = new THREE.Scene();
		// this.cameraUi = new THREE.OrthographicCamera( (900 * w/h)/-2, (900 * w/h)/2, 900/2, 900/-2, 1, 1000 );
		this.cameraUi = new THREE.OrthographicCamera( 0, (100 * w/h), 100, 0, 1, 1000 );
		// this.sceneUi.add(this.cameraUi);

		this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.renderer.autoClear = false;
		this.renderer.setSize(w, h);
		document.body.appendChild(this.renderer.domElement);
		
		// this.canvas = document.createElement('canvas');
		// this.canvas.id     = "fuckoff";
		// this.canvas.width  = window.innerWidth - 10;
		// this.canvas.height = window.innerHeight - 10;
		// this.canvas.style.zIndex   = 8;
		// this.canvas.style.position = "absolute";
		// this.canvas.style.top = "0px";
		// this.canvas.style.left = "0px";
		// this.canvas.style.border   = "5px solid";
		// document.body.appendChild(this.canvas);
			
		 // var geometry = new THREE.BoxGeometry( 850 * w/h, 850, 0 );
	    // var geometry = new THREE.BoxGeometry( 50, 50, 0 );
	    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	    // var rect = new THREE.Mesh( geometry, material );
	    // this.sceneUi.add(rect);
	    // rect.position.z = -25;

		//wc3-like camera
		// this.camera.position.z = 1650;
		this.camera.position.z = 600;
		// this.camera.position.set(0,0,0);
		this.camera.rotation.x = 34 * Math.PI / 180;

		this.projector = new THREE.Projector();

		this.clickVector = new THREE.Vector3(0.0,0.0,0.0);
		this.clickRay = new THREE.Raycaster();

		this.debugObjs = [];

		//project = 3d to 2d
		//unproject = 2d to 3d
		this.camOverPos = function ( pos ) {
			//method1
			// 2 * tan(fov/2) * z dist
			// this.camera.position.x += (pos.x - this.camera.position.x); //center.x;
			// this.camera.position.y += (pos.y - this.camera.position.y) - (460.39619278737620575382501520124 * Math.cos(this.camera.rotation.x));

			//method2
			//it wants -1 to 1 for x and 1 to -1 for y
			Util.aVector.set(0,0,0.5);
			this.projector.unprojectVector(Util.aVector,this.camera);

			var dir = Util.aVector.sub( this.camera.position ).normalize();
			var distance = - this.camera.position.z / dir.z;
			var midScreenInterceptPlane = this.camera.position.clone().add( dir.multiplyScalar( distance ) );

			var a = this.camera.position.x + pos.x - midScreenInterceptPlane.x;
			if ( Math.abs(a - this.camera.position.x) > 1.0 )
				this.camera.position.x = a;
			var b = this.camera.position.y + pos.y- midScreenInterceptPlane.y;
			if ( Math.abs(b - this.camera.position.y) > 1.0 )
				this.camera.position.y = b;
		};

	}

	return new Gl();
});