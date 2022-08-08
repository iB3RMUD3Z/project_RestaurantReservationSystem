const knex = require("../db/connection");

/*  
\   [User Story 4 Feature]
 \  Creates => New Table
*/

function create(table) {
    return knex("tables")
      .insert(table)
      .returning("*")
      .then(createdRecord => createdRecord[0]);
  }

  /*  
\   [User Story 4 Feature]
 \  Lists => Tables => By Table Name
*/

function list() {
    return knex("tables")
      .select("*")
      .orderBy("table_name");
  }

  /*  
\   [User Story 4 Feature]
 \  Validate => Reservations For Date => By Time
*/

function tableExists(table_id) {
  return knex("tables")
    .select("*")
    .where({ table_id })
    .first();
}

async function update({ reservation_id, table_id }) {
  const trx = await knex.transaction();
  let updatedTable = {};
  return trx("reservations")
    .where({ reservation_id })
    .update({ status: "seated" }, "*")
    .then(() =>
      trx("tables")
        .where({ table_id })
        .update({ reservation_id }, "*")
        .then((results) => (updatedTable = results[0]))
    )
}

  module.exports = {
    create,
    list,
    tableExists,
    update
  };