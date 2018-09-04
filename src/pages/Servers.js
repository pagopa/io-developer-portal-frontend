import React, { Component } from "react";

import { Col, Row, ListGroup, ListGroupItem, Button } from "design-react-kit";

import { withDB, Find } from "react-pouchdb/browser";

import ServerPicker from "../components/servers/ServerPicker";

import { DEFAULT_URL } from "../utils/api";
import { upsert } from "../utils/";

const { localStorage } = window;

class Servers extends Component {
  state = {
    selected: undefined,
    servers: {}
  };

  componentDidMount = async () => {
    await this.syncStatewithDB();
  };

  syncStatewithDB = async () => {
    const { db } = this.props;
    const servers = await db.find({
      selector: {
        type: "server"
      }
    });

    const newServers = {};
    servers.docs.map(server => (newServers[server._id] = server));

    this.setState({
      servers: newServers
    });
  };

  onServerAdd = async () => {
    const { db } = this.props;
    const server = await db.post({
      type: "server",
      endpoint: ""
    });
    await this.syncStatewithDB();
  };

  onServerSelect = server => {
    localStorage.setItem("serviceEndpoint", server.endpoint);
    this.setState({
      selected: server
    });
  };

  onServerChange = async (server, value) => {
    const { db } = this.props;
    const doc = await upsert(db, server._id, {
      ...server,
      endpoint: value
    });

    const newServer = {
      ...server,
      endpoint: value
    };

    this.setState(
      (prevState, props) => {
        return {
          servers: {
            ...prevState.servers,
            [server._id]: newServer
          }
        };
      },
      () => this.onServerSelect(newServer)
    );
  };

  onServerDelete = async server => {
    const { db } = this.props;
    const doc = db.remove(server);
    await this.syncStatewithDB();
  };

  render() {
    const { servers } = this.state;
    const serviceEndpoint = localStorage.getItem("serviceEndpoint");

    return (
      <ListGroup>
        <Row>
          <Col>
            <h2 className="display-4 mt-2">
              Seleziona il server (endpoint) predefinito
            </h2>
          </Col>
          <Col>
            <div className="d-flex justify-content-end mb-3">
              <Button color="primary" onClick={this.onServerAdd}>
                Aggiungi un server
              </Button>
            </div>
          </Col>
        </Row>

        <ListGroupItem>
          <ServerPicker
            key={`default`}
            server={{
              endpoint: DEFAULT_URL
            }}
            value={`${DEFAULT_URL} (default)`}
            checked={
              serviceEndpoint === null || serviceEndpoint === DEFAULT_URL
            }
            onServerSelect={this.onServerSelect}
            onServerChange={this.onServerChange}
            disabled
          />
          {Object.keys(servers).map(key => {
            const server = servers[key];
            return (
              <ServerPicker
                key={server._id}
                server={server}
                value={server.endpoint}
                checked={serviceEndpoint === server.endpoint}
                onServerSelect={this.onServerSelect}
                onServerChange={this.onServerChange}
                onServerDelete={this.onServerDelete}
              />
            );
          })}
        </ListGroupItem>
      </ListGroup>
    );
  }
}

export default withDB(Servers);
