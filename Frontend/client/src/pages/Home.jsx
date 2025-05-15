import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const API = 'http://localhost:8080/ask/questions';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null); // ✅ preview state
  const [sender, setSender] = useState('');
  const [changed, setChanged] = useState(false);
  const [Role, setRole] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(API)
      .then(res => {
        setQuestions(res.data.questions);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch questions. Please try again later.');
        setQuestions([]);
      });
  }, [changed]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setSender(decoded.id);
        setRole(decoded.role);
      } catch (error) {
        setError('Invalid token. Please log in again.');
      }
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleUpvote = async (id) => {
    try {
      await axios.put(`${API}/upvote/${id}`, { id: sender }, {
        withCredentials: true
      });
      setChanged(!changed);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to upvote. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/delete/${id}`, {
        withCredentials: true
      });
      setChanged(!changed);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete question.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('sender', sender);
    if (photo) {
      formData.append('photo', photo);
    }

      try {
        await axios.post(API, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });

        setShowForm(false);
        setTitle('');
        setContent('');
        setPhoto(null);
        setPhotoPreview(null); // ✅ clear preview
        setError('');
        window.location.reload();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to post the question. Please try again.');
      }
  };

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">All Questions</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        Post a Question
      </button>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-xl font-bold text-gray-700 hover:text-red-500"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Post a New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setPhoto(file);
                  if (file) {
                    setPhotoPreview(URL.createObjectURL(file));
                  } else {
                    setPhotoPreview(null);
                  }
                }}
                className="w-full border px-3 py-2 rounded"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded border mb-2"
                />
              )}
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {questions && questions.map(q => (
        <div key={q._id} className="border p-4 mb-4 rounded shadow">
          {q.photo && (
            <img
              src={`http://localhost:8080/uploads/questions/${q.photo}`}
              alt="Question"
              className="w-full h-64 object-cover rounded mb-2"
            />
          )}
          <h2 className="text-xl font-semibold">{q.title}</h2>
          <p>{q.content}</p>
          <div className="flex justify-between mt-2 items-center">
            <span className="text-sm text-gray-500">By {q.sender?.name || 'Unknown'}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpvote(q._id)}
                className="text-sm bg-green-500 text-white px-2 py-1 rounded"
              >
                👍 {q.upvote.length}
              </button>
              {Role.includes('admin') && (
                <button
                  onClick={() => handleDelete(q._id)}
                  className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
