import React from "react";

const getStorage = () => {
  return {
    backendEndpoint: localStorage.getItem("backendEndpoint"),
    isApiAdmin: JSON.parse(localStorage.getItem("isApiAdmin")),
    service: JSON.parse(localStorage.getItem("service")),
    serviceEndpoint: localStorage.getItem("serviceEndpoint"),
    serviceKey: localStorage.getItem("serviceKey"),
    userData: JSON.parse(localStorage.getItem("userData")),
    userToken: localStorage.getItem("userToken")
  };
};

export const StorageContext = React.createContext(getStorage());
