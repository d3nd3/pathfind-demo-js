/*
	a child of unit.js module
*/

define(['app/shapes','app/util','app/units','app/shared'],function (Shapes,Util,Units,Shared) {
	function Runners () {
		console.log('creating Runners');
		this.newRunner = function () {
			Units.newUnit.call(this);
			this.speed = 40;
			this.size = 1;
			this.radius = 0.5;
			this.mesh = Shapes.cube(this.size * Shared.cellSize);
			// console.log('yikes' + this.mesh.position);
			this.revivePos = {x: 180, y:154 };
			// console.log('setting pos to revive pos of unit');
			Util.getCenterReal(this.revivePos.x,this.revivePos.y,this.size,Util.fconvArr);
			this.setPos(Util.fconvArr[0],Util.fconvArr[1]);
			this.mesh.position.z = this.size*0.5;
		};

		Util.extend(Units.newUnit,this.newRunner);
	}
	
	return new Runners();
});