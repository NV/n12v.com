/**
 * @jsx React.DOM
 */


var TemperatureConverter = React.createClass({
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
		return <p className="temperature-converter">
			<label className="celsius-wrap">
				<input type="number" className="celsius" valueLink={celciusValueLink}/>
				C°
			</label>
			<span className="arrows"> ⇄ </span>
			<label className="fahrenheit-wrap">
				<input type="number" className="fahrenheit" valueLink={fahrenheitValueLink}/>
				F°
			</label>
		</p>;
	},
	onCelsiusChange: function(data) {
		this.setState({c: parseFloat(data)})
	},
	onFahrenheitChange: function(data) {
		this.setState({c: f2c(data)})
	}
});

React.renderComponent(
	<TemperatureConverter/>,
	document.getElementById('tm-react')
);
