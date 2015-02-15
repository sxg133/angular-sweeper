(function() {
	angular.module('minesweeper', []);

	function msRightClick($parse) {
		function link(scope, element, attrs) {
			var fn = $parse(attrs.msRightClick);
			element.on('contextmenu', function(event) {
				scope.$apply(function() {
					fn(scope, {$event:event});
				});
			});
		}

		return {
			restrict: 'A',
			link: link
		}
	}

	angular.module('minesweeper')
		.directive('msRightClick', msRightClick);
})();