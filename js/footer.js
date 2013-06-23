var OPENING_ANIMATION_DURATION = 200;

/**
 * @param {string} path
 * @return {string}
 */
function makeIdForPath(path) {
  return 'article:' + path.replace(/[/]$/, ''); // Must be in sync with templates
}

/**
 * @param {string} path
 * @return {string}
 */
function fragmentUrlForPath(path) {
  return path + 'raw.html';
}



var isFirstCall = true;
$(window).on('popstate', function(event) {
  if (isFirstCall) {
    // popstate event fires on window load, I don’t know why
    isFirstCall = false;
  } else {
    route(location);
  }
});


$('body').on('click', '#title, .entry-link', function(e) {
  if (isPlainClick(e)) {
    e.preventDefault();
    route(this);
    pushState(this);
  }
});


var view = document.body.className.match(/\bview-[^\s]*\b/)[0];
var VIEW = {
  HOME: 'view-home',
  PAGE: 'view-page'
};

//var router = {
//  update: function() {
//  }
//};
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
//    prevArticle.css({
//      top: '',
//      position: ''
//    });
  });
}

var currentTransition = '';


function pageToHome() {}
function homeToPage() {}

function topFold(element) {
  var scrollTop = document.body.scrollTop;
  var top = element.offsetTop - scrollTop;
  return top;
}

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
        setViewImmediately(VIEW.HOME);
        var top = topFold(prev[0]);
        prev.css({
          top: -top + 'px',
          'z-index': 99
        });
        prev.transition({
          top: 0
        }, OPENING_ANIMATION_DURATION, 'out', function() {
          prev.css({
            top: '',
            'z-index': ''
          });
          document.body.scrollTop--; // Force repaint for WebKit and Blink
        });
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

      var inner = more.find('.entry-more-inner');

      if (elements) {
        inner.html(elements);
      }

//      var moreTop = more.offset().top;
      var TITLE_HEIGHT_DIFF = 50; // Difference between small ang big title
      var availableHeight = Math.floor(window.innerHeight - article.height() - TITLE_HEIGHT_DIFF);
      var height = Math.max(0, availableHeight); //Math.min(inner.height(), availableHeight);
      var y = -topFold(article[0]);

      $('body').css('top', Math.min(y + 200, 0));

      var i = 0;

      $('body').transition({
        top: y
      }, OPENING_ANIMATION_DURATION, 'out', allDone);

      if (height) {
        more.css('max-height', 0 /*Math.round((more.height() + height) / 2)*/);
        more.transition({
          'max-height': height
        }, OPENING_ANIMATION_DURATION, 'out', allDone);
      } else {
        allDone();
      }

      function allDone() {
        if (i === 1) {
          if (currentTransition !== VIEW.PAGE) {
            // Happens when we switch back to home page before transition ends
            return;
          }
          setViewImmediately(VIEW.PAGE);
          more.css('max-height', '');
          $('body').css({
            top: '',
            position: ''
          });
          document.body.scrollTop = $('#top').outerHeight();
        } else {
          i++;
        }
      }
    });

  }
}


function articlesHeight(element) {
  console.log.apply(console, element);
  var height = 0;
  element.children('article').each(function() {
    var h = $(this).height();
    height += h;
    console.info('children:', this, h);
  });
  return height;
}


function expandHeight(element, height) {
  var currentHeight = element.height();
  element.removeClass('height-collapse-transition height-collapsed').css({'max-height': currentHeight});
  requestAnimationFrame(function() {
    element.addClass('height-expand-transition').css({'max-height': height});
  });
}

function collapseHeight(element) {
  element.removeClass('height-collapse-transition').addClass('height-before-collapsed');
  requestAnimationFrame(function() {
    element.addClass('height-collapse-transition height-collapsed').removeClass('height-before-collapsed');
  });
}

function unwrapArticles() {
  $('.wrap').each(function() {
    var element = $(this);
    element.after(element.children());
    element.remove();
  });
}

function wrapArticles(articleCurrent) {
  var articles = $('#content article');
  var i = articles.index(articleCurrent);
  var wrap = $('<div class="wrap"/>');
  var list = [];
  var slice;
  if (i !== 0) {
    slice = articles.slice(0, i);
    slice.wrapAll(wrap);
    list.push(slice.eq(0).parent());
  }
  if (i !== articles.length) {
    slice = articles.slice(i + 1);
    slice.wrapAll(wrap);
    list.push(slice.eq(0).parent());
  }
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


function animateShit() {
  var el = document.getElementById('article:/blogging-with-octopress');
  var prev = el.previousElementSibling;
  var t = el.offsetTop - document.body.scrollTop;
  prev.style.height = t + 'px';
  document.body.scrollTop = $('#top').outerHeight();

  requestAnimationFrame(function(){
    $(prev).animate({height: 0}, 200);
    $(el).addClass('article-current');
  });
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



// jQuery, Y U R NO animate 'transform' ?
function animate(elem, name, value) {
  var camelName = jQuery.camelCase(name);
  camelName = vendorPropName(elem.style, camelName);

  var initialValue = elem.style[camelName];
  if (!initialValue) {
    initialValue = value.replace(/-?\d+/g, '0');
    elem.style[camelName] = initialValue;
  }

  jQuery.style(elem, 'transition', camelCaseToHyphens(camelName) + ' 0.2s linear');
  elem.style[camelName] = value;
}


function camelCaseToHyphens(str) {
  return str.replace(/([A-Z])/g, function(str) {
    return '-' + str.toLowerCase()
  });
}

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

  // shortcut for names that are not vendor prefixed
  if ( name in style ) {
    return name;
  }

  var cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
  // check for vendor prefixed names
  var capName = name.charAt(0).toUpperCase() + name.slice(1),
  origName = name,
  i = cssPrefixes.length;

  while ( i-- ) {
    name = cssPrefixes[ i ] + capName;
    if ( name in style ) {
      return name;
    }
  }

  return origName;
}
