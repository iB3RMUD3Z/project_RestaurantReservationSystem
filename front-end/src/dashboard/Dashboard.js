import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import useQuery from "../utils/useQuery";
import ErrorAlert from "../layout/ErrorAlert";
import DashListReservations from "./DashListReservations";
import DashListTables from "./DashListTables";
import DashButtons from "./DashButtons";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservationsDate, setReservationsDate] = useState(date);

  const query = useQuery();
  const queryDate = query.get("date");

  useEffect(() => {
    if (queryDate) {
      setReservationsDate(queryDate);
    }
  }, [queryDate]);

  useEffect(loadReservations, [reservationsDate]);

  function loadReservations() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: reservationsDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }
  
  return (
    <main>
      <h1 className="mt-lg-4 mt-1 mb-3">Dashboard</h1>
      <h4 className="mb-1">Reservations for Date: {reservationsDate}</h4>
      <DashButtons reservationsDate={reservationsDate} />
      <ErrorAlert error={reservationsError} />
      <DashListReservations
        reservations={reservations}
        loadReservations={loadReservations}
      />
      <DashListTables loadReservations={loadReservations} />
    </main>
  );
}

export default Dashboard;
