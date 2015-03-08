(function() {

	function msCell(CellFactory) {

		function link(scope, element, attrs) {

			var cell = scope.cell;

			scope.$watch('cell.getState()', function(newValue, oldValue) {
				switch (newValue) {

					case CellFactory.CellState.REVEALED:
						element.addClass('revealed');

						if (cell.getType() === CellFactory.CellType.BLANK) {
							var mineCount = cell.getMineCount();
							if (mineCount > 0) {
								element.html(mineCount);
								element.addClass('m' + mineCount);
							}
						} else if (cell.getType() === CellFactory.CellType.MINE) {
							element.html('X');
							element.addClass('bomb');
							if (cell.isTriggered()) {
								element.addClass('triggered');
							}
						}

						break;

					case CellFactory.CellState.FLAGGED:
						element.html('F');
						break;

					default:
						element.html('');
						break;
				}
			});
		}

		return {
			restrict: 'E',
			scope: {
				cell: '='
			},
			link: link
		};
	}

	angular.module('minesweeper')
		.directive('msCell', ['CellFactory', msCell]);

})();