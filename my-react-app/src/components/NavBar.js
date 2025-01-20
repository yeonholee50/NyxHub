import React from 'react';
import { Link } from 'react-router-dom';
import './styles/NavBar.css';  // Create a corresponding CSS file for styling
import logo from './nyxhublogo.png';  // Update the path to your logo image

const NavBar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="NyxHub Logo" className="navbar-logo" />
                </Link>
                <Link to="/">
                    <h1>NyxHub</h1>
                </Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/how-to-use">How to Use</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;