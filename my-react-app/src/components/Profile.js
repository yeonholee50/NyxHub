import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Profile.css";  // Imports Profile.css

const global_link = "https://nyxhub.onrender.com/";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [file, setFile] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profile - NyxHub";
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Unauthorized. Please log in.");
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      
      try {
        const config = {
          headers: { 
            token: token,
          },
        };
        console.log("config received");
        const profileResponse = await axios.get(`${global_link}profile`, config);
        console.log("profileResponse");
        const filesResponse = await axios.get(`${global_link}received_files`, config);
        console.log("filesResponse");

        setUserData(profileResponse.data);
        setReceivedFiles(filesResponse.data);
      } catch (error) {
        setMessage(error.response?.data?.detail || "Failed to load profile or files.");
        localStorage.removeItem("token");
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleFileUpload = async () => {
    if (!recipientUsername || !file) {
      setMessage("Please enter a username and select a file.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("recipient_username", recipientUsername);
    formData.append("file", file);

    try {
      const config = {
        headers: {
          token: token,
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post(`${global_link}send_file`, formData, config);
      setMessage("File sent successfully!");
      setRecipientUsername("");
      setFile(null);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to send file.");
    }
  };

  return (
    <div className="profile-container">
      <h1>Welcome, {userData?.username}</h1>
      {message && <p className="message">{message}</p>}

      <div className="file-send-section">
        <h2>Send a File</h2>
        <input
          type="text"
          placeholder="Recipient Username"
          value={recipientUsername}
          onChange={(e) => setRecipientUsername(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleFileUpload}>Send File</button>
      </div>

      <div className="received-files-section">
        <h2>Received Files</h2>
        {receivedFiles.length > 0 ? (
          <ul>
            {receivedFiles.map((file, index) => (
              <li key={index}>
                <a href={`${global_link}download/${file.id}`} download>{file.filename}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files received.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;