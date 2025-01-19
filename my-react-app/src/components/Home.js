import React, { useEffect } from "react";
import "./styles/Home.css";
import { Helmet } from "react-helmet";
import NavBar from './NavBar';
import Spiral from './Spiral';

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
      
      <div className="home-container">
            <NavBar />  {/* NavBar component included here */}
            <h1>Welcome to NyxHub</h1>
            <p>Securely share your files with ease.</p>
            <Spiral />  {/* Spiral component included here */}
      </div>
      
    </div>
  );
};

export default Home;