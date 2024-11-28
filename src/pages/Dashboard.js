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
  const navigate = useNavigate(); 

  useEffect(() => {
    
    axios.get("http://localhost:5000/posts").then((response) => {
      setPosts(response.data);
    });

    
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const addPost = () => {
    if (!newPost.trim()) return;
    axios
      .post("http://localhost:5000/posts", { content: newPost.trim() })
      .then((response) => {
        setPosts([...posts, response.data]);
        setNewPost("");
      });
  };

  const editPost = (id) => {
    const postToEdit = posts.find((post) => post.id === id);
    if (postToEdit) setEditingPost(postToEdit);
  };

  const saveEditPost = () => {
    axios
      .put(`http://localhost:5000/posts/${editingPost.id}`, {
        content: editingPost.content,
      })
      .then((response) => {
        const updatedPosts = posts.map((post) =>
          post.id === editingPost.id ? response.data : post
        );
        setPosts(updatedPosts);
        setEditingPost(null);
      });
  };

  const deletePost = (id) => {
    axios.delete(`http://localhost:5000/posts/${id}`).then(() => {
      setPosts(posts.filter((post) => post.id !== id));
    });
  };

  const addLike = (id) => {
    axios.put(`http://localhost:5000/posts/${id}/like`).then((response) => {
      const updatedPosts = posts.map((post) =>
        post.id === id ? response.data : post
      );
      setPosts(updatedPosts);
    });
  };

  const addComment = (id, comment) => {
    if (!comment.trim()) return;
    axios
      .post(`http://localhost:5000/posts/${id}/comments`, { comment })
      .then((response) => {
        const updatedPosts = posts.map((post) =>
          post.id === id ? response.data : post
        );
        setPosts(updatedPosts);
      });
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
        {userName && <span>Welcome, {userName}</span>} {}
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
                        setEditingPost({
                          ...editingPost,
                          content: e.target.value,
                        })
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
                        <FontAwesomeIcon icon={faThumbsUp} /> Like ({post.likes})
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
                      {post.comments.map((comment, index) => (
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
      </div>
    </div>
  );
};

export default Dashboard;
