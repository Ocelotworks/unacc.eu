/**
 * Created by Peter on 21/05/2017.
 */

const config = require('config');
const knex = require('knex')(config.get("Database"));
const crypto = require('crypto');

module.exports = function(app){
  return {
      info: {
          name: "Database",
          id: "database"
      },
      getLinkFromID: function getLinkFromID(id, cb){
          knex.select()
              .from("links")
              .where({id: id})
              .limit(1)
              .asCallback(cb);
      },
      getLinkToView: function getLinkToView(id, cb){
          knex.select("data.data", "data.type", "data.originalName")
              .from("links")
              .where({'links.id': id})
              .limit(1)
              .innerJoin("data", "links.data", "data.id")
              .asCallback(cb);
      },
      uploadFile: function uploadFile(file, type, cb){
          var md5 = crypto.createHash('md5').update(file).digest("hex");
          knex("data").insert({
              data: file,
              hash: md5,
              type: type
          }).asCallback(function(err, resp){
             console.log(resp);
          });
      }

  }
};