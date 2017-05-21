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
       res.send("It Worked!");
    });

    router.get("/:id", function(req, res){
        var id = req.params.id.split(".")[0];
        app.database.getLinkToView(id, function(err, resp){
            if(err){
                res.json(err);
            }else if(resp[0]){
                res.header("Content-Type", resp[0].type);
                res.send(resp[0].data);
            }else{
                res.redirect("removed.png");
            }
        });
    });

    return router;
};