import { CIDR } from "io-functions-commons/dist/generated/definitions/CIDR";
import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import * as ts from "io-ts";
import { NotEmptyString } from "../../generated/definitions/backend/NotEmptyString";
import { getFromBackend, putToBackend } from "./backend";

export enum ServiceFormState {
  "SAVED_OK" = "SAVED_OK", // Succesfull saved to backend
  "SAVED_ERROR" = "SAVED_ERROR", // Unsuccesfull saved to backend
  "NOT_SAVE" = "NOT_SAVE" // Not yet saved to backend
}

export enum ServiceStatus {
  "DRAFT" = "DRAFT", // Service in Draft
  "REJECTED" = "REJECTED", // Service with some errors on fields or rejected
  "REVIEW" = "REVIEW", // Service in review
  "VALID" = "VALID", // Service valid
  "DEACTIVE" = "DEACTIVE", // Service in deactivation
  "NOT_FOUND" = "NOT_FOUND", // Service not found
  "LOADING" = "LOADING"
}

/*export enum DelegateStatus {
  "DELEGATO_VISIBILE" = "DELEGATO_VISIBILE",
  "DELEGATO_NON_VISIBILE" = "DELEGATO_NON_VISIBILE"
}*/

export const ReviewStatus = ts.partial({
  comment: ts.interface({
    comments: ts.readonlyArray(
      ts.interface({
        body: ts.string,
        created: ts.string
      })
    )
  }),
  labels: ts.readonlyArray(ts.string),
  key: ts.string,
  status: ts.number,
  detail: ts.string,
  title: ts.string
});

export type ReviewStatus = ts.TypeOf<typeof ReviewStatus>;

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

export const handleReviewStatus = async (serviceId: string) => {
  return await getFromBackend<ReviewStatus>({
    path: `services/${serviceId}/review`
  });
};

export const handleDisableReview = async (serviceId: string) => {
  return await putToBackend<ReviewStatus>({
    path: `services/${serviceId}/disable`,
    options: {}
  });
};

export type ServiceReviewStatusResponse = {
  review: ReviewStatus | null;
  status: ServiceStatus;
};

export const getServiceReviewStatus = async (
  service: Service
): Promise<ServiceReviewStatusResponse> => {
  const isVisible = service.is_visible;
  const errorOrValidService = ValidService.decode(service);
  const serviceId = service.service_id;
  if (serviceId) {
    return await handleReviewStatus(serviceId)
      .then(res => {
        if (res.status === 200) {
          const isDisableInProgress =
            res.labels && res.labels.indexOf("DISATTIVAZIONE") >= 0;
          if (isDisableInProgress) {
            return {
              review: res,
              status: ServiceStatus.DEACTIVE
            };
          }
          switch (res.detail) {
            case "NEW":
            case "REVIEW":
              return {
                review: res,
                status: ServiceStatus.REVIEW
              };
            case "REJECTED":
              return {
                review: res,
                status: ServiceStatus.REJECTED // errors on fields
              };
            default: {
              if (isVisible && errorOrValidService.isRight()) {
                return {
                  review: res,
                  status: ServiceStatus.VALID
                };
              } else {
                return {
                  review: res,
                  status: ServiceStatus.DRAFT // new service in draft
                };
              }
            }
          }
        } else {
          if (isVisible && errorOrValidService.isRight()) {
            return {
              review: res,
              status: ServiceStatus.VALID
            };
          } else if (isVisible && errorOrValidService.isLeft()) {
            return {
              review: res,
              status: ServiceStatus.REJECTED // missing some fields
            };
          } else {
            return {
              review: res,
              status: ServiceStatus.DRAFT
            };
          }
        }
      })
      .catch(_ => ({
        review: null,
        status: ServiceStatus.NOT_FOUND
      }));
  } else {
    return {
      review: null,
      status: ServiceStatus.NOT_FOUND
    };
  }
};
