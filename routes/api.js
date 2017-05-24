/**
 * Created by Peter on 21/05/2017.
 */

const express = require('express');

const config = require('config');
const mime = require('mime');
module.exports = function(app){
    var router = express.Router();

    router.info = {
        name: "API Index",
        path: "/api/"
    };

    router.get("/:id", function(req, res){
        var id = req.params.id.split(".")[0];
        app.database.getLinkFromID(id, function(err, resp){
           if(err){
               res.header(500).json({err: err});
           } else{
               res.json(resp);
           }
        });
    });


    router.post("/upload", function(req, res){
        if(req.body && req.body.data){
           // var type = req.body.data.substring(5).split(";")[0];
            var type = req.body.type || "image/png";
            if(app.util.validMimeTypes.indexOf(type) > -1){
                app.database.uploadFile(new Buffer(req.body.data, "base64"), type, function(err, resp){
                    res.send(err || config.get("Server.base")+resp+"."+mime.extension(type));
                });
            }else{
                res.header(415).json({err: "Unsupported MIME Type"});
            }
        }else{
            res.header(400).json({err: "Missing field. data is needed."})
        }
    });

    return router;
};