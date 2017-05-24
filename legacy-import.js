/**
 * Created by Peter on 24/05/2017.
 */


const   fs                = require('fs'),
        config            = require('config'),
        caller_id         = require('caller-id'),
        colors            = require('colors'),
        dateFormat        = require('dateformat'),
        async             = require('async'),
        mime              = require('mime');


var app = {};


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

app.util = require('./modules/util.js')(app);
app.database = require('./modules/database.js')(app);



fs.readdir("/home/www-data/files.unacceptableuse.com/ss", function(err, files){
    console.log("Starting...");
   async.eachSeries(files, function(file, cb){
       console.log("Reading file "+file);
       var fileParts = file.split(".");
       app.database.getLinkFromID(fileParts[0], function(err, resp){
           if(!err && !resp[0] && file != "EDB.apk"){
               fs.readFile("/home/www-data/files.unacceptableuse.com/ss/"+file, function(err, data){

                   console.log("Uploading file "+file);
                   if(fileParts[1]) {
                       app.database.uploadFile(data, {
                           type: mime.lookup(fileParts[1]),
                           id: fileParts[0],
                           name: file
                       }, function (err, resp) {
                           if (err) {
                               console.log("Error on file " + file);
                               console.log(err.code);
                           } else {
                               console.log("Success on " + file);
                           }
                           cb();
                       });
                   }
               });
           }else{
               console.log(file+" already exists");
               cb();
           }
       });

   }, function(){
       console.log("Done!");
   });
});