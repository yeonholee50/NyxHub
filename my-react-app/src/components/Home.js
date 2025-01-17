import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles/Home.css";
import nyxhublogo from './nyxhublogo.png';
import { Helmet } from "react-helmet";

const Home = () => {
  useEffect(() => {
    document.title = "Home - NyxHub";
  }, []);
  return (
    <div className="home-container">
      <Helmet>
        <link rel="icon" href="./nyxhublogo.png" type="image/png" size="16x16"/>
        <title>NyxHub</title>
      </Helmet>
      <img src={nyxhublogo} alt="NyxHub Logo" className="twitter-logo" />
      <h1>Welcome to NyxHub: The Peer-to-Peer File Transfer App</h1>
      <p className="description">
        NyxHub allows peers to send files anonymously through the internet. Enjoy scrambled and secure peer-to-peer file sharing on this platform. Your data is protected and your identity remains confidential.
      </p>
      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;