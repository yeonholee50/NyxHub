import React from 'react';
import './styles/About.css';
import NavBar from './NavBar';

const About = () => {
    return (
        <div>
            <NavBar />
            <h2>NyxHub</h2>
            
            <div className="about-container">
                <div className="notepad">
                    <h1>About NyxHub</h1>
                    <p>NyxHub is a secure web file sharing application designed to make file sharing easy and secure. Here are the steps to get started:</p>
                    <ul>
                        <li><strong>Sign Up:</strong> First, create an account on NyxHub by signing up with your email and creating a username and password.</li>
                        <li><strong>Communicate with Your Peer:</strong> Share your username with the person you want to communicate with and get their username as well. This will allow you to send files to each other.</li>
                        <li><strong>Login:</strong> After signing up, use your credentials to log in to NyxHub.</li>
                        <li><strong>Attach Your File:</strong> Once logged in, you can attach a file (media, PDF, Word document, text file, PNG, etc.) and send it to your peer. The file will appear in their account the next time they log in.</li>
                        <li><strong>Store Files for Yourself:</strong> If you want to store files for yourself, you can send them to your own username. The next time you log in, the files will be there for you.</li>
                    </ul>   
                </div>
            </div>
        </div>
    );
}

export default About;