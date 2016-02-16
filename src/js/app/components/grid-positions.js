/*
	width: 		width of grid
	height: 	height of grid
	columns: 	number of columns
	rows: 		number of rows
	type: 		type of the array
				linear - will give all the cols and rows position together one after the other
				cols_rows - will give separate rows arrays with the cols inside 	row[ [col], [col], [col], [col] ]
																					row[ [col], [col], [col], [col] ]
*/

export default (width, height, columns, rows, type)=> {

	var t = type || 'linear'
	var blockSize = [ width / columns, height / rows ]
	var blocksLen = rows * columns
	var positions = []
	
	var posX = 0
	var posY = 0
	var columnCounter = 0
	var rowsCounter = 0
	var rr = []

	switch(t) {
		case 'linear': 
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
			break
		case 'cols_rows': 
			for (var i = 0; i < blocksLen; i++) {
				var b = [posX, posY]
				rr.push(b)
				posX += blockSize[0]
				columnCounter += 1
				if(columnCounter >= columns) {
					posX = 0
					posY += blockSize[1]
					columnCounter = 0
					positions[rowsCounter] = rr
					rr = []
					rowsCounter++
				}
			};
			break
	}


	return {
		rows: rows,
		columns: columns,
		blockSize: blockSize,
		positions: positions
	}
}