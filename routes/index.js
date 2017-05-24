/**
 * Created by Peter on 20/05/2017.
 */

const express = require('express');
module.exports = function(app){
    var router = express.Router();

    router.info = {
        name: "Index",
        path: "/"
    };

    router.get("/", function(req, res){
       res.render("index");
    });

    router.get("/:id", function(req, res){
        var id = req.params.id.split(".")[0];
        app.database.getLinkToView(id, function(err, resp){
            if(err){
                res.json(err);
            }else if(resp[0]){
                res.header("Content-Type", resp[0].type);
                res.header("Content-Disposition", (resp[0].type.indexOf("image") === -1 ? "attachment" : "inline") + "; filename="+resp[0].originalName);
                res.send(resp[0].data);
                var ip = req.headers['x-forwarded-for'].split(",")[0] || req.connection.remoteAddress;
                app.database.addView(id, ip,function(err){
                });
            }else{
                res.redirect("removed.png");
            }
        });

    });

    return router;
};