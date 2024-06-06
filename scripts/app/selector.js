define ( ['app/overlay','app/shapes','app/gl','app/util','app/units','app/collision'],function (Overlay,Shapes,Gl,Util,Units,Collision) {
	function Selector () {
		console.log('creating Selector');
		var self = this;
		this.thickness = 0.25;
		this.firstClick = new Float32Array(2);
		this.firstRatio = new Float32Array(2);
		this.firstClickWorld = new Float32Array(2);
		this.create = function() {
			this.segments = [
				new Overlay.newOverlayObject ( Shapes.rect(Overlay.screenToWorldX(1),this.thickness), 50,45,1 ), //bottom
				new Overlay.newOverlayObject ( Shapes.rect(Overlay.screenToWorldX(1),this.thickness), 50,55,1 ), //top
				new Overlay.newOverlayObject ( Shapes.rect(this.thickness,Overlay.screenToWorldY(1)), 45,50,1 ), //left
				new Overlay.newOverlayObject ( Shapes.rect(this.thickness,Overlay.screenToWorldY(1)), 55,50,1 )  //right
			];
			this.ring = new THREE.Mesh( new THREE.RingGeometry( 30,28, 32,1 ), new THREE.MeshBasicMaterial( {color:0x00ff00,side:THREE.BackSide} ) );
			this.ring.position.z = 1;
			this.realign();

		};
		this.init = function ( movex,movey,x,y ) { 
			var ww = window.innerWidth;
			var wh = window.innerHeight;
			this.firstClick[0] = x;
			this.firstClick[1] = y;

			this.firstRatio[0] = this.firstClick[0]/ww;
			this.firstRatio[1] = (wh-this.firstClick[1])/wh;

			this.firstClickWorld[0] = Overlay.screenToWorldX(this.firstRatio[0]);
			this.firstClickWorld[1] = Overlay.screenToWorldY(this.firstRatio[1]);

			

			// var dx = movex-this.firstClick[0];
			// var dy = movey-this.firstClick[1];

			//left + right verticals
			var t = this.firstClickWorld[0];
			this.segments[3].m.position.x = t;
			this.segments[2].m.position.x = t;
			this.segments[1].m.position.x = t;
			this.segments[0].m.position.x = t;

			//top and bottom
			t = this.firstClickWorld[1];
			this.segments[3].m.position.y = t;
			this.segments[2].m.position.y = t;
			this.segments[1].m.position.y = t;
			this.segments[0].m.position.y = t;

			this.segments[0].m.scale.x = 0.001;
			this.segments[1].m.scale.x = 0.001;
			this.segments[2].m.scale.y = 0.001;
			this.segments[3].m.scale.y = 0.001;


			// var adx = Math.abs(dx);
			
			// t = adx / ww;

			// if ( adx > 0 ) {
			// 	this.segments[0].m.scale.x = t;
			// 	this.segments[1].m.scale.x = t;
			// }
			

			// t = ady / wh;
			// var ady = Math.abs(dy);
			// if ( ady > 0 ) {
			// 	this.segments[2].m.scale.y = t;
			// 	this.segments[3].m.scale.y = t;
			// }
			
		};
		this.resize = function (x,y) {
			var ww = window.innerWidth;
			var wh = window.innerHeight;

			// y = wh-y;
			var newRatioX = x/ww;
			var newRatioY = (wh-y)/wh;

			var dx = x-this.firstClick[0];
			var dy = y-this.firstClick[1];
			var adx = Math.abs(dx);
			var rectFix = (this.thickness*11)/ww;
			if (adx > 0) { 
				var t2 = adx / ww;
				// console.log('x ' + t2);
				//scale bottom and top slightly more for sake of rectangle effect

				
				this.segments[1].m.scale.x = t2 + rectFix;
				this.segments[0].m.scale.x = t2 + rectFix;

				if ( dx > 0 ) { 
					//move right wall right
					this.segments[3].m.position.x = Overlay.screenToWorldX(newRatioX);

					//when the top or bottom sides increase in size, they must also be re-positioned
					this.segments[0].m.position.x = Overlay.screenToWorldX(this.firstRatio[0]+(t2*0.5));
					this.segments[1].m.position.x = Overlay.screenToWorldX(this.firstRatio[0]+(t2*0.5));

				} else
				{
					//move left wall left
					this.segments[2].m.position.x = Overlay.screenToWorldX(newRatioX);

					//when the top or bottom sides increase in size, they must also be re-positioned
					this.segments[0].m.position.x = Overlay.screenToWorldX(this.firstRatio[0]-(t2*0.5));
					this.segments[1].m.position.x = Overlay.screenToWorldX(this.firstRatio[0]-(t2*0.5));
				}
			}

			var ady = Math.abs(dy);
			rectFix = (this.thickness*11)/wh;
			if ( ady > 0 ) {
				var t = ady / wh;
				// console.log('y ' + t);
				this.segments[3].m.scale.y = t+ rectFix;;
				this.segments[2].m.scale.y = t+ rectFix;;

				if ( dy > 0 ) {
					//move top wall up

					this.segments[1].m.position.y = Overlay.screenToWorldY(newRatioY);

					//when the left or right sides increase in size, they must also be re-positioned
					this.segments[3].m.position.y = Overlay.screenToWorldY(this.firstRatio[1]-(t*0.5));
					this.segments[2].m.position.y = Overlay.screenToWorldY(this.firstRatio[1]-(t*0.5));
				} else
				{
					//move bottom wall down
					this.segments[0].m.position.y = Overlay.screenToWorldY(newRatioY);

					//when the left or right sides increase in size, they must also be re-positioned
					this.segments[3].m.position.y = Overlay.screenToWorldY(this.firstRatio[1]+(t*0.5));
					this.segments[2].m.position.y = Overlay.screenToWorldY(this.firstRatio[1]+(t*0.5));
				}
			}		
			
		};
		this.hide = function () {
			for ( var i = 0 ; i < 4; i ++ ) {
				this.segments[i].hide();	
			}
		};

		this.show = function() {
			for ( var i = 0 ; i < 4; i ++ ) {
				this.segments[i].show();	
			}
		};

		//resizes the lines so they are 100% of screen width and height...
		this.realign = function () {
			// full length
			var t = 50 * Gl.camera.aspect;
			var r = this.thickness;

			//bottom
			this.segments[0].m.geometry.vertices[0] = new THREE.Vector3(t,r,0);
			this.segments[0].m.geometry.vertices[1] = new THREE.Vector3(t,-r,0);
			this.segments[0].m.geometry.vertices[2] = new THREE.Vector3(-t,r,0);
			this.segments[0].m.geometry.vertices[3] = new THREE.Vector3(-t,-r,0);
			this.segments[0].m.geometry.verticesNeedUpdate = true;

			//top
			this.segments[1].m.geometry.vertices[0] = new THREE.Vector3(t,r,0);
			this.segments[1].m.geometry.vertices[1] = new THREE.Vector3(t,-r,0);
			this.segments[1].m.geometry.vertices[2] = new THREE.Vector3(-t,r,0);
			this.segments[1].m.geometry.vertices[3] = new THREE.Vector3(-t,-r,0);
			this.segments[1].m.geometry.verticesNeedUpdate = true;

			t = this.thickness;
			//full length
			r = 50;

			//left
			this.segments[2].m.geometry.vertices[0] = new THREE.Vector3(t,r,0);
			this.segments[2].m.geometry.vertices[1] = new THREE.Vector3(t,-r,0);
			this.segments[2].m.geometry.vertices[2] = new THREE.Vector3(-t,r,0);
			this.segments[2].m.geometry.vertices[3] = new THREE.Vector3(-t,-r,0);
			this.segments[2].m.geometry.verticesNeedUpdate = true;

			//right
			this.segments[3].m.geometry.vertices[0] = new THREE.Vector3(t,r,0);
			this.segments[3].m.geometry.vertices[1] = new THREE.Vector3(t,-r,0);
			this.segments[3].m.geometry.vertices[2] = new THREE.Vector3(-t,r,0);
			this.segments[3].m.geometry.vertices[3] = new THREE.Vector3(-t,-r,0);
			this.segments[3].m.geometry.verticesNeedUpdate = true;
		};




		//new THREE.Vector3(
	    // ( event.clientX / window.innerWidth ) * 2 - 1,
	    // - ( event.clientY / window.innerHeight ) * 2 + 1,
	    // 0.5 );
		this.grabUnit = function (releaseLocX,releaseLocY,who) {

			
		
			var trapezTL = new THREE.Vector3(), trapezTR = new THREE.Vector3(), trapezBL = new THREE.Vector3(), trapezBR = new THREE.Vector3();
			var diff = releaseLocX - this.firstClick[0];
			var s = releaseLocX - diff;
			if ( diff > 0 ) {	
				//release posX to the right
				trapezTL.x = s;
				trapezBL.x = s;

				trapezTR.x = releaseLocX;
				trapezBR.x = releaseLocX;
			} else
			{
				trapezTR.x = s;
				trapezBR.x = s;

				trapezTL.x = releaseLocX;
				trapezBL.x = releaseLocX;
			}

			diff = releaseLocY - this.firstClick[1];
			s = releaseLocY - diff;
			if ( diff > 0 ) {	
				//release posY is further down/south
				trapezTL.y = s;
				trapezTR.y = s;

				trapezBL.y = releaseLocY;
				trapezBR.y = releaseLocY;
			} else
			{
				trapezBL.y = s;
				trapezBR.y = s;

				trapezTL.y = releaseLocY;
				trapezTR.y = releaseLocY;
			}

			// var c2=Gl.canvas.getContext("2d");
			// c2.fillStyle = "#0000FF";
			// c2.beginPath();
			// c2.moveTo(  trapezBL.x, trapezBL.y );
			// c2.lineTo(  trapezTL.x, trapezTL.y );
			// c2.lineTo( trapezTR.x, trapezTR.y );
			// c2.lineTo(  trapezBR.x, trapezBR.y );
			// c2.lineTo(  trapezBL.x, trapezBL.y );
			// c2.closePath();
			// c2.fill();

			var dir,distance;
			Util.aVector.set((trapezBL.x/window.innerWidth)*2-1,-(trapezBL.y/window.innerHeight)*2+1,1);
			Gl.projector.unprojectVector(Util.aVector,Gl.camera);		
			dir = Util.aVector.sub( Gl.camera.position ).normalize();
			distance = - Gl.camera.position.z / dir.z;
			trapezBL = Gl.camera.position.clone().add( dir.multiplyScalar( distance ));


			Util.aVector.set((trapezBR.x/window.innerWidth)*2-1,-(trapezBR.y/window.innerHeight)*2+1,1);
			Gl.projector.unprojectVector(Util.aVector,Gl.camera);		
			dir = Util.aVector.sub( Gl.camera.position ).normalize();
			distance = - Gl.camera.position.z / dir.z;
			trapezBR = Gl.camera.position.clone().add( dir.multiplyScalar( distance ));

			Util.aVector.set((trapezTL.x/window.innerWidth)*2-1,-(trapezTL.y/window.innerHeight)*2+1,1);
			Gl.projector.unprojectVector(Util.aVector,Gl.camera);		
			dir = Util.aVector.sub( Gl.camera.position ).normalize();
			distance = - Gl.camera.position.z / dir.z;
			trapezTL = Gl.camera.position.clone().add( dir.multiplyScalar( distance ));

			Util.aVector.set((trapezTR.x/window.innerWidth)*2-1,-(trapezTR.y/window.innerHeight)*2+1,1);
			Gl.projector.unprojectVector(Util.aVector,Gl.camera);		
			dir = Util.aVector.sub( Gl.camera.position ).normalize();
			distance = - Gl.camera.position.z / dir.z;
			trapezTR = Gl.camera.position.clone().add( dir.multiplyScalar( distance ));

			// var triangleShape = new THREE.Shape();
			// triangleShape.moveTo(  trapezBL.x, trapezBL.y );
			// triangleShape.lineTo(  trapezTL.x, trapezTL.y );
			// triangleShape.lineTo( trapezTR.x, trapezTR.y );
			// triangleShape.lineTo(  trapezBR.x, trapezBR.y );
			// triangleShape.lineTo(  trapezBL.x, trapezBL.y );
			// // triangleShape.createPointsGeometry();
			// var geometry = new THREE.ShapeGeometry( triangleShape );
			// var mat = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
			// var mesh = new THREE.Mesh(geometry,mat);
			// Gl.scene.add(mesh);
			// mesh.position.z = 1;


			


			var a = [trapezTL,trapezTR,trapezBR,trapezBL];
			// for every unit of player
			for ( j = 0; j < who.units.length; j++ ) {
				var unit = who.units[j];
				var pp = unit.mesh.position;
				if ( Collision.pointInPolygon(a,pp.x,pp.y) ) {
					console.log('found a unit!:)');

					this.ring.position.x = pp.x;
					this.ring.position.y = pp.y;
					Gl.scene.add(this.ring);
					this.ring.scale.x = unit.size;
					this.ring.scale.y = unit.size;
					// this.ring.scale.z = unit.size;
					who.currentSelection = unit;
					break;
				}
				
			}
			

		}
	}

	return new Selector();
});