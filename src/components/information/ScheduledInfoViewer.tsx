import { NonEmptyString, PatternString } from "@pagopa/ts-commons/lib/strings";
import { Alert } from "design-react-kit";
import * as iots from "io-ts"; // iots to avoid shadowed-variable on t of i18n
import moment from "moment";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

/**
 * String with `YYYY-MM-DDTHH:mm:ss` pattern
 *
 * _Example: 2023-07-26T10:05:59_
 */
export const ScheduledDateTime = PatternString(
  "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$"
);
export type ScheduledDateTime = iots.TypeOf<typeof ScheduledDateTime>;

const defaultSeverity = "warning";
export const SeverityType = iots.union([
  iots.literal("danger"),
  iots.literal("info"),
  iots.literal(defaultSeverity)
]);
export type SeverityType = iots.TypeOf<typeof SeverityType>;

export const ScheduledInfo = iots.intersection([
  iots.type({
    /**
     * scheduling start date and time
     */
    startDateTime: ScheduledDateTime,
    /**
     * scheduling end date and time
     */
    endDateTime: ScheduledDateTime,
    /**
     * Custom message shown.
     *
     * You can set a message or the key of an _i18n_ translation from `scheduledInfo` namespace
     */
    message: NonEmptyString
  }),
  iots.partial({
    /**
     * Define severity color and icon. Default value `warning`.
     */
    severity: SeverityType
  })
]);
export type ScheduledInfo = iots.TypeOf<typeof ScheduledInfo>;

export const ScheduledInfoList = iots.array(ScheduledInfo);
export type ScheduledInfoList = iots.TypeOf<typeof ScheduledInfoList>;

type ScheduledInfoViewerProps = {
  items: readonly ScheduledInfo[];
};
type Props = WithNamespaces & ScheduledInfoViewerProps;

type ScheduledInfoViewerState = {
  isInRange: boolean;
  currentMessage: string;
  currentSeverity: SeverityType;
};

class ScheduledInfoViewer extends Component<Props, ScheduledInfoViewerState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isInRange: false,
      currentMessage: "",
      currentSeverity: defaultSeverity
    };
  }

  public componentDidMount() {
    this.checkScheduledItems();
  }

  public componentDidUpdate(prevProps: ScheduledInfoViewerProps) {
    if (prevProps.items !== this.props.items) {
      this.checkScheduledItems();
    }
  }

  public checkScheduledItems = () => {
    // Get current datetime
    const currentDateTime = moment();

    // Search for the matching datetime range
    const currentScheduledInfo = this.props.items.find(
      ({ startDateTime, endDateTime }) =>
        moment(currentDateTime).isBetween(
          startDateTime,
          endDateTime,
          "second",
          "[]"
        )
    );

    if (currentScheduledInfo) {
      this.setState({
        isInRange: true,
        currentMessage: currentScheduledInfo.message,
        currentSeverity: currentScheduledInfo.severity
          ? currentScheduledInfo.severity
          : defaultSeverity
      });
    }
  };

  public render() {
    const { t } = this.props;
    const { isInRange, currentMessage, currentSeverity } = this.state;

    return (
      <>
        {isInRange ? (
          <div className="p-3">
            <Alert color={currentSeverity}>
              <div dangerouslySetInnerHTML={{ __html: t(currentMessage) }} />
            </Alert>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default withNamespaces("scheduledInfo")(ScheduledInfoViewer);
