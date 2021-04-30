import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";

export const isContactExists = (metadata: ServiceMetadata): boolean => {
  return !!(
    metadata &&
    (metadata["phone"] ||
      metadata["email"] ||
      metadata["pec"] ||
      metadata["support_url"])
  );
};

export const isMandatoryFieldsValid = (service: Service): boolean => {
  console.log("isMandatoryField", service);
  return !!(
    service &&
    service.authorized_cidrs &&
    service.service_metadata &&
    service.service_metadata.description &&
    service.service_metadata.privacy_url
  );
};
