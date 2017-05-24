/**
 * Created by Peter on 21/05/2017.
 */

const config = require('config');
const knex = require('knex')(config.get("Database"));
const crypto = require('crypto');
const mime = require('mime');

module.exports = function (app) {
    return {
        info: {
            name: "Database",
            id: "database"
        },
        getLinkFromID: function getLinkFromID(id, cb) {
            knex.select()
                .from("links")
                .where({id: id})
                .limit(1)
                .asCallback(cb);
        },
        getLinkToView: function getLinkToView(id, cb) {
            knex.select("data.data", "data.type", "data.originalName")
                .from("links")
                .where({'links.id': id})
                .limit(1)
                .innerJoin("data", "links.data", "data.id")
                .asCallback(cb);
        },
        addView: function addView(id, ip, cb){
          knex("views").insert({
                link: id,
                ip: ip
          }).asCallback(cb);
        },
        uploadFile: function uploadFile(file, type, cb) {
            try {
                var md5 = crypto.createHash('md5').update(file).digest("hex");
                knex.raw(knex('data').insert({
                    data: file,
                    hash: md5,
                    type: typeof type == "object" ? type.type : type,
                    originalName: typeof type == "object" ? type.name : "download." + mime.extension('type')
                }).toString().replace(/^insert/i, 'insert ignore')).asCallback(function (err, resp) {
                    if (err || !resp) {
                        console.log("Error during insert data");
                        cb(err);
                    } else {
                        knex("data").select("id").where({hash: md5}).limit(1).asCallback(function (err, resp) {
                            if (err) {
                                console.log("error during select duplicate hash");
                                cb(err);
                            } else {
                                var dataID = resp[0].id;
                                var linkID = typeof type == "object" ? type.id : app.util.generateID();
                                knex("links").insert({
                                    data: dataID,
                                    user: 2, //Anonymous
                                    id: linkID
                                }).asCallback(function (err) {
                                    if (err) {
                                        console.log("Error during insert link");
                                        cb(err);
                                    } else {
                                        cb(null, linkID);
                                    }
                                });
                            }
                        });
                    }
                });
            }catch(e){
                console.log(e);
                cb(e);
            }
        }

    }
};