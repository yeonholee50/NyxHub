import React from 'react';
import { Link } from 'react-router-dom';
import './styles/NavBar.css';  // Create a corresponding CSS file for styling

const NavBar = () => {
    return (
        <nav className="navbar">
            <h1 className="navbar-brand">NyxHub</h1>
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