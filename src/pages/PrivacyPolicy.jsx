import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <p>
        Your privacy is important to us. This Privacy Policy explains how we
        collect, use, and protect your information when you use our website.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We may collect information such as your Google profile details (name,
        email, profile picture) when you log in with Google OAuth. We do not
        sell or share your personal information with third parties.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To authenticate your account and provide access to features</li>
        <li>To improve our services and user experience</li>
        <li>To display your YouTube data (comments, videos, etc.) securely</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We use secure methods to store and protect your data. However, no
        transmission over the internet is 100% secure.
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

export default PrivacyPolicy;
