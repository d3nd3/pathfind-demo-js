require(['app/game','app/players','app/gl','app/keys','app/shared','app/selector'],function (Game,Players,Gl, Keys,Shared,Selector) {
	function Frame () {
		console.log('creating Frame');
		
		var lastLoop = new Date();
		var tenPerSec = new Date();

		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );
		var render = function () {
			requestAnimationFrame(render);

			var thisLoop = new Date();
			diffinMs = thisLoop - lastLoop;
			lastLoop = thisLoop;

	    	var fps = 1000 / (diffinMs);
	    	
	    	//console.log('hello');
	    	//console.log('fps_client is ' + fps);

	    	//i want to emulate a 10 fps server loop



			//apply game frame stuff here - server & client atm

			//move each player that is alive a certain 'distance' .. which corresponds to his 'speed' each/this frame
			/*
			for ( var i = 0;i<Player.players.length;i++) {
				//console.log('this' + Player.players.length);
				var player=Player.players[i];
				//console.log('lol current is ' + player.pathing.current);
				if ( player.pathing.current != 0 ) {
					player.pathing.current -= 1;

					//set position to the next path point
					player.setPos(player.pathing.parents[player.pathing.current]);
					player.updateMesh();

					//if reached destination
					if ( player.pathing.current == 0) {
						//clear this array
						player.pathing.parents.length = 0;	
					}
					
				}
				
			}*/
/*
			//for every player
			for ( i = 0; i < Players.players.length; i++ ) {
				var player = Players.players[i];
				//for every unit of each player
				for ( j = 0; j < player.units.length; j++ ) {
					var unit = player.units[j];
					unit.step();
					//console.log('pos is ' + unit.mesh.position.x + ' ' + unit.mesh.position.y);
				}
			}
*/
			if ( Keys.keys.w ) {
				Gl.camera.position.y = Gl.camera.position.y + (Shared.cellSize);
			}
			if ( Keys.keys.a ) {
				Gl.camera.position.x = Gl.camera.position.x - (Shared.cellSize);
			}
			if ( Keys.keys.s ) {
				Gl.camera.position.y = Gl.camera.position.y - (Shared.cellSize);
			}
			if ( Keys.keys.d ) {
				Gl.camera.position.x = Gl.camera.position.x + (Shared.cellSize);
			}

			
			if ( Keys.keys.panUp == true ) {
				Gl.camera.position.y = Gl.camera.position.y + (Shared.cellSize);
			}
			if ( Keys.keys.panLeft == true ) {
				Gl.camera.position.x = Gl.camera.position.x - (Shared.cellSize);
			}
			if ( Keys.keys.panDown) {
				Gl.camera.position.y = Gl.camera.position.y - (Shared.cellSize);
			}
			if ( Keys.keys.panRight) {
				Gl.camera.position.x = Gl.camera.position.x + (Shared.cellSize);			
			}
			

			//update selection ring ;p
			if ( Players.me.currentSelection != undefined ) {
				Selector.ring.position.x = Players.me.currentSelection.mesh.position.x;
				Selector.ring.position.y = Players.me.currentSelection.mesh.position.y;
			}
			
	

			stats.begin();
			Gl.renderer.render(Gl.scene, Gl.camera);
			// Gl.renderer.clearDepth();
			Gl.renderer.render(Gl.sceneUi,Gl.cameraUi);
			stats.end();

			
		}; //end render().
		render();
		
		var serverLoop = function() {
			var now = new Date();
			var fps = 1000/(now-tenPerSec);
			tenPerSec = now;
			//console.log('fps_sever is ' + fps);


			//for every player
			for ( i = 0; i < Players.players.length; i++ ) {
				var player = Players.players[i];
				//for every unit of each player
				for ( j = 0; j < player.units.length; j++ ) {
					var unit = player.units[j];
					unit.step();
					//console.log('pos is ' + unit.mesh.position.x + ' ' + unit.mesh.position.y);
				}
			}



			var measureTime = new Date();
			setTimeout(serverLoop, 100 - (measureTime - now));
		
		};
		serverLoop();
		//setInterval(render, 1000/60);
	}

	return new Frame();
});