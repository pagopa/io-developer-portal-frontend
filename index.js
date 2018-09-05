import React, { Fragment } from "react";
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
import Worker from "./src/components/Worker";

import Login from "./src/pages/Login";
import Compose from "./src/pages/Compose";
import Contacts from "./src/pages/Contacts";
import Dashboard from "./src/pages/Dashboard";
import Messages from "./src/pages/Messages";
import Message from "./src/pages/Message";
import Report from "./src/pages/Report";
import Servers from "./src/pages/Servers";
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

const PrivateRoute = ({ component: Component, dbName, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      !!localStorage.getItem("serviceKey") ? (
        <Layout>
          <Component {...props} dbName={dbName} />
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
      <Router basename={process.env.PUBLIC_PATH}>
        <Fragment>
          <Header />
          <Worker dbName={dbName} />

          <Switch>
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/" component={Dashboard} />
            <PrivateRoute exact path="/compose" component={Compose} />
            <PrivateRoute exact path="/config/servers" component={Servers} />
            <PrivateRoute exact path="/contacts" component={Contacts} />
            <PrivateRoute exact path="/messages" component={Messages} />
            <PrivateRoute
              exact
              path="/message"
              component={Message}
              dbName={dbName}
            />
            <PrivateRoute
              exact
              path="/report/:entry_type/:entry_id"
              component={Report}
            />
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
            {/* Not found */}
            <Route component={Login} />
          </Switch>
        </Fragment>
      </Router>
    </PouchDB>
  );
};

render(<Root />, document.getElementById("root"));
