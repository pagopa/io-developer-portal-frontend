import React from "react";

export const getStorage = () => {
  function getParsedItem(itemName: string) {
    const serviceItem = sessionStorage.getItem(itemName);
    return serviceItem ? JSON.parse(serviceItem) : serviceItem;
  }

  return {
    backendEndpoint: sessionStorage.getItem("backendEndpoint"),
    isApiAdmin: sessionStorage.getItem("isApiAdmin") === "true",
    service: getParsedItem("service"),
    serviceEndpoint: sessionStorage.getItem("serviceEndpoint"),
    serviceKey: sessionStorage.getItem("serviceKey"),
    userData: getParsedItem("userData"),
    userToken: sessionStorage.getItem("userToken")
  };
};

export const StorageContext = React.createContext(getStorage());
