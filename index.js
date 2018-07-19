import React from "react";
import { render } from "react-dom";

import { PouchDB } from "react-pouchdb/browser";

import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";

import "moment/locale/it";

const { localStorage } = window;

import Header from "./src/components/Header";
import Aside from "./src/components/Aside";

import Login from "./src/pages/Login";
import Contacts from "./src/pages/Contacts";
import Dashboard from "./src/pages/Dashboard";
import Messages from "./src/pages/Messages";
import Message from "./src/pages/Message";
import Templates from "./src/pages/Templates";

import "bootstrap-italia/dist/css/bootstrap-italia.min.css";
import "bootstrap-italia/dist/css/italia-icon-font.css";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

const Layout = ({ children }) => (
  <section className="row">
    <div className="col-3">
      <div className="ml-4 pt-5 pb-5">
        <Aside />
      </div>
    </div>
    <div className="col-9">
      <div className="mr-4 pt-5 pb-5">{children}</div>
    </div>
  </section>
);

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      !!localStorage.getItem("serviceKey") ? (
        <Layout>
          <Component {...props} />
        </Layout>
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

const Root = () => {
  const dbName = localStorage.getItem("serviceKey") || "anonymous";

  return (
    <PouchDB name={dbName}>
      <Header />

      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <PrivateRoute exact path="/contacts" component={Contacts} />
          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute exact path="/messages" component={Messages} />
          <PrivateRoute exact path="/message" component={Message} />
          <PrivateRoute exact path="/templates" component={Templates} />
          <PrivateRoute
            exact
            path="/templates/edit/:template_id"
            component={Templates}
          />
          <PrivateRoute
            exact
            path="/templates/:template_id"
            component={Templates}
          />
        </Switch>
      </Router>
    </PouchDB>
  );
};

render(<Root />, document.getElementById("root"));
