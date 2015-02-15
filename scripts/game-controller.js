(function() {

	function GameController($scope, CellFactory) {
		
		var numRows = 16;
		var numColumns = 30;
		var numMines = 99;

		var cells = [];
		var cellDivs = [];

		var leftButtonDown = false;
		var rightButtonDown = false;

		var MOUSE_BUTTON = {
			LEFT: 0,
			MIDDLE: 1,
			RIGHT: 2
		};

		var isGameOver = false;

		function getRandomNumber(min, max) {
			return Math.round(Math.random() * (max - min) + min);
		}

		function setupGame() {
			isGameOver = false;
			var cellsRef = [];	// for quickly setting random mines
			for (var i = 0; i < numRows; i++) {
				var row = [];
				for (var j = 0; j < numColumns; j++) {
					var cell = new CellFactory.Cell(i, j);
					row.push(cell);
					cellsRef.push(cell);
				}
				cells.push(row);
			}

			var numCells = numRows * numColumns;
			for (var i = 0; i < numMines; i++) {
				var cellIndex = getRandomNumber(0, numCells-1);
				cellsRef[cellIndex].setType(CellFactory.CellType.MINE);
				cellsRef.splice(cellIndex, 1);
				numCells--;
			}
			cellsRef = null;
		}

		function cellPositionExists(position) {
			return position[0] >= 0
				&& position[0] < numRows
				&& position[1] >= 0
				&& position[1] < numColumns;
		}

		function getAdjacentCells(position) {
			var adjacentPositions = [
				[position[0], position[1] - 1],
				[position[0] + 1, position[1] - 1],
				[position[0] + 1, position[1]],
				[position[0] + 1, position[1] + 1],
				[position[0], position[1] + 1],
				[position[0] - 1, position[1] + 1],
				[position[0] - 1, position[1]],
				[position[0] - 1, position[1] - 1],
			];

			var adjacentCells = [];
			for (var i = 0, len = adjacentPositions.length; i < len; i++) {
				if ( cellPositionExists(adjacentPositions[i]) ) {
					var x = adjacentPositions[i][0];
					var y = adjacentPositions[i][1];
					adjacentCells.push( cells[x][y] );
				}
			}

			return adjacentCells;
		}

		function setCellDivs() {	// to avoid needing a repeat finished directive we use lazy loading
			if (cellDivs.length !== 0) {
				return;
			}

			$cellRows = $('#game-board').find('.cell-row');
			$cellRows.each(function() {
				$rowDivs = $(this).find('.cell');
				cellDivs.push($rowDivs);
			});
		}

		function countMines(cells) {
			var mineCount = 0;
			for (var i = 0, len = cells.length; i < len; i++) {
				if (cells[i].getType() === CellFactory.CellType.MINE) {
					mineCount++;
				}
			}
			return mineCount;
		}

		function revealBlankAdjacentCells(originCell) {
			var originAdjacentCells = getAdjacentCells(originCell.getPosition());
			for (var i = 0, len = originAdjacentCells.length; i < len; i++) {
				var adjacentCells = getAdjacentCells(originAdjacentCells[i]);
				var mineCount = countMines(adjacentCells);
				if (mineCount == 0 && originAdjacentCells[i].getState() === CellFactory.CellState.HIDDEN) {
					revealCell(originAdjacentCells[i]);
				}
			}

		}

		function getCellDiv(position) {
			setCellDivs();
			return cellDivs[position[0]][position[1]];
		}

		function revealAllMines() {
			for (var i = 0; i < numRows; i++) {
				for (var j = 0; j < numColumns; j++) {
					var cell = cells[i][j];
					if (cell.getType() === CellFactory.CellType.MINE && cell.getState() === CellFactory.CellState.HIDDEN) {
						revealMine(cell);
					}
				}
			}
		}

		function revealMine(cell, isTriggered) {
			var cellDiv = getCellDiv(cell.getPosition());
			var $cellDiv = $(cellDiv).addClass('revealed');
			$cellDiv.html('X');
			$cellDiv.addClass('bomb');
			if (isTriggered) {
				$cellDiv.addClass('triggered');
			}
		}

		function revealCell(cell) {
			cell.reveal();

			if (cell.getType() === CellFactory.CellType.MINE) {
				revealMine(cell, true);
				revealAllMines();
				endGame();
				return;
			}

			var adjacentCells = getAdjacentCells(cell.getPosition());
			var mineCount = countMines(adjacentCells);
			
			var cellDiv = getCellDiv(cell.getPosition());
			var $cellDiv = $(cellDiv).addClass('revealed');

			if (mineCount > 0) {
				$cellDiv.html(mineCount);
				$cellDiv.addClass('m' + mineCount.toString());
				cell.setMineCount(mineCount);
			} else {
				revealBlankAdjacentCells(cell);
			}
		}

		function cellClicked(event, clickedCell) {
			if (clickedCell.getState() === CellFactory.CellState.FLAGGED) {
				return;
			}
			revealCell(clickedCell);
		}

		function cellRightClicked(event, cell) {
			event.preventDefault();

			switch (cell.getState()) {
				case CellFactory.CellState.REVEALED:
					return;
				case CellFactory.CellState.FLAGGED:
					cell.unflag();
					var cellDiv = getCellDiv(cell.getPosition());
					angular.element(cellDiv).html('');
					break;
				default:	// hidden
					cell.flag();
					var cellDiv = getCellDiv(cell.getPosition());
					angular.element(cellDiv).html('F');
					break;
			}
		}

		function updateMouseButtonState(button, value) {
			switch (button) {
				case MOUSE_BUTTON.LEFT:
					leftButtonDown = value;
					break;
				case MOUSE_BUTTON.RIGHT:
					rightButtonDown = value;
					break;
				default: // middle
					break;
			}
		}

		function countAdjacentFlags(cell) {
			var adjacentCells = getAdjacentCells(cell.getPosition());
			var flagCount = 0;
			for (var i = 0, len = adjacentCells.length; i < len; i++) {
				if (adjacentCells[i].getState() === CellFactory.CellState.FLAGGED) {
					flagCount++;
				}
			}
			return flagCount;
		}

		function cellMouseDown(event, cell) {
			updateMouseButtonState(event.button, true);
		}

		function cellMouseUp(event, cell) {
			var bothDownBefore = leftButtonDown && rightButtonDown;
			updateMouseButtonState(event.button, false);
			var bothDownAfter = leftButtonDown && rightButtonDown;

			// check for the mass reveal action
			if (cell.getState() === CellFactory.CellState.REVEALED && bothDownBefore && !bothDownAfter) {
				if (cell.getMineCount() === countAdjacentFlags(cell)) {
					revealBlankAdjacentCells(cell);
				}
			}
		}

		function endGame() {
			isGameOver = true;
			var overlay = document.getElementById('overlay');
			overlay.style.height = overlay.parentNode.offsetHeight + 'px';
		}

		setupGame();

		return {
			Cells : cells,
			cellClicked : cellClicked,
			cellRightClicked : cellRightClicked,
			cellMouseDown : cellMouseDown,
			cellMouseUp : cellMouseUp,
			isGameOver : function() { return isGameOver; }
		}
	}

	angular.module('minesweeper')
		.controller('GameController', GameController);

})();