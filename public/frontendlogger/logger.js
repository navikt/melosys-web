(function(){
  var context = window.frontendlogger.context ? window.frontendlogger.context : '';
  var apiUrl = context + '/api/logger/';
  var appname = window.frontendlogger.appname;

  function post(path, data) {
    data.url = window.location.href;
    data.userAgent = window.navigator.userAgent;
    data.appname = appname;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl + path, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  function log(level, data) {
    if (typeof data === 'string') {
      data = { message: data };
    }
    post(level, data);
  }

  function reportEvent(name, fields, tags) {
    var data = {
      name: name,
      fields: fields,
      tags: tags
    };

    post('event', data);
  }

  var oldOnError = window.onerror;
  window.onerror = function (message, url, line, column, error) {
    var json = {
      message: message,
      jsFileUrl: url,
      lineNumber: line,
      column: column,
      messageIndexed: message
    };
    if (error) {
      json["stacktrace"] = error.stack ?  error.stack : error;
    }
    post('error', json);
    if (oldOnError) {
      oldOnError.apply(this, arguments);
    }
  };
  window.frontendlogger.info = function(data) { log('info', data); };
  window.frontendlogger.warn = function(data) { log('warn', data); };
  window.frontendlogger.error = function(data) { log('error', data); };
  window.frontendlogger.event = function(name, fields, tags) { reportEvent(name, fields, tags); };
})();
