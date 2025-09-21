import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <div id="app">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar/>
      <div id="app-content">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Routes>
      </div>
      <Footer/>
    </div>
  );
};

export default App;
