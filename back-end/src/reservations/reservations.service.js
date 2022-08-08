const knex = require("../db/connection");

/*  
\   [User Story 1 Feature]
*/

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecord) => createdRecord[0]);
}

/*  
\   [User Story 1 Feature]
*/

function list(date) {
  return (
    knex("reservations")
      .select("*")
      .where({ reservation_date: date })
      /*  
\   [User Story 6 Feature]
*/
      .whereNot({ status: "finished" })
      .orderBy("reservation_time")
  );
}

/*  
\   [User Story 4 Feature]
*/

function reservationExists(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id }).first();
}

/*  
\   [User Story 6 Feature]
*/

function update(update) {
  return knex("reservations")
    .select("status")
    .where({ reservation_id: update.reservation_id })
    .update(update, "*")
    .then((updatedTable) => updatedTable[0]);
}

/*  
\   [User Story 7 Feature]
*/

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  create,
  list,
  reservationExists,
  update,
  search,
};
