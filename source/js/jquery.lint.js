(function() {

  var jQuery_prototype_find = jQuery.prototype.find;

  jQuery.prototype.find = function(selector) {
    var result = jQuery_prototype_find.call(this, selector);
    if (result.length === 0) {
      console.warn('$.find cannot find ' + JSON.stringify(selector));
    }
    return result;
  };

  var jQuery_prototype_addClass = jQuery.prototype.addClass;

  jQuery.prototype.addClass = function(className) {
    if (className.indexOf('.') !== -1) {
      console.error('dots in className: ' + JSON.stringify(className));
    }
    return jQuery_prototype_addClass.call(this, className);
  };

})();
