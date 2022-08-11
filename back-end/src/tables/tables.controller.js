const service = require("./tables.service");
const { reservationExists } = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/*  
 \  Beginning => Tables Middeware
*/

/*  
\   [User Story 4 Feature]
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
      message: errorMsg,
    });
  }
  return next();
}

/*  
\   [User Story 4 Feature]
*/

async function validReservation(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: "Data is missing.",
    });
  }

  const { reservation_id } = data;
  if (!reservation_id) {
    next({
      status: 400,
      message: "Missing reservation_id.",
    });
  }

  const reservation = await reservationExists(reservation_id);
  if (!reservation) {
    next({
      status: 404,
      message: `Reservation ${reservation_id} cannot be found.`,
    });
  }
  res.locals.reservation = reservation;
  return next();
}

/*  
\   [User Story 4 Feature]
*/

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.tableExists(table_id);

  if (table) {
    res.locals.table = table;
    return next();
  } else {
    next({
      status: 404,
      message: `Table ${table_id} does not exist.`,
    });
  }
}

/*  
\   [User Story 4 Feature]
*/

function tableReqs(_req, res, next) {
  const { reservation_id, capacity } = res.locals.table;

  if (reservation_id) {
    next({
      status: 400,
      message: "Table occupied.",
    });
  } else if (res.locals.reservation.people > capacity) {
    next({
      status: 400,
      message: `Your party exceeds the capacity for this table.`,
    });
  }
  return next();
}

/*  
\   [User Story 5 Feature]
*/

async function isTableOccupied(_req, res, next) {
  if (!res.locals.table.reservation_id) {
    next({
      status: 400,
      message: "Table not occupied.",
    });
  } else {
    return next();
  }
}

/*  
\   [User Story 6 Feature]
*/

function reservationStatus(_req, res, next) {
  if (res.locals.reservation.status === "seated") {
    next({
      status: 400,
      message: `Reservation has already been seated.`,
    });
  } else {
    return next();
  }
}

/*  
 \  End => Tables Middeware
*/

/*  
\   [User Story 4 Feature]
*/

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

/*  
\   [User Story 4 Feature]
*/

async function list(_req, res) {
  const data = await service.list();
  res.json({ data });
}

/*  
\   [User Story 6 Feature]
*/

async function update(_req, res) {
  const data = await service.update({
    reservation_id: res.locals.reservation.reservation_id,
    table_id: res.locals.table.table_id,
  });
  res.json({ data });
}

/*  
\   [User Story 6 Feature]
*/

async function reservationComplete(_req, res) {
  const data = await service.reservationComplete(res.locals.table);
  res.json({ data });
}

module.exports = {
  create: [validateProperties, asyncErrorBoundary(create)],
  list: asyncErrorBoundary(list),
  update: [
    asyncErrorBoundary(validReservation),
    reservationStatus,
    asyncErrorBoundary(tableExists),
    tableReqs,
    asyncErrorBoundary(update),
  ],
  complete: [
    asyncErrorBoundary(tableExists),
    isTableOccupied,
    asyncErrorBoundary(reservationComplete),
  ],
};
