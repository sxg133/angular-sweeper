(function() {

	function msCell(CellFactory) {

		function link(scope, element, attrs) {
			scope.$watch('state()', function(newValue, oldValue) {
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
				state: '&',
				type: '&'
			},
			link: link
		};
	}

	angular.module('minesweeper')
		.directive('msCell', ['CellFactory', msCell]);

})();