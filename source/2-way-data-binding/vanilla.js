function c2f(c) {
	return 9/5 * c + 32;
}
function f2c(f) {
	return 5/9 * (f - 32);
}

function c2k(c) {
	return parseFloat(c) + 273.15;
}
function k2c(k) {
	return k - 273.15;
}


var celsius = document.querySelector('#tm-vanilla .celsius');
var fahrenheit = document.querySelector('#tm-vanilla .fahrenheit');
var kelvin = document.querySelector('#tm-vanilla .kelvin');



celsius.oninput = function(e) {
	fahrenheit.value = c2f(e.target.value)
	kelvin.value = c2k(e.target.value)
};

fahrenheit.value = c2f(celsius.value);
fahrenheit.oninput = function(e) {
	celsius.value = f2c(e.target.value)
	kelvin.value = c2k(celsius.value)
};

kelvin.value = c2k(celsius.value);
kelvin.oninput = function(e) {
	celsius.value = k2c(e.target.value);
	fahrenheit.value = c2f(celsius.value)
};
