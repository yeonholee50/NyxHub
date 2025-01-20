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
                    <p>NyxHub is a secure web file sharing application designed to provide a safe, efficient, and user-friendly method for sharing files. Unlike traditional methods such as email, P2P sharing, or USB drives, NyxHub offers several advantages:</p>
                    <ul>
                        <li><strong>Security:</strong> NyxHub includes encryption and secure access controls to protect sensitive data from being intercepted or accessed by unauthorized users.</li>
                        <li><strong>Accessibility:</strong> Files shared through NyxHub can be accessed from anywhere with an internet connection, making it convenient for remote work and collaboration.</li>
                        <li><strong>File Size Limits:</strong> NyxHub can handle larger files without the size restrictions typically found in email attachments.</li>
                        <li><strong>Version Control:</strong> NyxHub includes features for version control, allowing users to keep track of changes to files and collaborate more effectively.</li>
                        <li><strong>User Management:</strong> Administrators can control who has access to specific files or directories, enhancing security and organization.</li>
                        <li><strong>Audit Logs:</strong> NyxHub maintains logs of file access and changes, providing an audit trail for compliance and security purposes.</li>
                        <li><strong>Convenience:</strong> NyxHub allows for asynchronous sharing, enabling users to upload and access files at any time without needing physical transfer or both parties to be online simultaneously.</li>
                        <li><strong>Integration:</strong> NyxHub can potentially integrate with other tools and services, providing a seamless workflow for users who need to share files as part of a larger process.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default About;