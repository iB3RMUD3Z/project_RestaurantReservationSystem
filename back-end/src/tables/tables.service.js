const knex = require("../db/connection");

/*  
\   [User Story 4 Feature]
*/

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecord) => createdRecord[0]);
}

/*  
\   [User Story 4 Feature]
*/

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

/*  
\   [User Story 4 Feature]
*/

function tableExists(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

/*  
\   [User Story 6 Feature]
*/

async function update({ reservation_id, table_id }) {
  const trx = await knex.transaction();
  return trx("reservations")
    .where({ reservation_id })
    .update({ status: "seated" }, "*")
    .then(() =>
      trx("tables")
        .where({ table_id })
        .update({ reservation_id }, "*")
        .then((updatedTable) => updatedTable[0])
    )
    .then(trx.commit)
    .then(() => updatedTable)
    .catch(trx.rollback);
}

/*  
\   [User Story 6 Feature]
*/

async function reservationComplete({ reservation_id, table_id }) {
  const trx = await knex.transaction();
  return trx("reservations")
    .where({ reservation_id })
    .update({ status: "finished" })
    .then(() =>
      trx("tables")
        .where({ table_id })
        .update({ reservation_id: null }, "*")
        .then((updatedTable) => updatedTable[0])
    )
    .then(trx.commit)
    .then(() => updatedTable)
    .catch(trx.rollback);
}

module.exports = {
  create,
  list,
  tableExists,
  update,
  reservationComplete,
};
