define(['jquerymousewheel','app/gl','app/shared','app/selector','app/util','app/line'], function (jmouse,Gl,Shared,Selector,Util,Line) {
	function Keys () {
		console.log('creating Keys');
		var self = this;
		self.lastLine = undefined;
		self.startLine = [];
		self.endLine = [];
		function Keydown(){
			this.w = false;
			this.a = false;
			this.s = false;
			this.d = false;

			this.panUp = false;
			this.panDown = false;
			this.panLeft = false;
			this.panRight = false;


			this.select = false; //bool activated by mousedown
			this.selectDraw = false; //bool activated by mousemove
		};
		this.leftClickPos = new Float32Array(2);
		this.keys = new Keydown();
		Selector.create();

		this.assign = function ( who ) {
			// $(document).keypress(function (event) {
				
			// 	event.preventDefault();
				
			// });
			$(document).keyup( function ( event ) {

				// alert(event.which);
				// console.log(event.which);
				switch ( event.which ) {
					case 87: // w
						self.keys.w = false;
					break;
					case 65: // a
						self.keys.a = false;
					break;
					case 83: // s
						self.keys.s = false;
					break;	
					case 68: // d
						self.keys.d = false;
					break;
				}
				
			});
			$(document).keydown( function (event) {
				// preventDefault();
				// alert(event.which);
				
				var x = who.mainUnit.mesh.position.x;
				var y = who.mainUnit.mesh.position.y;
				var speed = who.mainUnit.speed;
				switch ( event.which ) {

					case 87: // w
						self.keys.w = true;
					break;
					case 65: // a
						self.keys.a = true;
					break;
					case 83: // s
						self.keys.s = true;
					break;	
					case 68: // d
						self.keys.d = true;
					break;

					/*case 37: //left-arrow
						//map bounds collision
						if ( x > 0 && who.onMap == true) {
							x=x-speed;
							who.mainUnit.setPos( x,y );
						}
					break;
					*/
					case 38: //up-arrow
						//who.currentSelection
						//me.spawnUnit(me.giveUnit(Players.TYPE_RUNNER));
					break;
					/*
					case 39: //right-arrow

						//map bounds collision
						if ( x < Shared.gridWidth-1 && who.onMap == true) {
							x=x+speed;
							who.mainUnit.setPos( x,y );
						}
						
					break;
					case 40: //down-arrow

						//map bounds collision
						if ( y > 0 && who.onMap == true) {	
							y=y-speed;
							who.mainUnit.setPos( x,y );
						}
						
					break;
					*/
					
					case 32: //space
						// console.log('going over unit');
						// Gl.camOverPos(who.currentSelection.mesh.position);

						for ( var b = 0; b < Gl.debugObjs.length;b++) {
							Gl.scene.remove(Gl.debugObjs[b]);
						}
						Gl.debugObjs.length = 0;

						// var material = new THREE.LineBasicMaterial({
					 //        color: 0x0000ff
					 //    });

						// var geometry = new THREE.Geometry();
					 //    geometry.vertices.push(new THREE.Vector3(self.startLine[0], self.startLine[1], 1));
					   
					 //    geometry.vertices.push(new THREE.Vector3(self.endLine[0], self.endLine[1], 1));
					 //    var line = new THREE.Line(geometry, material);
					 //    if ( self.lastLine != undefined ) {
					 //    	Gl.scene.remove(self.lastLine);
					 //    }
					 //    self.lastLine = line;
					 //    Gl.scene.add(line);

					 //    if ( Line.isWalkable(self.startLine[0],self.startLine[1],self.endLine[0],self.endLine[1]) )
					 //    {
					 //    	console.log('YEESSS!!!');
					 //    } else
					 //    {
					 //    	console.log('NOOOO!!!');
					 //    }
					    


					break;
					case 27: //esc
						
						if ( who.currentSelection != undefined ) {
							Gl.scene.remove(Selector.ring);
							who.currentSelection = undefined;
						}
						
					break;
				}
					
			});
			$(document).mouseup( function (event) {

				if ( who.onMap == true ) {
					switch ( event.which ) {
						case 1 : // left click
							event.preventDefault();
							Util.getExactCoordinates(Gl.renderer.domElement,event);
							self.keys.select = false;
							if ( self.keys.selectDraw ) { 
								self.keys.selectDraw = false;
								Selector.hide();

								Selector.grabUnit(Util.fconvArr[0],Util.fconvArr[1],who);
							}

						break;

						case 3 : // right click
							//event.preventDefault();
						break;
					}
				}
			});

			$(document).mousedown( async function (event) {
				// console.log('mousedown!');
				if ( who.onMap == true ) {
					//console.log(event.which);
					switch ( event.which ) {
						case 1: // left click
							event.preventDefault();

							
							

							self.keys.select = true;
							self.leftClickPos[0] = Util.fconvArr[0];
							self.leftClickPos[1] = Util.fconvArr[1];


							// Util.getExactCoordinates(Gl.renderer.domElement,event);
						 //    Gl.clickVector.set(( Util.fconvArr[0] / window.innerWidth ) *2-1, -(Util.fconvArr[1]/window.innerHeight)*2+1, 0.5);
							// Gl.projector.unprojectVector( Gl.clickVector, Gl.camera );

							// Gl.clickRay.set(Gl.camera.position, Gl.clickVector.sub( Gl.camera.position ).normalize());
							// var intersects = Gl.clickRay.intersectObject( Shared.flatground );

							// if ( intersects.length > 0 ) {
							// 	self.startLine[0] = intersects[0].point.x;
							// 	self.startLine[1] = intersects[0].point.y;
							// }

						break;

						case 3: //right click
							event.preventDefault();
							

							// Util.getExactCoordinates(Gl.renderer.domElement,event);
						 //    Gl.clickVector.set(( Util.fconvArr[0] / window.innerWidth ) *2-1, -(Util.fconvArr[1]/window.innerHeight)*2+1, 0.5);
							// Gl.projector.unprojectVector( Gl.clickVector, Gl.camera );

							// Gl.clickRay.set(Gl.camera.position, Gl.clickVector.sub( Gl.camera.position ).normalize());
							// var intersects = Gl.clickRay.intersectObject( Shared.flatground );

							// if ( intersects.length > 0 ) {
							// 	self.endLine[0] = intersects[0].point.x;
							// 	self.endLine[1] = intersects[0].point.y;
							// }
							
							if ( who.currentSelection != undefined ) {
								Util.getExactCoordinates(Gl.renderer.domElement,event);
							    Gl.clickVector.set(( Util.fconvArr[0] / window.innerWidth ) *2-1, -(Util.fconvArr[1]/window.innerHeight)*2+1, 0.5);
								Gl.projector.unprojectVector( Gl.clickVector, Gl.camera );

								Gl.clickRay.set(Gl.camera.position, Gl.clickVector.sub( Gl.camera.position ).normalize());
								var intersects = Gl.clickRay.intersectObject( Shared.flatground );

								if ( intersects.length > 0 ) {
									var cs = who.currentSelection;
									await cs.wpsystem.generate(intersects[0].point.x,intersects[0].point.y,cs);

								}
							}				
						break;
					}
				}
			});

			$(document).on('mousewheel', function(event) {
	    		//console.log(event.deltaX, event.deltaY, event.deltaFactor);
				var distance = (Shared.cellSize/(1.5*Shared.cellSize)) * event.deltaFactor * (event.deltaY*-1);
				//console.log('distance is ' + distance);
	    		if ( event.deltaY > 0 )
	    		{
	    			//mousewheelup
	    			//zoomin here

	    			Gl.camera.position.z += distance;
	    		} else if ( event.deltaY < 0 )
	    		{
	    			//mousewheeldown
	    			//zoomout here
	    			Gl.camera.position.z += distance;
	    		}
	    		//console.log('new cam position z is : ' + Gl.camera.position.z);
			});

			$(document).mouseleave( function ( event )  {
				self.keys.panLeft = false;
				self.keys.panRight = false;
				self.keys.panUp = false;
				self.keys.panDown = false;
			});

			$(document).mousemove( function( event ) {
				// console.log('mousemove!');
				// alert('moving mouse');
				Util.getExactCoordinates(Gl.renderer.domElement,event);

			    //selector initation
			    if ( self.keys.select == true  && self.keys.selectDraw == false) {
			    	//save new endpos of selection rectangle
			    	self.keys.selectDraw = true;
			    	Selector.init(Util.fconvArr[0],Util.fconvArr[1],self.leftClickPos[0],self.leftClickPos[1]);
			    	Selector.show();
			    }

			    if ( self.keys.selectDraw == true ) {
			    	// console.log('resize!');
			   		Selector.resize(Util.fconvArr[0],Util.fconvArr[1]);
			    }


			    var hold = window.innerWidth * window.innerHeight * 0.00001;
			    
			    //left
			    var thresh = hold;
			    if ( Util.fconvArr[0] < thresh ) {
			    	// console.log('left is true');
				    self.keys.panLeft = true;  
			    } else {
			    	 self.keys.panLeft = false;
			    }

			    //right
			    thresh = window.innerWidth - hold;
			    if ( Util.fconvArr[0] > thresh) {
			    	// console.log('right is true');
			    	self.keys.panRight = true;
			    } else {
			    	self.keys.panRight = false;
			    }
			     
				//up
			    thresh = hold;
			    if ( Util.fconvArr[1] < thresh ) {
			    	// console.log('up is true');
		    		self.keys.panUp = true;
			    } else {
			    	self.keys.panUp = false;
			    }
			     
			    //down
			    thresh = window.innerHeight - hold;
			    if ( Util.fconvArr[1] > thresh ) {
			    	// console.log('down is true');
		    		self.keys.panDown = true;
			    } else { 
			    	self.keys.panDown = false;
			    }
			     

			});
		}; //this.assign function
	} // Keys constructor
	return new Keys();
});