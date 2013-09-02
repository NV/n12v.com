(function() {

var OPENING_ANIMATION_DURATION = 200;

/**
 * @param {string} path
 * @return {string}
 */
function fragmentUrlForPath(path) {
	return path + 'raw.html';
}


var isFirstCall = true;
$(window).on('popstate', function() {
	if (isFirstCall) {
		// popstate event fires on window load, I don’t know why
		isFirstCall = false;
	} else {
		route(location);
		onLocationChange();
	}
});


$('body').on('click', '#title, .entry-link', function(e) {
	if (isPlainClick(e)) {
		e.preventDefault();
		route(this);
		pushState(this);
		onLocationChange();
	}
});

function onLocationChange() {
	if (window.ga && !window.DEBUG) {
		ga('send', 'pageview');
	}
}


var view = document.body.className.match(/\bview-[^\s]*\b/)[0];
var VIEW = {
	HOME: 'view-home',
	PAGE: 'view-page'
};


function collapsePreviousArticle() {
	var prevArticle = $('.article-current');
	if (prevArticle.length === 0) {
		return;
	}
	var more = prevArticle.find('.entry-more');
	var excerptHeight = prevArticle.find('.entry-title').outerHeight() + prevArticle.find('.entry-excerpt').outerHeight();
	var startHeight = window.innerHeight - excerptHeight;
	more.css('height', startHeight + 'px');

	prevArticle.removeClass('article-current');
	more.transition({
		height: 0
	}, OPENING_ANIMATION_DURATION, 'in', function() {
		more.css('height', '');
	});
}

var currentTransition = '';


/**
 * @param {Location|HTMLAnchorElement} link
 */
function route(link) {
	if (link.pathname === '/') {
		currentTransition = VIEW.HOME;

		fetch(link.href, function fetchedHome(elements) {
			if (elements) {
				var newContent = elements.filter('#content');
				mergeArticles($('#content'), newContent);
				$('#about').append(elements.filter('#services'));
			}

			var prev = $('.article-current');
			if (prev.length) {
				setView(VIEW.HOME);
				collapsePreviousArticle();
			}
		});

	} else {
		currentTransition = VIEW.PAGE;

		collapsePreviousArticle();
		var article = findArticleByPath(link.pathname);
		article.addClass('article-current');
		var more = article.find('.entry-more');
		more.css('max-height', 0);
	
		fetch(link.href, function fetchedPage(elements) {

			if (elements) {
				more.html(elements);
			}

			var articleHeight = article.height();
			var windowHeight = window.innerHeight;

			var availableHeight = Math.floor(windowHeight - articleHeight);
			var height = Math.max(0, availableHeight); //Math.min(inner.height(), availableHeight);
			var y = article[0].offsetTop;

			var i = 0;

			$('body').animate({
				scrollTop: y
			}, OPENING_ANIMATION_DURATION, 'swing', allDone);

			if (height) {
				more.css('max-height', 0);
				more.transition({
					'max-height': height
				}, OPENING_ANIMATION_DURATION, 'out', allDone);
			} else {
				allDone();
			}

			function allDone() {
				if (i === 1) {
					if (currentTransition !== VIEW.PAGE) {
						// Happens when we switch back to the home page before transition ends
						return;
					}
					var next = $('.article-current').nextAll('article');

					var once = false;

					function allCollapsed() {
						if (once) {
							return;
						}
						once = true;
						setViewImmediately(VIEW.PAGE);
						document.body.scrollTop = $('#top').outerHeight();
						next.css('opacity', '');

						requestAnimationFrame(loadDisqus);
					}

					if (next.length == 0) {
						allCollapsed();
					} else {
						next.transition({
							opacity: 0
						}, OPENING_ANIMATION_DURATION, 'linear', allCollapsed);
					}

					more.css('max-height', '');
				} else {
					i++;
				}
			}
		});

	}
}


if (view === VIEW.PAGE) {
	loadDisqus();
}

function loadDisqus() {
	var disqus_thread = document.getElementById('disqus_thread');
	if (disqus_thread) {
		disqus_thread.parentNode.removeChild(disqus_thread);
	}
	var current = $('.article-current .entry-more');
	current.append('<div id="disqus_thread"/>');

	function canonicalURL() {
		return 'http://n12v.com' + location.pathname;
	}

	//window.disqus_identifier = location.pathname;
	window.disqus_url = canonicalURL();
	if (window.DISQUS) {
		DISQUS.reset({
			reload: true,
			config: function () {
				//this.page.identifier = canonicalURL();
				this.page.url = canonicalURL();
			}
		});
	} else {
		var disqus_shortname = 'n12v';
		var dsq = document.createElement('script');
		dsq.async = true;
		dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
		document.body.appendChild(dsq);
	}
}


/**
 * Must be in sync with templates
 * @param {string} path
 * @return {string}
 */
function makeIdForPath(path) {
	if (path[0] === '/') {
		path = path.slice(1);
	}
	if (path.slice(-1) === '/') {
		path = path.slice(0, -1);
	}
	path = path.replace(/[^a-z0-9_-]/gi, '_');
	return 'article_' + path;
}


/**
 * @param {string} path
 * @return {Element}
 */
function findArticleByPath(path) {
	var id = makeIdForPath(path);
	var element = document.getElementById(id);
	if (!element) {
		throw "Cannot find #" + id;
	}
	return $(element);
}


/**
 * @param {string} path
 */
function pushState(path) {
	history.pushState({prev: location.pathname}, '', path);
}


var cache = {};
cache[location.href] = document.title;


/**
 * @param {string} url
 * @param {function} success
 */
function fetch(url, success) {
	function fetched(elements) {
		//setTimeout(function() {
			document.title = cache[url];
			success(elements);
		//}, 200);
	}

	if (cache.hasOwnProperty(url)) {
		fetched(null);
		return;
	}

	var fragmentURL = fragmentUrlForPath(url);

	$.ajax(fragmentURL, {
		type: 'GET',
		dataType: 'html'
	}).done(function(data) {

		var title = '';
		var elements = $(data).filter(function(i, node) {
			if (node.tagName == 'TITLE') {
				title = node.firstChild.data;
				return false;
			}
			return node.nodeType != Node.TEXT_NODE;
		});

		cache[url] = title;

		fetched(elements);

	}).fail(function(data, a) {

		console.warn('Fail', data, a, this);
		location.assign(url);

	});
}


var onComplete = null;

/**
 * @param {string} path
 */
function setView(newView) {
	if (newView === view) {
		return;
	}

	var progressClass = newView + '-progress';
	var doneClass = newView + '-done';

	if (onComplete) {
		onComplete();
	}

	$('body')
		.removeClass(view).removeClass(view + '-done')
		.addClass(newView).addClass(progressClass);

	onComplete = function() {
		$('body').removeClass(progressClass).addClass(doneClass);
		clearTimeout(timeoutId);
		timeoutId = 0;
		onComplete = null;
	};

	var timeoutId = setTimeout(onComplete, OPENING_ANIMATION_DURATION);

	view = newView;
}

function setViewImmediately(newView) {
	if (newView === view) {
		console.warn('Same view', newView);
		return;
	}
	if (onComplete) {
		onComplete();
	}
	$('body')
		.removeClass(view).removeClass(view + '-done')
		.addClass(newView).addClass(newView + '-done');
	view = newView;
}


function mergeArticles(oldContent, newContent) {
	var current = null;
	var newArticles = newContent.children('article');
	for (var i = 0; i < newArticles.length; i++) {
		var newArticle = newArticles.eq(i);
		var id = newArticle.attr('id');
		var oldArticle = oldContent.find(escapeId(id));
		if (oldArticle.length === 0) {
			if (current) {
				current.after(newArticle);
			} else {
				oldContent.prepend(newArticle);
			}
			current = newArticle;
		} else {
			current = oldArticle;
		}
	}
}


/**
 * @see http://docs.jquery.com/Frequently_Asked_Questions#How_do_I_select_an_element_by_an_ID_that_has_characters_used_in_CSS_notation.3F
 */
function escapeId(id) {
	return '#' + id.replace(/([:./])/g,'\\$1');
}


function isPlainClick(event) {
	var link = event.target;

	// Ignore self-links
	if (link.toString() === location.toString())
		return false;

	// Middle click, cmd click, and ctrl click should open
	// links in a new tab as normal.
	if (event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
		return false;

	// Ignore cross origin links
	if (location.protocol !== link.protocol || location.host !== link.host)
		return false;

	// Ignore anchors on the same page
	if (link.hash && link.href.replace(link.hash, '') === location.href.replace(location.hash, ''))
		return false;

	// Ignore empty anchor "foo.html#"
	if (link.href === location.href + '#')
		return false;

	return true;
}


})();

