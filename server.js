const express = require('express');
const bodyparser = require('body-parser');
const pug = require('pug');
const util = require('util');
const entities = require('entities');

const log = require('./lib/log');
const typeset = require('./lib/typeset.js');

const SERVER = process.env.SERVER || '127.0.0.1';
const PORT = process.env.PORT || '8080';
const SLACK_AUTH_TOKEN = process.env.SLACK_AUTH_TOKEN || 'none';
const SLACK_AUTH_TOKENS = (process.env.SLACK_AUTH_TOKENS || '').split(";").map(x => x.trim()).filter(x => !!x);
const SLACK_TRIGGER = (process.env.SLACK_TRIGGER || '!latex').trim();

function cleanRequestString(requestString) {
  requestString = (requestString || '').trim();
  if (requestString.toLowerCase().substr(0, SLACK_TRIGGER.length) === SLACK_TRIGGER.toLowerCase()) {
    requestString = requestString.substr(SLACK_TRIGGER.length)
  }
  return requestString.trim();
}

// Install the routes.
const router = express.Router();
router.get('/', function(req, res) {
  res.json(['Hello', 'World', {underDevelopment: true}]);
});

router.post('/command', function(req, res) {
  var requestString = req.body.text;
  requestString = cleanRequestString(requestString);
  log.info('Request (POST /command):',requestString);
  var typesetPromise = typeset.typeset(requestString,'');
  if (typesetPromise === null) {
    res.send('no text found to typeset');
    res.end(); // Empty 200 response -- no text was found to typeset.
    return;
  }
  var promiseSuccess = function(mathObjects) {
    var locals = {'mathObjects': mathObjects,
                  'serverAddress': util.format('https://%s:%s/', SERVER, PORT)};
    var htmlResult = pug.renderFile('./views/slack-response.pug', locals);
    res.json({
      response_type: 'in_channel',
      text: requestString,
      attachments: [
        {
          fallback: requestString,
          image_url: htmlResult,
        },
      ],
    });
    res.end();
  };
  var promiseError = function(error) {
    log.info('Error in typesetting:');
    log.info(error);
    res.end(); // Empty 200 response.
  };
  typesetPromise.then(promiseSuccess, promiseError);
});

router.post('/typeset', function(req, res) {

  if ((req.body.token !== SLACK_AUTH_TOKEN) && (SLACK_AUTH_TOKENS.indexOf(req.body.token || 'none') === -1))
  {
    log.warn('Unrecognized or no token:', req.body.token);
    res.status(401).send();
    return;
  }

  var requestString = entities.decode(req.body.text);
  requestString = cleanRequestString(requestString);

  log.info('Request (POST /typeset):', requestString);

  var typesetPromise = typeset.typeset(requestString);
  if (typesetPromise === null) {
    res.send('no text found to typeset');
    res.end(); // Empty 200 response -- no text was found to typeset.
    return;
  }
  var promiseSuccess = function(mathObjects) {
    var locals = {'mathObjects': mathObjects,
                  'serverAddress': SERVER!='127.0.0.1' ? util.format('http://%s:%s/', SERVER, PORT) : 'http://'+req.headers.host+'/' };
    var htmlResult = pug.renderFile('./views/slack-response.pug', locals);
    res.json({'text' : htmlResult});
    res.end();
  };
  var promiseError = function(error) {
    log.info('Error in typesetting:');
    log.info(error);
    res.end(); // Empty 200 response.
  };
  typesetPromise.then(promiseSuccess, promiseError);
});

router.post('/slashtypeset', function(req, res) {
  var requestString = entities.decode(req.body.text);
  requestString = cleanRequestString(requestString);
  log.info('Request (POST /slashtypeset):', requestString);
  var typesetPromise = typeset.typeset(requestString,'');
  if (typesetPromise === null) {
    res.send('no text found to typeset');
    res.end(); // Empty 200 response -- no text was found to typeset.
    return;
  }
  var promiseSuccess = function(mathObjects) {
    var locals = {'mathObjects': mathObjects,
                  'serverAddress': SERVER!='127.0.0.1' ? util.format('http://%s:%s/', SERVER, PORT) : 'http://'+req.headers.host+'/' };
    res.json({
      response_type: 'in_channel',
      text: requestString,
      attachments: [
        {
          fallback: requestString,
          image_url: 'http://' + SERVER + ':' + PORT + '/' + mathObjects[0].output,
        },
      ],
    });
    res.end();
  };
  var promiseError = function(error) {
    log.info('Error in typesetting:');
    log.info(error);
    res.end(); // Empty 200 response.
  };
  typesetPromise.then(promiseSuccess, promiseError);
});


// Start the server.
var app = express();

app.disable('x-powered-by');
app.use( (req,res,next) => {
  res.header('X-Powered-By','Love');
  next();
});
app.use(log.middleware);
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use('/static', express.static('static'));
app.use('/', router);

app.listen(PORT);
log.info(`Mathslax is listening at http://${SERVER}:${PORT}/`);
log.info(`... using token (${SLACK_AUTH_TOKEN}) or tokens (${SLACK_AUTH_TOKENS})`);
log.info(`... using trigger: ${SLACK_TRIGGER}`);
// log.info('Make a test request with something like:');
// log.info(`curl -v -X POST ${SERVER}:${PORT}/typeset --data ` +
//             '\'{"text": "f(x) = E_0\\frac{x^2}{sin(x)}", "token": "none"}\' ' +
//             '-H "Content-Type: application/json"');
console.log("");
console.log('Make a test request with something like:');
console.log(`curl -v -X POST ${SERVER}:${PORT}/typeset --data ` +
            `\'{"text": "f(x) = E_0\\\\frac{x^2}{sin(x)}", "token": "${SLACK_AUTH_TOKENS[0] || SLACK_AUTH_TOKEN}"}\' ` +
            '-H "Content-Type: application/json"');
console.log("");
log.info('****************************************');
