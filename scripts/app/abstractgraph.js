define( ['app/grid','app/shared'], function (Grid,Shared) {
	function Abgraph() {
		console.log('creating Agraph');
		this.create = function (size) {
			this.clusterSize = size;

			//bottom - left corner of each "abstract" cluster
			for ( x = 0; x < Shared.gridWidth; x += size ){
				for ( y = 0; y< Shared.gridHeight; y += size ){
					var cluster = Cluster.create();
					clusters.push(cluster);
				}
			}

		};
	}
	return new Abgraph();
});