define(['app/util','app/gl','app/runners','app/chasers'],function (Util,Gl,Runners,Chasers) {


	function Players() {
		console.log('creating Players');
		this.TYPE_RUNNER = 0;
		this.TYPE_CHASER = 1;
		var self = this;
		this.players = [];
		this.me = undefined;

		this.newPlayer = function Player(type) {
			this.units = [];
			this.mainUnit = {};
			this.onMap = false;
			this.type = type;
			this.currentSelection = undefined;

			this.mainUnit = this.giveUnit(self.TYPE_RUNNER);

			self.players.push(this);
		}
		this.newPlayer.prototype.spawnUnit = function (unit) {
			Gl.scene.add(unit.mesh);
		};

		this.newPlayer.prototype.giveUnit = function (type) {
			var newUnit;
			if ( type == self.TYPE_RUNNER ){
				console.log('youre a runner');
				newUnit = new Runners.newRunner();
			}
			else if ( type == self.TYPE_CHASER ) {
				console.log('youre a chaser');
				newUnit = new Chasers.newChaser();
			}

			this.units.push(newUnit);
			return newUnit;
		};

	}

	return new Players();
});