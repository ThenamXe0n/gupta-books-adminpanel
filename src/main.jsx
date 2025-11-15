import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./redux/store";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
      <StrictMode>
  <Provider store={store}>
    <Toaster position="top-center" reverseOrder={false} />
        <App />
  </Provider>
      </StrictMode>
    </BrowserRouter>
);
