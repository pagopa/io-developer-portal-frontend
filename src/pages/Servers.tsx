import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";

import { Button, Col, ListGroup, ListGroupItem, Row } from "design-react-kit";

import ServerPicker from "../components/servers/ServerPicker";

import { upsert } from "../utils/db";

import { RouteComponentProps } from "react-router";
import compose from "recompose/compose";
import Database = PouchDB.Database;
import ExistingDocument = PouchDB.Core.ExistingDocument;
import { getConfig } from "../utils/config";

const { localStorage } = window;
type OwnProps = {
  db: Database<Server>;
};
type Props = RouteComponentProps & WithNamespaces & OwnProps;

type ServersState = {
  servers: ServersObj;
};

export interface Server {
  endpoint: string;
}

function isExistingDocument<T>(
  doc: T | ExistingDocument<T>
): doc is ExistingDocument<T> {
  return Boolean((doc as ExistingDocument<T>)._id);
}

interface ServersObj {
  [serverId: string]: ExistingDocument<Server>;
}

class Servers extends Component<Props, ServersState> {
  public state: ServersState = {
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
      (previousServers: ServersObj, currentServer) => {
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

  public onServerSelect = (server: Server | ExistingDocument<Server>) => {
    localStorage.setItem("serviceEndpoint", server.endpoint);
    this.setState({}); // Without this line the component is not rendered correctly
  };

  public onServerChange = async (
    server: Server | ExistingDocument<Server>,
    value: string
  ) => {
    if (!isExistingDocument(server)) {
      return;
    }
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

  public onServerDelete = async (server: Server | ExistingDocument<Server>) => {
    if (!isExistingDocument(server)) {
      return;
    }
    const { db } = this.props;
    await db.remove(server);
    await this.syncStatewithDB();
  };

  public render() {
    const { servers } = this.state;
    const { t } = this.props;

    const serviceEndpoint = localStorage.getItem("serviceEndpoint");

    const defaultUrl = getConfig("IO_DEVELOPER_PORTAL_APIM_BASE_URL");

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
              endpoint: defaultUrl
            }}
            endpoint={`${defaultUrl} (${t("default")})`}
            checked={serviceEndpoint === null || serviceEndpoint === defaultUrl}
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

const enhance = compose<Props, Props>(
  withDB,
  withNamespaces(["servers", "format"])
);

export default enhance(Servers);
