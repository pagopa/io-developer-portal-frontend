import React, { Component } from "react";

import { withRouter } from "react-router";
import { withNamespaces } from "react-i18next";

import { parse } from 'papaparse';

import {
  Row,
  Col,
  FormGroup,
  Alert,
  Input,
  Toggle,
  Button
} from "design-react-kit";
import SelectedService from "../components/SelectedService";

import { withDB } from "react-pouchdb/browser";

import { CONSTANTS } from "../utils/constants"
import { createMessageContent, messagePostAndPersist, interpolateMarkdown } from "../utils/operations";
import { areHeadersValid } from "../utils/validators";

const {
  CSV: { NAME, SURNAME, FISCALCODE, SUBJECT, MARKDOWN, AMOUNT, NOTICE, DUEDATE }
} = CONSTANTS;

import moment from "moment";
import compose from "recompose/compose";

import FaEnvelope from "react-icons/lib/fa/envelope-o";
import FaCalendar from "react-icons/lib/fa/calendar";
import FaExclamation from "react-icons/lib/fa/exclamation";
import FaEur from "react-icons/lib/fa/eur";

import "./Pages.css";
import "./ComposeImport.css";

type ComposeState = {
  file: File | undefined,
  fileData: any[],
  headers: any[],
  ignoreHeaders: boolean,
  sent: boolean
};

class Compose extends Component<any, ComposeState> {
  initialState: ComposeState = {
    file: undefined,
    fileData: [] as any[],
    headers: [],
    ignoreHeaders: false,
    sent: false
  };

  state: ComposeState = {
    file: this.initialState.file,
    fileData: this.initialState.fileData,
    headers: this.initialState.headers,
    ignoreHeaders: this.initialState.ignoreHeaders,
    sent: this.initialState.sent
  };

  fileInput = React.createRef<HTMLInputElement>();

  onTriggerUpload = () => {
    this.fileInput.current && this.fileInput.current.click();
  };

  onFileUpdate = ({ target: { files } }) => {
    this.onFileParse(files[0]);
  };

  onToggleHeader = ({ target: { checked } }) => {
    this.setState({ ignoreHeaders: checked }, () => {
      this.onFileParse(this.state.file);
    });
  };

  onFileParse = file => {
    if (!file) {
      return;
    }

    parse(file, {
      // header: false,
      skipEmptyLines: true,
      error: (error) => {
        console.error(error);
      },
      complete: (results, file) => {
        // data is an array of rows.
        // If `header` is false, rows are arrays;
        // otherwise they are objects of data keyed by the field name
        const { ignoreHeaders } = this.state;
        const { data } = results;

        let headers;
        if (ignoreHeaders) {
          headers = data.shift();
        } else {
          headers = data[0];
        }
        this.setState({ file, fileData: data, headers });
      }
    });
  };

  onMessageSubmit = async () => {
    this.setState({
      sent: true
    });

    const { file, fileData, ignoreHeaders } = this.state;
    const { db, t } = this.props;

    const template = await db.post({
      type: "template",
      subject: file && file.name,
      markdown: ""
    });
    const batch = await db.post({
      type: "batch",
      templateId: template.id,
      created_at: moment().toISOString()
    });

    const promises: Promise<any>[] = [];
    fileData.forEach(row => {
      const message = {
        subject: row[SUBJECT],
        markdown: row[MARKDOWN]
      };
      if (ignoreHeaders) {
        message.markdown = interpolateMarkdown(message.markdown, row);
      }
      const content = createMessageContent({
        message,
        dueDate: !!row[DUEDATE] ? row[DUEDATE] : undefined,
        amount: !!row[AMOUNT] ? new Number(row[AMOUNT]) : undefined,
        notice: !!row[NOTICE] ? row[NOTICE] : undefined,
        dueDateFormat: t("format:date")
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
    const { file, fileData, headers, ignoreHeaders, sent } = this.state;
    const { t } = this.props;

    const isValid = ignoreHeaders ? areHeadersValid(headers) : true;

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
                      {file.name} ({fileData.length} {t("messages")})
                    </span>
                  );
                }

                return <span>{t("upload_file")}</span>;
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
            <Toggle label={t("ignore_header")} onChange={this.onToggleHeader} />
          </FormGroup>
        </Col>

        {(() => {
          if (fileData.length) {
            return (
              <table className="table mb-0 rounded">
                <thead>
                  {ignoreHeaders &&
                    !isValid && (
                      <tr>
                        <td colSpan={6}>
                          <Alert color="danger">{t("invalid_headers")}</Alert>
                        </td>
                      </tr>
                    )}
                  <tr>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        {t("name")}
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        {t("surname")}
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        {t("fiscal_code")}
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        {t("subject")}
                      </span>
                    </th>
                    <th className="border-0">
                      <span className="text-uppercase font-weight-normal">
                        {t("markdown")}
                      </span>
                    </th>
                    <th className="border-0 compose-import--rows-icons">
                      <span className="text-uppercase font-weight-normal">
                        {t("due_date")}
                      </span>
                      <span className="text-uppercase font-weight-normal">
                        {t("notice")}
                      </span>
                      <span className="text-uppercase font-weight-normal">
                        {t("amount")}
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
                          <span>{row[DUEDATE] && <FaCalendar />}</span>
                          <span>{row[NOTICE] && <FaExclamation />}</span>
                          <span>{row[AMOUNT] && <FaEur />}</span>
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
                disabled={sent || !isValid}
                onClick={this.onMessageSubmit}
              >
                {t("send")}
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
  withRouter,
  withNamespaces(["compose_import", "format"])
);

export default enhance(Compose);
