import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

import { AuthProvider } from "./auth/AuthContext";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import NotificationsHost from "./components/NotificationsHost";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <App />
        <NotificationsHost />
      </NotificationsProvider>
    </AuthProvider>
  </React.StrictMode>
);
