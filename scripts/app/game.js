define(['app/gl','app/players','app/keys','app/util','app/overlay','app/selector'],function (Gl,Players,Keys,Util,Overlay,Selector) {

	function Game (  ) {
		console.log('creating Game');	
		if (!Date.now) {
		    Date.now = function() { return new Date().getTime(); };
		}
		
		//also create mesh
		var me = new Players.newPlayer(Players.TYPE_RUNNER);
		Players.me = me;
		// var orc = new Players.newPlayer(Players.TYPE_CHASER);
		Keys.assign(me);
		setTimeout(function () {
			//giveUnit = creates mesh
			//spawnUnit = draws mesh
			console.log('1 second timer hit.');
			me.spawnUnit(me.mainUnit);
			me.onMap = true;
			console.log('spawned mainunit');
			
			//test 1000 units.
			for ( let i=0; i<1;i++ ) {
				me.spawnUnit(me.giveUnit(Players.TYPE_RUNNER));
			}
			
			console.log('spawned second unit');

			me.spawnUnit(me.giveUnit(Players.TYPE_CHASER));
			console.log('spawned a chaser');
			
			// orc.putOnMap();
			//x,y,size,outarray
			Util.getCenterReal(me.mainUnit.revivePos.x,me.mainUnit.revivePos.y,me.mainUnit.size,Util.fconvArr);

			Gl.camOverPos({x:Util.fconvArr[0],y:Util.fconvArr[1]});

			

			// Overlay.newOverlayObjectTex('images/crosshairs01.png');

			/*var tex = THREE.ImageUtils.loadTexture('images/crosshairs01.png');
			var mat = new THREE.SpriteMaterial( { map: tex, depthTest: false } );
			var tt = new THREE.Sprite(mat);
			//scale the crosshairSprite down in size
			tt.scale.set(1,1,1);
			//add crosshairSprite as a child of our camera object, so it will stay centered in camera's view
			Gl.sceneUi.add(tt);
			*/
	
		},1000);	

		window.onresize = function(event) {	
			var w = window.innerWidth;
			var h = window.innerHeight;
			Gl.camera.aspect = w / h;
			Gl.cameraUi.right = Overlay.screenToWorldX(1);

			Gl.camera.updateProjectionMatrix();
			Gl.cameraUi.updateProjectionMatrix();
			Gl.renderer.setSize( w, h );

			//re-position all Sprites based on camera's aspect ratio
			// Overlay.update();
			Selector.realign();
		};
	}
	return new Game();
});