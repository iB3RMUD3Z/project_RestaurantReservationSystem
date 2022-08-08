const service = require("./tables.service");
const { reservationExists } = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/*  
 \  Beginning => Reservations Middeware
*/

function validateProperties(req, _res, next) {
  const { data: { table_name, capacity } = {} } = req.body;
  let errorMsg;

  if (!req.body.data) errorMsg = "No data found.";
  else if (!table_name || table_name.length <= 1)
    errorMsg = "A table_name longer than 1 character is REQUIRED.";
  else if (!capacity || typeof capacity !== "number")
    errorMsg = "A table capacity of 1 or more is REQUIRED.";

  if (errorMsg) {
    next({
      status: 400,
      message: errorMsg
    });
  }
  return next();
}

async function validReservation(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: "Data is missing."
    });
  }

  const { reservation_id } = data;
  if (!reservation_id) {
    next({
      status: 400,
      message: "Missing reservation_id."
    });
  }

  const reservation = await reservationExists(reservation_id);
  if (!reservation) {
    next({
      status: 404,
      message: `Reservation ${reservation_id} cannot be found.`
    });
  }
  res.locals.reservation = reservation;
  return next();
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.tableExists(table_id);

  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table ${table_id} does not exist.`
  });
}

function tableReqs(_req, res, next) {
  const { table_id, capacity, reservation_id } = res.locals.table;

  if (reservation_id) {
    next({
      status: 400,
      message: "Table occupied."
    });
  } else if (res.locals.reservation.people > capacity) {
    next({
      status: 400,
      message: `Your party exceeds the capacity for table ${table_id}.`
    });
  }
  return next();
}

function isTableOccupied(_req, res, next) {
  if (!res.locals.table.reservation_id) {
    next({
      status: 400,
      message: "Table not occupied."
    });
  }
  return next();
}

function reservationStatus(_req, res, next) {
  if (res.locals.reservation.status === "seated") {
    next({
      status: 400,
      message: `Reservation ${reservation_id} has already been seated.`
    });
  }
  return next();
}

/*  
 \  End => Tables Middeware
*/

/*  
\   [User Story 4 Feature]
 \  Creates => New Table
*/

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

/*  
  \   [User Story 4 Feature]
   \  Lists => Tables
  */

async function list(_req, res) {
  const data = await service.list();
  res.json({ data });
}

function update(_req, res) {
  res.status(200);
}

module.exports = {
  create: [validateProperties, asyncErrorBoundary(create)],
  list: asyncErrorBoundary(list),
  update: [
    asyncErrorBoundary(validReservation),
    reservationStatus,
    asyncErrorBoundary(tableExists),
    tableReqs,
    update
  ],
  read: asyncErrorBoundary(tableExists),
  complete: [asyncErrorBoundary(tableExists), isTableOccupied]
};
