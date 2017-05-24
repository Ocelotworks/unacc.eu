const   express           = require('express'),
        path              = require('path'),
        favicon           = require('serve-favicon'),
        cookieParser      = require('cookie-parser'),
        bodyParser        = require('body-parser'),
        config            = require('config'),
        caller_id         = require('caller-id'),
        colors            = require('colors'),
        dateFormat        = require('dateformat'),
        async              = require('async');


var app = express();


app.errorCount = 0;
app.requestCount = 0;

/**
 * Log a message
 * @param {string} message
 * @param {object} [caller]
 */
app.log = function log(message, caller){
    if(!caller)
        caller = caller_id.getData();
    var file = ["Nowhere"];
    if(caller.filePath)
        file = caller.filePath.split("/");

    var origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

    var output = origin+message;
    console.log(`[${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`+output);
};

/**
 * Log an error
 * @param {string} message
 */
app.error = function error(message){
    app.log(message.red, caller_id.getData());
    app.errorCount++;
};

app.load = function load(){
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');
    app.set('view options', { layout: 'layout', app: config.get("Server.name"), base: config.get("Server.base")});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false , limit: '50mb'}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));


    app.log("Loading Modules...");
    async.eachSeries(config.get("Modules"), function loadModules(moduleFile, cb){
        var module = require(moduleFile)(app);
        if(!module.info){
            app.log(`Warning: Attempted to load invalid module: ${module}`);
        }else{
            app.log(`Loading module ${module.info.name}...`);
            app[module.info.id] = module;
        }
        cb();
    });

    app.log("Initialising routes...");
    async.eachSeries(config.get("Routes"), function loadRoutes(routeFile, cb){
        var route = require(routeFile)(app);
        if(!route.info){
            app.log(`Warning: Attempted to load invalid route: ${route}`);

        }else{
            app.log(`Loading route ${route.info.name} at ${route.info.path}...`);
            app.use(route.info.path, route);
        }
        cb();
    });


// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found ');
        console.log(req);
        err.status = 404;
        next(err);
    });

// error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
};


// setInterval(function(){
//     console.log(app.util.generateID());
// }, 1000);


module.exports = app;
