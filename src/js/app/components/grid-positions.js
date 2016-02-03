/*
	width: width of grid
	height: height of grid
	rows: number of rows
	columns: number of columns
*/

export default (width, height, rows, columns)=> {

	var blockSize = [ width / columns, height / rows ]
	var blocksLen = rows * columns
	var positions = []
	
	var posX = 0
	var posY = 0
	var columnCounter = 0

	for (var i = 0; i < blocksLen; i++) {

		if(columnCounter >= columns) {
			posX = 0
			posY += blockSize[1]
			columnCounter = 0
		}
		var b = [posX, posY]

		posX += blockSize[0]
		columnCounter += 1

		positions[i] = b
	};

	return {
		rows: rows,
		columns: columns,
		blockSize: blockSize,
		positions: positions
	}
}