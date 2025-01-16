import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Profile.css";

// Define the base URL as a constant
const global_link = "https://design-twitter.onrender.com/";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [feed, setFeed] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [tweetContent, setTweetContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Profile - LeetCodeTwitter";
  }, [])
  useEffect(() => {
    
    const token = localStorage.getItem("token");

    // If no token, redirect to login
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

        const profileResponse = await axios.get(`${global_link}profile`, config);
        const feedResponse = await axios.get(`${global_link}feed`, config);

        setUserData(profileResponse.data);
        setFeed(feedResponse.data);
      } catch (error) {
        if (error.response?.status === 401) {
          setMessage("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setMessage(error.response?.data?.detail || "Failed to load profile or feed.");
        }
      }
    };

    fetchProfileData();

    // Set up interval to refresh feed every 10 seconds
    const intervalId = setInterval(fetchProfileData, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);

  }, [navigate]);

  const handleSearch = async () => {
    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          token: token,
        },
      };
      const response = await axios.get(
        `${global_link}search?prefix=${searchQuery}`,
        config
      );

      setSearchResults(response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Search failed.");
    }
  };

  const handleTweet = async () => {
    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          token: token,
        },
      };

      const tweetData = {
        content: tweetContent,
      };

      await axios.post(
        `${global_link}tweet`,
        tweetData,
        config
      );
      setMessage("Tweet posted!");
      setTweetContent(""); // Clear the tweet input
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to post tweet.");
    }
  };

  const handleFollow = async (targetUsername) => {
    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          token: token,
        },
      };

      await axios.post(
        `${global_link}follow`,
        { target_username: targetUsername },
        config
      );
      setMessage(`Followed ${targetUsername}`);
      // Update search results to reflect the follow status
      const updatedResults = searchResults.map(user => 
        user.username === targetUsername ? { ...user, is_following: true } : user
      );
      setSearchResults(updatedResults);
    } catch (error) {
      setMessage(error.response?.data?.detail || `Failed to follow ${targetUsername}`);
    }
  };

  const handleUnfollow = async (targetUsername) => {
    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          token: token,
        },
      };

      await axios.post(
        `${global_link}unfollow`,
        { target_username: targetUsername },
        config
      );
      setMessage(`Unfollowed ${targetUsername}`);
      // Update search results to reflect the unfollow status
      const updatedResults = searchResults.map(user => 
        user.username === targetUsername ? { ...user, is_following: false } : user
      );
      setSearchResults(updatedResults);
    } catch (error) {
      setMessage(error.response?.data?.detail || `Failed to unfollow ${targetUsername}`);
    }
  };

  return (
    <div className="profile-container">
      <h1>Welcome, {userData?.username}</h1>
      {message && <p className="error-message">{message}</p>}

      <div className="tweet-section">
        <h2>Create a Tweet</h2>
        <textarea
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button onClick={handleTweet}>Tweet</button>
      </div>

      <div className="search-section">
        <h2>Search</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username"
        />
        <button onClick={handleSearch}>Search</button>
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((user, index) => (
              <li key={index} className="search-item">
                <span className="username">{user.username}</span>
                {user.is_following ? (
                  <button
                    className="unfollow-button"
                    onClick={() => handleUnfollow(user.username)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="follow-button"
                    onClick={() => handleFollow(user.username)}
                  >
                    Follow
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="feed-section">
        <h2>Your Feed</h2>
        {feed.length > 0 ? (
          <ul>
            {feed.map((post, index) => (
              <li key={index}>
                <strong>{post.username}:</strong> {post.content}
                <br />
                <small>{new Date(post.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts to show.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;