const express = require('express');
const _ = require('underscore');
const app = express();
const bodyParser = require('body-parser');

const fs = require('fs');
//const path = require('path');
const os = require('os');

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const port = process.env.PORT || 3002;
const router = express.Router();

router.post('/henvendelse', function(req, res) {
  console.log('henvendelse POST');
  console.log('content-type', req.get('content-type'));
  console.log('henvendelse',req.body);
  res.json({message:'GOT a POST request:'+JSON.stringify(req.body)})
});

router.get('/nyesaker/:fnr', function (req, res) {
  try {
    const fnr = req.params.fnr.toString();
    const nyesaker = JSON.parse(fs.readFileSync("./scripts/mock_data/nyesaker.json", "utf8"));
    const sak = _.filter(nyesaker, function(item){
      return item.fnr === fnr;
    });

    if (sak && sak.length) {
      return res.json(sak);
    }
    else {
      return res.status(404).send("Not found");
    }
  } catch (err) {
    res.status(500).send(err);
    console.log(err)
  }
});

router.get('/tidligeresaker/:brukernavn', function (req, res) {
  try {
    const brukernavn = req.params.brukernavn;
    const tidligeresaker = JSON.parse(fs.readFileSync("./scripts/mock_data/tidligere-saker-under-behandling.json", "utf8"));
    const data = _.find(tidligeresaker, function(item){
      return item.brukernavn === brukernavn;
    });

    if (data && data.saker.length) {
      return res.json(data.saker);
    }
    else {
      return res.status(404).send("Not found");
    }
  } catch (err) {
    res.status(500).send(err);
    console.log(err)
  }
});

router.get('/saksopplysninger/:fnr', function (req, res) {
  try {
    const fnr = req.params.fnr;
    const data = JSON.parse(fs.readFileSync("./scripts/mock_data/saksopplysninger.json", "utf8"));
    const saksopplysning = _.find(data.response, function(item){
      return item.person.fnr === fnr;
    });

    if (saksopplysning) {
      return res.json(saksopplysning);
    }
    else {
      return res.status(404).send("Not found");
    }
  } catch (err) {
    res.status(500).send(err);
    console.log(err)
  }
});

router.get('/saksbehandler', function (req, res) {
  try {
    const saksbehandlere =  JSON.parse(fs.readFileSync("./scripts/mock_data/saksbehandler.json", "utf8"));
    // return a random sakbehandler from list of sakbehandlere
    return res.json(_.sample(saksbehandlere));
  } catch (err) {
    console.log(err)
  }
});

app.use(allowCrossDomain);
app.use('/system/melosys/api', router);
app.use('/api', router);

app.listen(port);

function platformNIC() {
  const interfaces = os.networkInterfaces();
  switch (process.platform) {
    case 'darwin':
      return interfaces.lo0;
    default: //win32
      return interfaces.Ethernet0
  }
}

function getIpAdress() {
  const nic = platformNIC();
  const ipv4 = _.find(nic, function(item){
    return item.family === 'IPv4';
  });
  return ipv4.address;
}


console.log('Test MeloSys mock API server running on http://'+getIpAdress()+':' + port+'/api');
