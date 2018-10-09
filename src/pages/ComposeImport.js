import React, { Component } from "react";
import ReactDOM from "react-dom";

import { withRouter } from "react-router";

import { Row, Col, FormGroup, Input, Toggle, Button } from "design-react-kit";
import SelectedService from "../components/SelectedService";

import { withDB } from "react-pouchdb/browser";

import {
  createMessageContent,
  messagePostAndPersist,
  CONSTANTS
} from "../utils/";
const {
  CSV: { NAME, SURNAME, FISCALCODE, SUBJECT, MARKDOWN, AMOUNT, NOTICE, DUEDATE }
} = CONSTANTS;

import Papa from "papaparse";
import moment from "moment";
import compose from "recompose/compose";

import FaEnvelope from "react-icons/lib/fa/envelope-o";
import FaCalendar from "react-icons/lib/fa/calendar";
import FaExclamation from "react-icons/lib/fa/exclamation";
import FaEur from "react-icons/lib/fa/eur";

import "./Pages.css";
import "./ComposeImport.css";

class Compose extends Component {
  initialState = {
    file: undefined,
    fileData: [],
    ignoreHeader: false,
    sent: false
  };

  state = {
    file: this.initialState.file,
    fileData: this.initialState.fileData,
    ignoreHeader: this.initialState.ignoreHeader,
    sent: this.initialState.sent
  };

  fileInput = React.createRef();

  onTriggerUpload = () => {
    const el = ReactDOM.findDOMNode(this.fileInput.current);
    el.click();
  };

  onFileUpdate = ({ target: { files } }) => {
    this.onFileParse(files[0]);
  };

  onToggleHeader = ({ target: { checked } }) => {
    this.setState({ ignoreHeader: checked }, () => {
      this.onFileParse(this.state.file);
    });
  };

  onFileParse = file => {
    if (!file) {
      return;
    }

    Papa.parse(file, {
      // header: false,
      skipEmptyLines: true,
      error: (err, file, inputElem, reason) => {
        console.error(reason);
      },
      complete: (results, file) => {
        // data is an array of rows.
        // If `header` is false, rows are arrays;
        // otherwise they are objects of data keyed by the field name
        const { ignoreHeader } = this.state;
        const { data } = results;

        if (ignoreHeader) {
          data.shift();
        }
        this.setState({ file, fileData: data });
      }
    });
  };

  onMessageSubmit = async () => {
    this.setState({
      sent: true
    });

    const { file, fileData } = this.state;
    const { db } = this.props;

    const template = await db.post({
      type: "template",
      subject: file.name,
      markdown: ""
    });
    const batch = await db.post({
      type: "batch",
      templateId: template.id,
      created_at: moment().toISOString()
    });

    const promises = [];
    fileData.forEach(row => {
      const message = {
        subject: row[SUBJECT],
        markdown: row[MARKDOWN]
      };
      const content = createMessageContent({
        message,
        dueDate: !!row[DUEDATE] ? row[DUEDATE] : undefined,
        amount: !!row[AMOUNT] ? new Number(row[AMOUNT]) : undefined,
        notice: !!row[NOTICE] ? row[NOTICE] : undefined
      });

      promises.push(
        messagePostAndPersist({
          db,
          code: row[FISCALCODE],
          content,
          templateId: template.id,
          batchId: batch.id
        })
      );
    });

    const result = await Promise.all(promises);

    this.goHome({ result });
  };

  goHome = ({ result }) => {
    const { history } = this.props;
    const location = {
      pathname: "/",
      state: result
    };
    history.push(location);
  };

  render() {
    const { file, fileData, sent } = this.state;

    return (
      <section className="pages--container">
        <SelectedService />
        <Col className="col-auto mb-2">
          <header
            className="compose-import--recipient-upload text-uppercase"
            onClick={this.onTriggerUpload}
          >
            <span className="btn btn-link font-weight-bold">
              {(() => {
                if (file) {
                  return (
                    <span>
                      {file.name} ({fileData.length} messaggi)
                    </span>
                  );
                }

                return <span>Carica documento (.csv)</span>;
              })()}
            </span>
          </header>
          <Input
            className="d-none"
            type="file"
            ref={this.fileInput}
            onChange={this.onFileUpdate}
          />
          <FormGroup check className="m-3">
            <Toggle
              label="Ignora l'intestazione del file"
              onChange={this.onToggleHeader}
            />
          </FormGroup>
        </Col>

        {(() => {
          if (fileData.length) {
            return (
              <table className="table mb-0 rounded">
                <thead>
                  <tr>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        Nome
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        Cognome
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        Codice Fiscale
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        Oggetto
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        Messaggio
                      </span>
                    </th>
                    <th className="border-0 compose-import--rows-icons">
                      <span className="text-uppercase font-weight-normal">
                        Scadenza
                      </span>
                      <span className="text-uppercase font-weight-normal">
                        Avviso
                      </span>
                      <span className="text-uppercase font-weight-normal">
                        Importo
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fileData.map((row, i) => {
                    return (
                      <tr key={i}>
                        <td>
                          {row[NAME].substring(0, 3)}
                          &hellip;
                        </td>
                        <td>
                          {row[SURNAME].substring(0, 3)}
                          &hellip;
                        </td>
                        <td>{row[FISCALCODE]}</td>
                        <td>{row[SUBJECT]}</td>
                        <td className="text-center">
                          {row[MARKDOWN] && <FaEnvelope />}
                        </td>
                        <td className="compose-import--rows-icons">
                          {row[DUEDATE] && <FaCalendar />}
                          {row[NOTICE] && <FaExclamation />}
                          {row[AMOUNT] && <FaEur />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          }
        })()}
        {(() => {
          if (fileData.length) {
            return (
              <Button
                className="mt-3 pl-5 pr-5"
                color="primary"
                disabled={sent}
                onClick={this.onMessageSubmit}
              >
                Invia
              </Button>
            );
          }
        })()}
      </section>
    );
  }
}

const enhance = compose(
  withDB,
  withRouter
);

export default enhance(Compose);
