import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";

import { Button, Col, ListGroup, ListGroupItem, Row } from "design-react-kit";

import ServerPicker from "../components/servers/ServerPicker";

import { DEFAULT_URL } from "../utils/api";
import { upsert } from "../utils/db";

import { RouteComponentProps } from "react-router";
import compose from "recompose/compose";

const { localStorage } = window;
type Props = {
  db: any;
};
type ServersProps = RouteComponentProps & WithNamespaces & Props;

type ServersState = {
  selected: undefined;
  servers: any;
};

class Servers extends Component<ServersProps, ServersState> {
  public state: ServersState = {
    selected: undefined,
    servers: {}
  };

  public componentDidMount = async () => {
    await this.syncStatewithDB();
  };

  public syncStatewithDB = async () => {
    const { db } = this.props;
    const servers = await db.find({
      selector: {
        type: "server"
      }
    });

    const newServers = servers.docs.reduce(
      (previousServers: any, currentServer: any) => {
        return {
          ...previousServers,
          [currentServer._id]: currentServer
        };
      },
      {}
    );

    this.setState({
      servers: newServers
    });
  };

  public onServerAdd = async () => {
    const { db } = this.props;
    await db.post({
      type: "server",
      endpoint: ""
    });
    await this.syncStatewithDB();
  };

  public onServerSelect = (server: any) => {
    localStorage.setItem("serviceEndpoint", server.endpoint);
    this.setState({
      selected: server
    });
  };

  public onServerChange = async (server: any, value: string) => {
    const { db } = this.props;
    await upsert(db, server._id, {
      ...server,
      endpoint: value
    });

    const newServer = {
      ...server,
      endpoint: value
    };

    this.setState(
      prevState => {
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

  public onServerDelete = async (server: any) => {
    const { db } = this.props;
    db.remove(server);
    await this.syncStatewithDB();
  };

  public render() {
    const { servers } = this.state;
    const { t } = this.props;

    const serviceEndpoint = localStorage.getItem("serviceEndpoint");

    return (
      <ListGroup>
        <Row>
          <Col>
            <h2 className="display-4 mt-2">{t("select")}</h2>
          </Col>
          <Col>
            <div className="d-flex justify-content-end mb-3">
              <Button color="primary" onClick={this.onServerAdd}>
                {t("add")}
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
            endpoint={`${DEFAULT_URL} (${t("default")})`}
            checked={
              serviceEndpoint === null || serviceEndpoint === DEFAULT_URL
            }
            onServerSelect={this.onServerSelect}
            onServerChange={this.onServerChange}
            disabled={true}
          />
          {Object.keys(servers).map(key => {
            const server = servers[key];
            return (
              <ServerPicker
                key={server._id}
                server={server}
                endpoint={server.endpoint}
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

const enhance = compose<ServersProps, ServersProps>(
  withDB,
  withNamespaces(["servers", "format"])
);

export default enhance(Servers);
