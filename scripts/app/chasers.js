/*
	a child of unit.js module
*/

define(['app/shapes','app/util','app/units','app/shared'],function (Shapes,Util,Units,Shared) {
	function Chasers () {
		console.log('creating Chasers');
		this.newChaser = function () {
			Units.newUnit.call(this);
			this.speed = 16;
			this.size = 3;
			this.radius = 1.5;
			// this.mesh = Shapes.cube(this.size * Shared.cellSize);
			this.mesh = Shapes.checkeredPlane(this.size);

			// console.log('yikes' + this.mesh.position);
			this.revivePos = {x: 230, y:135 };
			// console.log('setting pos to revive pos of unit');
			Util.getCenterReal(this.revivePos.x,this.revivePos.y,this.size,Util.fconvArr);
			this.setPos(Util.fconvArr[0],Util.fconvArr[1]);
			this.mesh.position.z = this.size*0.5;

			this.mesh.visible = true;
		};

		Util.extend(Units.newUnit,this.newChaser);
	}
	
	return new Chasers();
});