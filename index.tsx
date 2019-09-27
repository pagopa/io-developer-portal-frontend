import React, { ReactNode } from "react";
import { render } from "react-dom";

import { PouchDB } from "react-pouchdb/browser";

import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps,
  Switch
} from "react-router-dom";

import { I18nextProvider } from "react-i18next";
import i18n from "./src/i18n/i18n";

import WebFont from "webfontloader";

import "moment/locale/it";

const { localStorage } = window;

import Aside from "./src/components/Aside";
import Header from "./src/components/Header";
import Worker from "./src/components/Worker";

import Compose from "./src/pages/Compose";
import ComposeImport from "./src/pages/ComposeImport";
import Contacts from "./src/pages/Contacts";
import Dashboard from "./src/pages/Dashboard";
import Login from "./src/pages/Login";
import Message from "./src/pages/Message";
import Messages from "./src/pages/Messages";
import Report from "./src/pages/Report";
import Servers from "./src/pages/Servers";
import Templates from "./src/pages/Templates";

import Profile from "./src/pages/Profile";
import SubscriptionService from "./src/pages/SubscriptionService";
import UserList from "./src/pages/UserList";

import "bootstrap-italia/dist/css/bootstrap-italia.min.css";
import "bootstrap-italia/dist/css/italia-icon-font.css";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import { ICustomWindow } from "./src/customTypes/CustomWindow";

const Layout = ({ children }: { children: ReactNode }) => (
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

const customWindow = window as ICustomWindow;

type PrivateRouteParams = {
  // tslint:disable-next-line:no-any
  component: any;
  dbName?: string;
} & RouteProps;

const PrivateRoute = ({
  component: Component,
  dbName = "",
  ...rest
}: PrivateRouteParams) => (
  <Route
    {...rest}
    render={props =>
      !!localStorage.getItem("userData") ? (
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
      <Router basename={customWindow._env_.PUBLIC_PATH}>
        <I18nextProvider i18n={i18n}>
          <Header />
          <Worker dbName={dbName} />

          <Switch>
            <Route exact={true} path="/login" component={Login} />
            <PrivateRoute exact={true} path="/" component={Dashboard} />
            <PrivateRoute exact={true} path="/compose" component={Compose} />
            <PrivateRoute
              exact={true}
              path="/compose/import"
              component={ComposeImport}
            />
            <PrivateRoute
              exact={true}
              path="/config/servers"
              component={Servers}
            />
            <PrivateRoute exact={true} path="/contacts" component={Contacts} />
            <PrivateRoute exact={true} path="/messages" component={Messages} />
            <PrivateRoute exact={true} path="/users" component={UserList} />
            <PrivateRoute
              exact={true}
              path="/message"
              component={Message}
              dbName={dbName}
            />
            <PrivateRoute
              exact={true}
              path="/report/:entry_type/:entry_id"
              component={Report}
            />
            <PrivateRoute
              exact={true}
              path="/templates"
              component={Templates}
            />
            <PrivateRoute
              exact={true}
              path="/templates/edit/:template_id"
              component={Templates}
            />
            <PrivateRoute
              exact={true}
              path="/templates/:template_id"
              component={Templates}
            />
            <PrivateRoute
              exact={true}
              path="/profile/:email?"
              component={Profile}
            />
            <PrivateRoute
              exact={true}
              path="/service/:service_id"
              component={SubscriptionService}
            />

            <Route component={Login} />
          </Switch>
        </I18nextProvider>
      </Router>
    </PouchDB>
  );
};

WebFont.load({
  google: {
    families: ["Titillium Web:300,400,700"]
  },
  active: () => {
    // This event is triggered when the fonts have rendered.
    render(<Root />, document.getElementById("root"));
  }
});
