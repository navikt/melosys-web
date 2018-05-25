const http = require('http');

export default function request(url) {
  const requestURI = { path: url };
  return new Promise(resolve => {
    http.get(requestURI, response => {
      let data = '';
      response.on('data', _data => (data += _data));
      response.on('end', () => resolve(data));
    });
  });
}
