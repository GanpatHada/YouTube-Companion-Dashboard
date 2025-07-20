import { useEffect, useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // On reload, check localStorage for accessToken and fetch user info
    const token = localStorage.getItem('yt_access_token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      setUser(data); // contains name, picture, email etc.
    } catch (err) {
      console.error('Failed to fetch user info', err);
      localStorage.removeItem('yt_access_token');
    }
  };

  const handleLogin = () => {
    if (window.google) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: '716655971200-bs1bujuagophggrmicr7jmn97h4ojegs.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.profile',
        callback: (response) => {
          if (response.access_token) {
            localStorage.setItem('yt_access_token', response.access_token);
            fetchUserProfile(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } else {
      alert('Google SDK not loaded yet.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('yt_access_token');
    setUser(null);
  };

  return (
    <nav id="navbar">
      <h3 id="logo">MyVideo</h3>
      {user ? (
        <div className="user-info">
          <img
            src={user.picture}
            alt={user.name}
            style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8 }}
          />
          <span>{user.name}</span>
          <button onClick={handleLogout} style={{ marginLeft: 10 }}>
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </nav>
  );
};

export default Navbar;
