import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faEdit, faTrash, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_URL}/posts`);
        setPosts(response.data);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) setUserName(storedUserName);

    fetchPosts();
  }, [API_URL]);

  const addPost = async () => {
    if (!newPost.trim()) return;
    setError("");
    try {
      const response = await axios.post(`${API_URL}/posts`, { content: newPost.trim() });
      setPosts([...posts, response.data]);
      setNewPost("");
    } catch (err) {
      setError("Failed to add a new post. Please try again.");
    }
  };

  const editPost = (id) => {
    const postToEdit = posts.find((post) => post.id === id);
    if (postToEdit) setEditingPost(postToEdit);
  };

  const saveEditPost = async () => {
    if (!editingPost?.content.trim()) return;
    setError("");
    try {
      const response = await axios.put(`${API_URL}/posts/${editingPost.id}`, {
        content: editingPost.content.trim(),
      });
      setPosts(posts.map((post) => (post.id === editingPost.id ? response.data : post)));
      setEditingPost(null);
    } catch (err) {
      setError("Failed to update the post. Please try again.");
    }
  };

  const deletePost = async (id) => {
    setError("");
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (err) {
      setError("Failed to delete the post. Please try again.");
    }
  };

  const addLike = async (id) => {
    setError("");
    try {
      const response = await axios.put(`${API_URL}/posts/${id}/like`);
      setPosts(posts.map((post) => (post.id === id ? response.data : post)));
    } catch (err) {
      setError("Failed to like the post. Please try again.");
    }
  };

  const addComment = async (id, comment) => {
    if (!comment.trim()) return;
    setError("");
    try {
      const response = await axios.post(`${API_URL}/posts/${id}/comments`, { comment: comment.trim() });
      setPosts(posts.map((post) => (post.id === id ? response.data : post)));
    } catch (err) {
      setError("Failed to add a comment. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("userName");
    setUserName("");
    navigate("/");
  };

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1>TinBooker</h1>
        {userName && <span>Welcome, {userName}</span>}
        <input
          type="text"
          placeholder="หาอะไรค้าาา"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={logout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>

      <div className="main">
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="feed">
            <div className="create-post">
              <textarea
                placeholder="คุณพี่คิดอะไรอยู่ค้าาา"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <button onClick={addPost}>โพสต์</button>
            </div>

            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="post">
                  {editingPost?.id === post.id ? (
                    <>
                      <textarea
                        value={editingPost.content}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, content: e.target.value })
                        }
                      />
                      <button onClick={saveEditPost}>Save</button>
                      <button onClick={() => setEditingPost(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <p>{post.content}</p>
                      <div className="post-actions">
                        <button onClick={() => addLike(post.id)}>
                          <FontAwesomeIcon icon={faThumbsUp} /> Like ({post.likes || 0})
                        </button>
                        <button onClick={() => editPost(post.id)}>
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button onClick={() => deletePost(post.id)}>
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addComment(post.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <div className="comments">
                        {post.comments?.map((comment, index) => (
                          <p key={index} className="comment">
                            {comment}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Not Founds.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
