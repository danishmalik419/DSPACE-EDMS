import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Store } from "./redux/Store";
import "./index.css";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    {/* <ToastContainer> */}
      <Provider store={Store}>
        <App />
      </Provider>
    {/* </ToastContainer> */}
  </BrowserRouter>
);
