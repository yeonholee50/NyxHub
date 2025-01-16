import React, { useEffect} from "react";
import { Link } from "react-router-dom";
import "./styles/Home.css";
import twitterLogo from './twitterlogo.png'
import { Helmet } from "react-helmet";

const Home = () => {
  useEffect(() => {
    document.title = "Home - LeetCodeTwitter";
  }, []);
  return (
    <div className="home-container">
        <Helmet>
        <link rel="icon" href="./twitterlogo.png" type="image/png" size="16x16"/>
        <title>LeetCode Twitter</title>
        
      </Helmet>
      <img src={twitterLogo} alt="Twitter Logo" className="twitter-logo" />
      <h1>Welcome to LeetCode Twitter</h1>
      <p>Leetcode problem solved: <a href="https://leetcode.com/problems/design-twitter/" target="_blank">Design Twitter</a></p>
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
