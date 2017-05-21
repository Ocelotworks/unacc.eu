/**
 * Created by Peter on 21/05/2017.
 */

const express = require('express');
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

    return router;
};