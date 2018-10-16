import React from "react";

export const getStorage = () => {
  return {
    backendEndpoint: localStorage.getItem("backendEndpoint"),
    isApiAdmin: localStorage.getItem("isApiAdmin") === true,
    service: JSON.parse(localStorage.getItem("service")),
    serviceEndpoint: localStorage.getItem("serviceEndpoint"),
    serviceKey: localStorage.getItem("serviceKey"),
    userData: JSON.parse(localStorage.getItem("userData")),
    userToken: localStorage.getItem("userToken")
  };
};

export const StorageContext = React.createContext(getStorage());
