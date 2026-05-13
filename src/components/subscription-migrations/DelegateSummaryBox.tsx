import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { getFromBackend } from "../../utils/backend";

import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Alert } from "design-react-kit";
import * as t from "io-ts";

type OwnProps = {
  onSubmitHandler: () => void;
};

type Props = WithNamespaces & OwnProps;

type State = { hasMigratedItems: boolean };

type MigrationsStatusByDelegateResponse = t.TypeOf<
  typeof MigrationsStatusByDelegateResponse
>;
const MigrationsStatusByDelegateResponse = t.interface({
  items: t.readonlyArray(
    t.interface({
      status: t.interface({
        completed: t.number,
        failed: t.number,
        initial: t.number,
        processing: t.number
      }),
      lastUpdate: DateFromString,
      organization: t.interface({ fiscalCode: OrganizationFiscalCode })
    })
  )
});

class DelegateSummaryBox extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasMigratedItems: false
    };
  }

  public async componentDidMount() {
    // On component mount, fetch all delegates and the status if their migrations
    return this.loadMigrationsStatus();
  }

  private async loadMigrationsStatus() {
    const { items } = await getFromBackend<MigrationsStatusByDelegateResponse>({
      path: "subscriptions/migrations/claimed-ownerships"
    });
    const hasMigratedItems = items.some(e => e.status.completed > 0);
    this.setState({ hasMigratedItems });
  }

  public render() {
    const { hasMigratedItems } = this.state;
    return hasMigratedItems ? (
      <Alert color="warning">
        I tuoi servizi sono stati importati nel nuovo back office di IO. Per
        visualizzarli e gestirli, accedi all'
        <a href="https://selfcare.pagopa.it/auth/login?onSuccess=dashboard">
          Area Riservata
        </a>{" "}
        e seleziona l'app IO.
      </Alert>
    ) : (
      <></>
    );
  }
}

export default withNamespaces("subscription_migrations")(DelegateSummaryBox);
