import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <div className="container-fluid">
      <div className="row h-100">
        <div className="col-lg-2 side-bar">
          <Menu />
        </div>
        <div className="col" style={{ padding: "0px" }}>
          <img
            src="/images/restaurant-lighting-1.jpg"
            className="img-fluid"
            alt="Dashboard Banner"
          ></img>
          <div style={{ padding: "15px" }}>
            <Routes />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
