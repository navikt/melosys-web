var express = require('express');
var _ = require('underscore');
var app = express();
var bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const os = require('os');

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3002;
var router = express.Router();

router.post('/henvendelse', function(req, res) {
  console.log('henvendelse POST');
  console.log('content-type', req.get('content-type'));
  console.log('henvendelse',req.body);
  res.json({message:'GOT a POST request:'+JSON.stringify(req.body)})
});

router.get('/saksopplysninger/:fnr', function (req, res) {
  try {
    var fnr = req.params.fnr;
    const data = JSON.parse(fs.readFileSync("./scripts/mock_data/saksopplysninger.json", "utf8"));
    const saksopplysning = _.find(data.response, function(item){
      return item.person.fnr === fnr;
    });
    return res.json(saksopplysning);
  } catch (err) {
    console.log(err)
  }
});

router.get('/saksbehandler', function (req, res) {
  try {
    var saksbehandlere =  JSON.parse(fs.readFileSync("./scripts/mock_data/saksbehandler.json", "utf8"))
    // return a random sakbehandler from list of sakbehandlere
    return res.json(_.sample(saksbehandlere));
  } catch (err) {
    console.log(err)
  }
});

app.use(allowCrossDomain);
app.use('/vedtak/api', router);
app.use('/api', router);

app.listen(port);
let interfaces = os.networkInterfaces();
//console.log(interfaces.Ethernet0);
let ipv4 = _.find(interfaces.Ethernet0, function(item){
  return item.family === 'IPv4';
});

console.log('Test MeloSys mock API server running on http://'+ipv4.address+':' + port+'/api');
