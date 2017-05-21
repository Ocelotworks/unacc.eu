/**
 * Created by Peter on 21/05/2017.
 */

const config = require('config');
const knex = require('knex')(config.get("Database"));

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
          knex.select("data.data", "data.type")
              .from("links")
              .where({'links.id': id})
              .limit(1)
              .innerJoin("data", "links.data", "data.id")
              .asCallback(cb);
      }
  }
};