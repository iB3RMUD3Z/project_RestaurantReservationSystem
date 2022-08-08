const knex = require("../db/connection");

/*  
\   [User Story 1 Feature]
 \  Creates => New Reservation
*/

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then(createdRecord => createdRecord[0]);
}

/*  
\   [User Story 1 Feature]
 \  Lists => Reservations For Date => By Time
*/

function list(date) {
    return knex("reservations")
      .select("*")
      .where({ reservation_date: date })
      .whereNot({ status: "finished" })
      .orderBy("reservation_time");
  }

/*  
\   [User Story 4 Feature]
 \  Lists => Reservations For Date => By Time
*/

function reservationExists(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();
}

function update(reservationId, updatedStatus) {
  return knex("reservations")
    .select("status")
    .where({ reservation_id: reservationId })
    .update(updatedStatus, "*")
    .then(updatedRecord => updatedRecord[0]);
}

  module.exports = {
    create,
    list,
    reservationExists,
    update
  };