// pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleUpdate = async () => {
    if (!email) return alert("Missing email. Please go through OTP verification again.");
    // if (password.length < 6) return alert("Password too short");
    if (password !== confirm) return alert("Passwords don't match");

    try {
      const response = await axios.put('http://localhost:8080/user/update-password', {
        email,
        password,
      });

      if (response.data.success) {
        alert("Password updated successfully!");
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded-md mb-4"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border px-4 py-2 rounded-md mb-4"
        />
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
