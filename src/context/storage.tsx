import React from "react";

export const getStorage = () => {
  function getParsedItem(itemName: string) {
    const serviceItem = localStorage.getItem(itemName);
    return serviceItem ? JSON.parse(serviceItem) : serviceItem;
  }

  return {
    backendEndpoint: localStorage.getItem("backendEndpoint"),
    isApiAdmin: localStorage.getItem("isApiAdmin") === "true",
    service: getParsedItem("service"),
    serviceEndpoint: localStorage.getItem("serviceEndpoint"),
    serviceKey: localStorage.getItem("serviceKey"),
    userData: getParsedItem("userData"),
    userToken: localStorage.getItem("userToken")
  };
};

export const StorageContext = React.createContext(getStorage());
