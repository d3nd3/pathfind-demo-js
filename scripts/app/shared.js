define( function () {

	function Shared() {
		console.log('creating Shared');
		this.gridWidth = 320;
		this.gridHeight = 320;
		this.cellSize = 32; // the size of one 'cell' in a grid in gl distance.
		this.flatground = undefined;
		this.totalSize = this.gridWidth * this.gridHeight;
	}
	return new Shared();
});