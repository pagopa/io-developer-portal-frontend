import { CIDR } from "io-functions-commons/dist/generated/definitions/CIDR";
import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import * as ts from "io-ts";
import { NotEmptyString } from "../../generated/definitions/backend/NotEmptyString";

export const RequiredMetadata = ts.intersection([
  ServiceMetadata,
  ts.interface({
    description: NotEmptyString,
    privacy_url: NotEmptyString
  }),
  ts.union([
    // have pec
    ts.intersection([
      ts.interface({
        pec: NotEmptyString
      }),
      ts.partial({
        email: NotEmptyString,
        phone: NotEmptyString,
        support_url: NotEmptyString
      })
    ]),
    // have email
    ts.intersection([
      ts.interface({
        email: NotEmptyString
      }),
      ts.partial({
        pec: NotEmptyString,
        phone: NotEmptyString,
        support_url: NotEmptyString
      })
    ]),
    // have phone
    ts.intersection([
      ts.interface({
        phone: NotEmptyString
      }),
      ts.partial({
        email: NotEmptyString,
        pec: NotEmptyString,
        support_url: NotEmptyString
      })
    ]),
    // have support_url
    ts.intersection([
      ts.interface({
        support_url: NotEmptyString
      }),
      ts.partial({
        email: NotEmptyString,
        phone: NotEmptyString,
        pec: NotEmptyString
      })
    ])
  ])
]);

export const ValidService = ts.intersection([
  Service,
  ts.interface({
    authorized_cidrs: ts.refinement(ts.readonlyArray(CIDR), _ => _.length > 0),
    service_metadata: RequiredMetadata
  })
]);

export type ValidService = ts.TypeOf<typeof ValidDraftService>;

export const ValidDraftService = ts.intersection([
  Service,
  ts.interface({
    service_metadata: ServiceMetadata
  })
]);

export type ValidDraftService = ts.TypeOf<typeof ValidDraftService>;
