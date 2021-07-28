import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import React, { Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Alert } from "reactstrap";
import {
  getServiceReviewStatus,
  ServiceReviewStatusResponse,
  ServiceStatus
} from "../../utils/service";

type OwnProps = {
  t: (key: string) => string;
  service: Service;
  onLoaded: (event: ServiceReviewStatusResponse) => void;
};

type Props = WithNamespaces & OwnProps;

class JiraStatus extends Component<Props> {
  public state: {
    status: ServiceStatus;
  } = {
    status: ServiceStatus.LOADING
  };

  public componentDidMount() {
    // tslint:disable-next-line: no-floating-promises
    getServiceReviewStatus(this.props.service)
      .fold(
        ({ status }) =>
          this.setState({
            status
          }),
        res => {
          this.props.onLoaded(res);
          this.setState({
            status: res.status
          });
        }
      )
      .run();
  }

  private getColorClass(status: ServiceStatus) {
    switch (status) {
      case "REJECTED":
        return "circle-red";
      case "REVIEW":
        return "circle-yellow";
      case "VALID":
      case "DEACTIVE":
        return "circle-green";
      default:
        return "";
    }
  }

  private getText(status: ServiceStatus) {
    switch (status) {
      case "LOADING":
        return "profile:service_loading";
      case "DRAFT":
      case "NOT_FOUND":
        return "profile:service_draft";
      case "REJECTED":
        return "profile:service_not_valid";
      case "REVIEW":
        return "profile:service_review";
      case "VALID":
      case "DEACTIVE":
        return "profile:service_valid";
      default:
        return "";
    }
  }

  public render() {
    const { t } = this.props;
    const { status } = this.state;
    return (
      <Fragment>
        <div className="col-12">
          <div className="service-status">
            <div>
              <span className={`circle ${this.getColorClass(status)}`} />
              <div>
                <span className="light-text">{t("service:state")}:&nbsp;</span>
                <span className="dark-text">{t(this.getText(status))}</span>
              </div>
              {status === ServiceStatus.REVIEW ? (
                <Alert color="warning">
                  <span className="dark-text">{t("publish_review_title")}</span>
                  <span>&nbsp; {t("publish_review_message")}</span>
                </Alert>
              ) : (
                ""
              )}
              {status === ServiceStatus.VALID && (
                <Alert color="success">
                  <span className="dark-text">{t("published_title")}</span>
                  <span>&nbsp; {t("published")}</span>
                </Alert>
              )}

              {status === ServiceStatus.DEACTIVE && (
                <Alert color="info">
                  <span className="dark-text">
                    {t("deactive_service_title")}
                  </span>
                  <span>&nbsp; - {t("deactive_service_message")}</span>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
export default withNamespaces("service")(JiraStatus);
