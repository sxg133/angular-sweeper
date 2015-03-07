(function() {

	function CellFactory() {

		var CellState = {
			HIDDEN : 0,
			REVEALED : 1,
			FLAGGED : 2
		};

		var CellType = {
			BLANK : 0,
			MINE : 1
		}

		function Cell(x, y) {
			var state = CellState.HIDDEN;
			var type = CellType.BLANK;
			var position = [x, y];
			var mineCount;
			var _isTriggered = false;

			function setType(newType) {
				type = newType;
			}

			function getType() {
				return type;
			}

			function getPosition() {
				return position;
			}

			function reveal() {
				state = CellState.REVEALED;
			}

			function getState() {
				return state;
			}

			function flag() {
				state = CellState.FLAGGED;
			}

			function unflag() {
				state = CellState.HIDDEN;
			}

			function setMineCount(newMineCount) {
				mineCount = newMineCount;
			}

			function getMineCount() {
				return mineCount;
			}

			function triggerMine() {
				reveal();
				_isTriggered = true;
			}

			function isTriggered() {
				return _isTriggered;
			}

			return {
				setType : setType,
				getType : getType,
				getPosition : getPosition,
				reveal : reveal,
				getState : getState,
				flag : flag,
				unflag : unflag,
				setMineCount : setMineCount,
				getMineCount : getMineCount,
				triggerMine : triggerMine,
				isTriggered : isTriggered
			};
		}

		return {
			Cell : Cell,
			CellState : CellState,
			CellType : CellType
		};
	}

	angular.module('minesweeper')
		.factory('CellFactory', CellFactory);

})();