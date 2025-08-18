import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { VideoProvider } from "./contexts/VideoContext.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <VideoProvider>
        <App />
      </VideoProvider>
    </UserProvider>
  </BrowserRouter>
);
