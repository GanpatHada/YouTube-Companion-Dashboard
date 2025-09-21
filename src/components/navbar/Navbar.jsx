import { useEffect } from "react";
import "./Navbar.css";
import { useUser } from "../../contexts/UserContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { state, dispatch } = useUser();

  console.log(state.user)

  useEffect(() => {
    // Load Google SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const token = localStorage.getItem("yt_access_token");
      if (token) {
        fetchUserProfile(token);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchUserProfile = async (token) => {
  try {
    dispatch({ type: "SET_LOADING", payload: true });

    // Fetch basic user info
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Invalid or expired token");
    const data = await res.json();

    // Fetch YouTube channel ID
    const ytRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const ytData = await ytRes.json();
    const channelId = ytData.items?.[0]?.id || null;

    // Save user info + channelId in context
    dispatch({ type: "SET_USER", payload: { ...data, channelId } });
  } catch (err) {
    console.error("Failed to fetch user info", err);
    localStorage.removeItem("yt_access_token");
    dispatch({ type: "SET_LOADING", payload: false });
  }
};


  const handleLogin = () => {
    if (window.google && window.google.accounts) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id:
          "716655971200-bs1bujuagophggrmicr7jmn97h4ojegs.apps.googleusercontent.com",
        scope:
          "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.profile",
        callback: (response) => {
          if (response.access_token) {
            localStorage.setItem("yt_access_token", response.access_token);
            fetchUserProfile(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } else {
      alert("Google SDK not loaded yet.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("yt_access_token");
    dispatch({ type: "CLEAR_USER" });
  };

  return (
  <nav id="navbar">
    <h3 id="logo"><Link to={"/"}>Ycd</Link></h3>

    {state.loading ? (
      <span>Loading...</span>
    ) : state.user ? (
      <div className="user-info">
        <span>{state.user.name}</span>
        <img
          src={state.user.picture || "https://i.pravatar.cc/150?img=3"}
          alt={state.user.name || "User Avatar"}
          onError={(e) => {
            e.currentTarget.src = "https://i.pravatar.cc/150?img=3";
          }}
        />
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
