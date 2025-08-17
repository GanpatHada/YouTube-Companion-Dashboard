import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { VideoProvider } from "./contexts/VideoContext.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <VideoProvider>
      <App />
    </VideoProvider>
  </UserProvider>
);
