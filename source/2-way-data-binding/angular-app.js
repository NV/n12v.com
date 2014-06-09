var app = angular.module('temperature-converter', []);

app.directive('converter', function(converters) {
	return {
		require: 'ngModel',
		link: function(scope, element, attr, ngModel) {
			var converter = converters[attr.converter];
			ngModel.$formatters.unshift(converter.formatter);
			ngModel.$parsers.push(converter.parser);
			scope.c = 0;
		}
	};
});

app.value('converters', {
	c2f: {
		formatter: c2f,
		parser: f2c
	}
});
