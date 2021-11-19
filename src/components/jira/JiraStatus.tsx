import React, { Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Alert } from "reactstrap";
import { Service } from "../../../generated/definitions/commons/Service";
import {
  getColorClass,
  getServiceReviewStatus,
  getText,
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

  public render() {
    const { t } = this.props;
    const { status } = this.state;
    return (
      <Fragment>
        <div className="col-12">
          <div className="service-status">
            <div>
              <span className={`circle ${getColorClass(status)}`} />
              <div>
                <span className="light-text">{t("service:state")}:&nbsp;</span>
                <span className="dark-text">{t(getText(status))}</span>
              </div>
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
                <span className="dark-text">{t("deactive_service_title")}</span>
                <span>&nbsp; - {t("deactive_service_message")}</span>
              </Alert>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}
export default withNamespaces("service")(JiraStatus);
