var http         = require("http"),
    https        = require("https"),
    express      = require("express"),
    validator    = require("express-validator"),
    flash        = require("express-flash"),
    methodOv     = require("method-override"),
    compression  = require("compression"),
    favicon      = require("serve-favicon"),
    morgan       = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser   = require("body-parser"),
    csrf         = require("csurf"),
    helmet       = require("helmet"),
    consolidate  = require("consolidate"),
    session      = require("express-session"),
    redisStore   = require("connect-redis")(session),
    redisDb      = require("redis"),
    path         = require("path"),
    clc          = require('cli-color'),
    fs           = require("fs");
//==================================================================
var env     = process.env.NODE_ENV || 'dev';
var appPath = path.join(__dirname, "app");
var cnfPath = path.join(__dirname, "config", env);
//==================================================================
var app     = express();

app.set('path', {
    app    : appPath,
    config : cnfPath
});

var config  = require(path.join(cnfPath, "config"))(app);
var redis   = redisDb.createClient(config.redis.port, config.redis.host);
var sessionWrapper = session({
    saveUninitialized: true,
    resave: true,
    secret: config.session.secret,
    store: new redisStore({
        client : redis,
        host   : config.redis.host,
        port   : config.redis.port,
        ttl    : config.session.timeout,
        prefix : config.session.prefix
    }),
    cookie : config.session.cookie,
    name   : config.session.name
});
//==================================================================
app.engine(config.view.templateExt, consolidate[config.view.templateEngine]);
app.set('view engine' , config.view.templateExt);
app.set('views'       , path.join(appPath, "views"));

app.use(morgan(config.logger.format||'dev', config.logger.options));

if (env === 'dev') {
    app.set('view cache', false);
} else if (env === 'prod') {
    app.locals.cache = 'memory';
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOv());

app.use(helmet.xframe());
app.use(helmet.xssFilter());
app.use(helmet.nosniff());
app.use(helmet.ienoopen());
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(sessionWrapper);
app.use(validator());
app.use(flash());
app.use(csrf());

app.use(function (req, res, next) {
    res.locals.session = req.session;
    res.locals.url     = req.protocol + '://' + req.headers.host;
    res.locals.csrf    = req.csrfToken();

    if (config.session.checkUser === true) {
        if (!req.session.auth && req.path != '/login') {
            res.redirect('/login');
        }
    }
    next();
});
app.use(compression({
    filter: function(req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 3
}));
require(path.join(cnfPath, "middleware"))(app, config);
require(path.join(cnfPath, "assets"))(app, config);
//==================================================================
var routes = fs.readdirSync(path.join(appPath, "routes", env));
for (var i = 0; i < routes.length; i++) {
    var match = routes[i].match(/\.route\.js/);
    if (match !== null) {
        var rq = path.join(appPath, "routes", env, routes[i]);
        require(rq)(app);
    }
}
//==================================================================
app.use(function(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403);
    res.locals.partials = {layout: '../layout/error'};
    res.render('error/' + (err.status || 500), {
        message : err.message,
        error   : err
    });
});
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.locals.partials = {layout: '../layout/error'};
    res.render('error/' + (err.status || 500), {
        message : err.message,
        error   : env === 'dev' ? err : {}
    });
});
//==================================================================
var server = app;
if (config.https === true) {
    var privateKey  = fs.readFileSync(path.join(cnfPath, 'sslcerts', 'key.pem'), 'utf8');
    var certificate = fs.readFileSync(path.join(cnfPath, 'sslcerts', 'cert.pem'), 'utf8');

    var httpsServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);

    server = httpsServer;
}

var srv = server.listen(config.port, function () {
    console.log(clc.green('<<< Jern server listening on port ') + clc.yellow(config.port));
});
//==================================================================
if (config.socket.enabled) {
    var io = require('socket.io').listen(srv);

    io.use(function (socket, next) {
        sessionWrapper(socket.request, socket.request.res, next);
    });

    var nsp = io.of('/'+config.socket.namespace);
    var socketUsers = 0;

    nsp.on("connection", function (socket) {
        var session = socket.request.session;

        ++socketUsers;
        nsp.emit('socketUsers', socketUsers);

        var sockets = fs.readdirSync(path.join(appPath, "sockets", env));
        for (var i = 0; i < sockets.length; i++) {
            var match = sockets[i].match(/\.socket\.js/);
            if (match !== null) {
                var sp = path.join(appPath, "sockets", env, sockets[i]);
                require(sp)(app, config, nsp, socket, session);
            }
        }

        socket.on('disconnect', function () {
            --socketUsers;
            nsp.emit('socketUsers', socketUsers);
        });
    });
}
