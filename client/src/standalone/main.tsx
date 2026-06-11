import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import * as localApi from "./localApi";
import "../index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App api={localApi} standalone />
  </React.StrictMode>
);
