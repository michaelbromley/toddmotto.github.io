((window, document, undefined) => {

  let cache;
  let fetched = false;

  function compile(tmpl) {
    var node = document.createElement('div');
    node.innerHTML = tmpl;
    return node.childNodes[0];
  }

  function getResult(result) {
    return compile([
      '<li>',
        '<a href="' + result.url + '">',
          // the .replace() is an ugly hack right now
          // to remove &amp; before &amp;#58; for example
          // which otherwise will not render colons in the DOM
          result.title.replace(/\&amp\;/, '&'),
        '</a>',
      '</li>'
    ].join(''));
  }

  function destroyResults() {
    if (searchResults.querySelector('li')) {
      searchResults.innerHTML = '';
    }
  }

  function renderResults(results) {
    var docFrag = document.createDocumentFragment();
    results.forEach(result => {
      docFrag.appendChild(getResult(result));
    });
    searchResults.appendChild(docFrag);
  }

  function showNoResults() {
    searchResults.innerHTML = '<li><a href="#">No results. Search for entire words, i.e. "forms"</a></li>'
  }

  function render(collection) {
    destroyResults();
    if (collection.length) {
      renderResults(collection);
    } else {
      showNoResults();
    }
  }

  function filterStore(store, filter) {
    var regexp = new RegExp('\\b' + filter + '\\b', 'gi');
    return store.filter(function(item) {
      return (
        regexp.test(item.title) ?
        item :
        (
          regexp.test(item.content) ?
          item :
          null
        )
      );
    });
  }

  function parse (req) {
    var result;
    try {
      result = JSON.parse(req.responseText);
    } catch (e) {
      result = req.responseText;
    }
    return [result, req];
  };

  function xhr(type, url, data) {
    var methods = {
      success: function () {},
      error: function () {},
      always: function () {}
    };
    var XHR = window.XMLHttpRequest || ActiveXObject;
    var request = new XHR('MSXML2.XMLHTTP.3.0');

    request.open(type, url, true);
    request.setRequestHeader('Content-type', {
      contentType: 'application/x-www-form-urlencoded'
    });
    request.onreadystatechange = function () {
      var req;
      if (request.readyState === 4) {
        req = parse(request);
        if (request.status >= 200 && request.status < 300) {
          methods.success.apply(methods, req);
        } else {
          methods.error.apply(methods, req);
        }
      }
    };
    request.send(data);

    var atomXHR = {
      success: function (callback) {
        methods.success = callback;
        return atomXHR;
      },
      error: function (callback) {
        methods.error = callback;
        return atomXHR;
      }
    };
    return atomXHR;
  };

  var search = document.querySelector('.search');
  var searchInput = search.querySelector('input');
  var searchResults = search.querySelector('ul');

  function isChild(elem, parent) {
    var node = elem.parentNode;
    while (node !== null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function handleOffClick(event) {
    if (!isChild(event.target, search)) {
      destroyResults();
    }
  }

  function handleSearch() {
    var searchValue = searchInput.value;
    if (!searchValue) {
      destroyResults();
      return;
    };
    if (fetched) {
      render(filterStore(cache, searchValue));
      return;
    }
    var request = new xhr('GET', '/posts.json');
    request
      .success(function (response) {
        var filtered = filterStore(response, searchValue);
        render(filtered);
        cache = response;
        fetched = true;
      })
      .error(function (reason) {
        fetched = false;
      });
  }

  searchInput.addEventListener('focus', handleSearch, false);
  searchInput.addEventListener('input', handleSearch, false);
  search.addEventListener('submit', function handleSubmit(event) { event.preventDefault() }, false);
  document.addEventListener('click', handleOffClick, false);

})(window, document);

((window, document, undefined) => {

  const banner = document.querySelector('.courses__out');

  const bindBanner = () => {
    let url = window.location.pathname;
    banner.href = banner.href + url;
  };

  if (banner) {
    bindBanner();
  }

  linkjuice.init('.post__content', {
    selectors: ['h2', 'h3', 'h4', 'h5'],
    contentFn: node => `
      <a href="#${node.id}" class="linkjuice">
        <span class="linkjuice-icon">
          <i class="linkjuice__icon"></i>
        </span>
        ${node.innerHTML}
      </a>
    `
  });

})(window, document);
