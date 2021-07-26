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
    getServiceReviewStatus(this.props.service)
      .then(res => {
        this.props.onLoaded(res);
        this.setState({
          status: res.status
        });
      })
      .catch(() => {
        this.setState({
          status: ServiceStatus.NOT_FOUND
        });
      });
  }

  public render() {
    const { t } = this.props;
    const { status } = this.state;
    return (
      <Fragment>
        <div className="col-12">
          {status === ServiceStatus.LOADING ? (
            <div className="service-status">
              <div>
                <span className="circle" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_loading")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.DRAFT ||
          status === ServiceStatus.NOT_FOUND ? (
            <div className="service-status">
              <div>
                <span className="circle" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_draft")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.REJECTED ? (
            <div className="service-status">
              <div>
                <span className="circle circle-red" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_not_valid")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.REVIEW ? (
            <div className="service-status">
              <div>
                <span className="circle circle-yellow" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_review")}
                  </span>
                </div>
              </div>

              <Alert color="warning">
                <span className="dark-text">{t("publish_review_title")}</span>
                <span>&nbsp; {t("publish_review_message")}</span>
              </Alert>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.VALID ||
          status === ServiceStatus.DEACTIVE ? (
            <div className="service-status">
              <div>
                <span className="circle circle-green" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_valid")}
                  </span>
                </div>
              </div>

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
          ) : (
            ""
          )}
        </div>
      </Fragment>
    );
  }
}
export default withNamespaces("service")(JiraStatus);
