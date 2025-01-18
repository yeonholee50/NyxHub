import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles/Home.css";
import nyxhublogo from './nyxhublogo.png';
import { Helmet } from "react-helmet";
import NavBar from './NavBar';  // Import the NavBar component
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
      <img src={nyxhublogo} alt="NyxHub Logo" className="nyxhublogo" />
      
      <div className="home-container">
            <NavBar />  {/* NavBar component included here */}
            <h1>Welcome to NyxHub</h1>
            <p>Securely share your files with ease.</p>
      </div>
      
    </div>
  );
};

export default Home;