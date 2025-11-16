import React from "react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1>Terms & Conditions</h1>
      <p>
        By accessing and using this website, you agree to the following Terms &
        Conditions. Please read them carefully.
      </p>

      <h2>Use of Service</h2>
      <p>
        You agree to use our website and services only for lawful purposes. You
        must not attempt to hack, misuse, or exploit the platform.
      </p>

      <h2>Google & YouTube Data</h2>
      <p>
        By signing in with Google OAuth, you allow us to access limited YouTube
        data (such as video details, comments, etc.) in accordance with Google’s
        API Services User Data Policy.
      </p>

      <h2>Limitations</h2>
      <p>
        We are not responsible for any damages or losses that result from using
        this service. The platform is provided “as is” without any warranties.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We may update these Terms & Conditions at any time. Continued use of the
        service means you accept the updated terms.
      </p>

      <h2>Contact Us</h2>
      <a 
  href="https://mail.google.com/mail/?view=cm&fs=1&to=hadaganpat42@email.com" 
  target="_blank" 
  rel="noopener noreferrer"
>
  hadaganpat42@email.com
</a>
    </div>
  );
};

export default TermsAndConditions;
