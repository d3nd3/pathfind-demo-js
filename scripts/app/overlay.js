define( ['app/gl'],function (Gl) {
	function Overlay () {
		console.log('creating Overlay');
		self = this;

		this.overlays = [];
		this.newOverlayObjectTex = function ( texname, percX, percY , scale) {
			this.percX = percX;
			this.percY = percY;
			var tex = THREE.ImageUtils.loadTexture(texname);
			var mat = new THREE.SpriteMaterial( { map: tex, depthTest: true } );
			this.m = new THREE.Sprite(mat);
			//scale the crosshairSprite down in size
			this.m.scale.set(scale,scale,scale);
			//add crosshairSprite as a child of our camera object, so it will stay centered in camera's view
			// this.m.position.x = 0;
			// this.m.position.y = 0;
			this.m.position.z = -1;

			self.overlays.push(this);
			
			this.hide = function ( ) {
				Gl.sceneUi.remove(this.m);
			};
			this.show = function ( ) {
				Gl.sceneUi.add(this.m);
			};
			
		};

		this.newOverlayObject = function ( mesh, percX, percY , scale) {
			this.percX = percX;
			this.percY = percY;
	
			this.m = mesh;
			//scale the crosshairSprite down in size
			this.m.scale.set(scale,scale,scale);
			//add crosshairSprite as a child of our camera object, so it will stay centered in camera's view
			// Gl.sceneUi.add(this.m); 
			this.m.position.x = this.percX/100 * 900 * Gl.camera.aspect;
			this.m.position.y = this.percY/100 * 900;
			this.m.position.z = -1;

			self.overlays.push(this);

			this.hide = function ( ) {
				Gl.sceneUi.remove(this.m);
			};
			this.show = function ( ) {
				Gl.sceneUi.add(this.m);
			};

			
		};


		this.update = function () {
			for ( var o = 0; o < self.overlays; o++ ) {
				o.m.position.x = self.getPercValuePositionX(o.percX);
				o.m.position.y = self.getPercValuePositionY(o.percY);
			}
			
		};
		var lol = 2.1006226146291293383755681583345;
		// var lol = 2;
		var lol2 = 1.05;
		this.getPercValuePositionX  = function ( perc ) {
			var out = ((perc/100) * lol - lol2) * Gl.camera.aspect;
			return out;
			// return 0;
		};
		this.getPercValuePositionY  = function ( perc ) {
			var out = ((perc/100) * lol - lol2);
			return out;
			// return 0;
		};
		//2 * tan(fov/2) * z dist
		//2.1006226146291293383755681583345
		this.getPercValueResizeX = function ( perc ) {
			var out = ((perc/100) *  lol )* Gl.camera.aspect;
			return out;
			// return 0;
		};
		this.getPercValueResizeY = function ( perc ) {
			var out = ((perc/100) * lol );
			return out;
			// return 0;
		};


		this.screenToWorldX = function(input) {
			return input * Gl.camera.aspect * 100;
		};
		this.screenToWorldY = function(input) {
			return input*100;
		};
	}
	return new Overlay();
});


