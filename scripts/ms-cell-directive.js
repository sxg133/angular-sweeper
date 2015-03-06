(function() {

	function msCell(CellFactory) {

		function link(scope, element, attrs) {

			var cell = scope.cell;

			scope.$watch('cell.getState()', function(newValue, oldValue) {
				switch (newValue) {
					case CellFactory.CellState.REVEALED:
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