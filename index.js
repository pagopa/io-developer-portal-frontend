import React from "react";
import { render } from "react-dom";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./src/pages/Home";

import "bootstrap-italia/dist/css/bootstrap-italia.min.css";
import "bootstrap-italia/dist/css/italia-icon-font.css";

const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
    </Switch>
  </Router>
);

render(<Root />, document.getElementById("root"));
