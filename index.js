require('./const');
var u = require('underscore');
var path = require('path');
var Lighter = require('nodejs-lighter');
var config = require('./config.json');
var bodyParser = require('body-parser');
var session = require('express-session');
var middlewares =require('./middlewares');
var guid = require('guid');

var lighter = new Lighter(config);
var logger = lighter.logger;
var middlewares = u.extend(lighter.middlewares, middlewares);
var handlers = require('./handlers');

lighter.use(middlewares.contextCreator(config));
lighter.use(middlewares.logger(logger));
lighter.use(bodyParser.json());
lighter.set('views', path.join(__dirname, 'views'));
lighter.set('view engine', 'html');
lighter.set("view options",{"layout":false});
lighter.set('trust proxy', 1); // trust first proxy
lighter.engine('html', require('ejs').renderFile);
lighter.use(lighter.express.static(path.join(__dirname, 'public')));
lighter.use(session({
        secret: 'abovegem*&%;%Ndank1'
    })
);
require('./routers')(lighter, middlewares, handlers);

lighter.get('/service-status', function (req, res) {
    req.context.logger.info('getting /status');
    res.send(200, 'ok');
});

lighter.use(middlewares.responder);

lighter.run();
