import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SnackOrderProvider } from "./context/SnackOrderContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SnackOrderProvider>
          <App />
        </SnackOrderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
