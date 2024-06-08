/*
	Map data into a Map which is parallel to node Array for collision & path finding
*/

define(['app/mapdata','app/shared'],function (Mapdata,Shared) {

	function Map () {
		console.log('creating Map');
		var value;
		this.emptySpace = new Uint8Array(Shared.gridArea);
		for ( var i=0,o=0; i < 80;i++, o+=4 ) {
			for ( var j=0,p=0; j< 80;j++,p+=4 ) {

				if ( j < 15 || j > 63 )
					value = 0;
				else
					value = Mapdata[i+(((80-1)-j)*80) - (15 * 80)];	
				for ( var u = 0; u < 4; u++ ) {
					for ( var r = 0; r < 4; r++ ) {
						this.emptySpace[Shared.gridWidth*(p+r)+(o+u)] = value;
					}					
				}
			}
		}

		//intentinonal blocker
		this.emptySpace[33172] = 0;
		this.emptySpace[33173] = 0;
		this.emptySpace[32852] = 0;
		this.emptySpace[32853] = 0;
		
	}

	return new Map();
});