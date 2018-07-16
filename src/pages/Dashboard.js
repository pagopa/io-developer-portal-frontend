import React, { Component } from "react";

import { withDB, Find } from "react-pouchdb/browser";

import { Card, CardBody, CardTitle, CardText } from "design-react-kit";

class Dashboard extends Component {
  render() {
    return (
      <section className="d-flex">
        <Find
          selector={{
            type: "template"
          }}
          render={({ docs }) => {
            return (
              <Card className="flex-1 bg-primary text-white p-3 m-3">
                <CardBody>
                  <CardTitle className="display-1">{docs.length}</CardTitle>
                  <CardText>Template</CardText>
                </CardBody>
              </Card>
            );
          }}
        />
        <Find
          selector={{
            type: "message"
          }}
          render={({ docs }) => {
            return (
              <Card className="flex-1 bg-primary text-white p-3 m-3">
                <CardBody>
                  <CardTitle className="display-1">{docs.length}</CardTitle>
                  <CardText>Messaggi</CardText>
                </CardBody>
              </Card>
            );
          }}
        />
        <Find
          selector={{
            type: "contact"
          }}
          render={({ docs }) => {
            return (
              <Card className="flex-1 bg-primary text-white p-3 m-3">
                <CardBody>
                  <CardTitle className="display-1">{docs.length}</CardTitle>
                  <CardText>Contatti</CardText>
                </CardBody>
              </Card>
            );
          }}
        />
      </section>
    );
  }
}

export default Dashboard;
