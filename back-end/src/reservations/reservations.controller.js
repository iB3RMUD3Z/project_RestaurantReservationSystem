const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/*  
 \  Beginning => Reservations Middeware
*/

function validateProperties(req, _res, next) {
  const {
    data: {
      first_name,
      last_name,
      mobile_number,
      people,
      reservation_date,
      reservation_time,
      status
    } = {}
  } = req.body;

  let errorMsg;

  if (!req.body.data) errorMsg = "No data found.";
  else if (!first_name) errorMsg = "first_name is REQUIRED for reservations.";
  else if (!last_name) errorMsg = "last_name is REQUIRED for reservations";
  else if (!mobile_number)
    errorMsg = "mobile_number is REQUIRED for reservations.";
  else if (!people || typeof people !== "number")
    errorMsg = "Number of people in your party is REQUIRED for reservations.";
  else if (!reservation_date || !reservation_date.match(/\d{4}-\d{2}-\d{2}/))
    errorMsg = "A reservation_date is REQUIRED for reservations.";
  else if (!reservation_time || !reservation_time.match(/\d{2}:\d{2}/))
    errorMsg = "A reservation_time is REQUIRED for reservations.";
/*  
\   [User Story 6 Feature]
*/
  else if (status === "seated")
    errorMsg = "This reservation is already seated.";
  else if (status === "finished")
    errorMsg = "This reservation is already finished.";

  if (errorMsg) {
    next({
      status: 400,
      message: errorMsg
    });
  }
  return next();
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.reservationExists(reservation_id);

  if (data) {
    res.locals.reservation = data;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} does not exist.`
  });
}

function validDate(req, _res, next) {
  let { reservation_date } = req.body.data;
  reservation_date = new Date(reservation_date);
  const today = new Date();
  const day = reservation_date.toUTCString();
  let errorMsg;

  if (reservation_date < today)
    errorMsg = "Your reservation date has passed. Please select a future date.";
  if (day.includes("Tue")) {
    errorMsg =
      "We are closed on Tuesdays. Please select a different future date.";
  }

  if (errorMsg) {
    next({
      status: 400,
      message: errorMsg
    });
  }
  return next();
}

function validTime(req, _res, next) {
  const { reservation_time } = req.body.data;

  if (reservation_time < "10:30" || reservation_time > "21:30") {
    next({
      status: 400,
      message:
        "Unfortunately, we are closed at that time. Please select a different time."
    });
  }
  return next();
}

function validStatus(req, _res, next) {
  const update = req.body.data;
  const statusUpdate = update.status;
  const validStatus = ["booked", "seated", "finished", "cancelled"];

  if (!validStatus.includes(statusUpdate)) {
    next({
      status: 400,
      message: "unknown status"
    });
  }
  if (status === "finished") {
    next({
      status: 400,
      message: "A finished reservation cannot be updated."
    });
  }
  res.locals.update = update
  return next();
}

/*  
 \  End => Reservations Middeware
*/

/*  
\   [User Story 1 Feature]
 \  Creates => New Reservation
*/

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

/*  
\   [User Story 1 Feature]
 \  Lists => Reservations For Date => By Time
*/

async function list(req, res) {
  const { date } = req.query;
  if (date) {
    const data = await service.list(date);
    res.json({ data });
  }
}

function read(_req, res) {
  res.json({ data: res.locals.reservation });
}

async function updateStatus(_req, res) {
  const reservation = res.locals.reservation;
  const { reservation_id } = reservation;

  const updatedReservation = { ...reservation, ...res.locals.update };
  const data = await service.update(reservation_id, updatedReservation);
  res.status(200).json({ data });
}

module.exports = {
  create: [
    validateProperties,
    validDate,
    validTime,
    asyncErrorBoundary(create)
  ],
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExists), read],
  status: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(updateStatus)]
};
