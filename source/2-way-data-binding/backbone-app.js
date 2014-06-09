var Temperature = Backbone.Model.extend({
	defaults: {
		celsius: 0
	},
	fahrenheit: function(value) {
		if (typeof value == 'undefined') {
			return this.c2f(this.get('celsius'));
		}
		value = parseFloat(value);
		this.set('celsius', this.f2c(value));
	},
	c2f: function(c) {
		return 9/5 * c + 32;
	},
	f2c: function(f) {
		return 5/9 * (f - 32);
	}
});


var TemperatureView = Backbone.View.extend({
	el: document.getElementById('tc-backbone'),
	model: new Temperature(),
	events: {
		'input .celsius': 'updateCelsius',
		'input .fahrenheit': 'updateFahrenheit'
	},
	initialize: function() {
		this.listenTo(this.model, 'change:celsius', this.render);
		this.render();
	},
	render: function() {
		this.$('.celsius').val(this.model.get('celsius'));
		this.$('.fahrenheit').val(this.model.fahrenheit());
	},
	updateCelsius: function(event) {
		this.model.set('celsius', event.target.value);
	},
	updateFahrenheit: function(event) {
		this.model.fahrenheit(event.target.value);
	}
});

new TemperatureView();
