var TemperatureConverter = React.createClass({displayName: 'TemperatureConverter',
	getInitialState: function() {
		return {c: 0}
	},
	render: function() {
		var celciusValueLink = {
			value: this.state.c.toString(),
			requestChange: this.onCelsiusChange
		};
		var fahrenheitValueLink = {
			value: c2f(this.state.c).toString(),
			requestChange: this.onFahrenheitChange
		};
		return React.DOM.p( {className:"temperature-converter"},
			React.DOM.label( {className:"celsius-wrap"},
				React.DOM.input( {type:"number", className:"celsius", valueLink:celciusValueLink}),
				"C°"
			),
			React.DOM.span( {className:"arrows"},  " ⇄ " ),
			React.DOM.label( {className:"fahrenheit-wrap"},
				React.DOM.input( {type:"number", className:"fahrenheit", valueLink:fahrenheitValueLink}),
				"F°"
			)
		);
	},
	onCelsiusChange: function(data) {
		this.setState({c: parseFloat(data)})
	},
	onFahrenheitChange: function(data) {
		this.setState({c: f2c(data)})
	}
});

React.renderComponent(
	TemperatureConverter(null),
	document.getElementById('tm-react')
);
