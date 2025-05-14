import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EmailVerification() {
  const [email, setEmail] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // new loading state


  const showMessage = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSendOtp = async () => {
    if (!email) return showMessage("Please enter your email", 'error');
  
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/user/forgot-password', { email });
      if (response.data.success) {
        showMessage("OTP sent to your email", 'success');
        setShowOtp(true);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      console.error(error);
      showMessage(error.response?.data?.message || "Failed to send OTP", 'error');
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) return showMessage("Please enter the complete 6-digit OTP", 'error');

    try {
      const response = await axios.post('http://localhost:8080/user/verify-forgot-otp', {
        email,
        otp: fullOtp,
      });

      if (response.data.success) {
        showMessage("OTP verified. Redirecting to reset password...", 'success');
        setTimeout(() => navigate('/reset-password', { state: { email } }), 1500);
      }
    } catch (error) {
      console.error(error);
      showMessage(error.response?.data?.message || "OTP verification failed", 'error');
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center"
    }}>
      <div style={{
        width: "400px",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ marginBottom: "20px", fontFamily: "Nunito", fontWeight: "bold" }}>
          Verify Your Email
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
          {!showOtp && (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#93c5fd" : "#2563eb",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: "20px"
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}
          
        {message && (
          <p style={{
            color: messageType === 'success' ? "green" : "red",
            fontWeight: "bold",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {message}
          </p>
        )}

        {showOtp && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  style={{
                    width: "40px",
                    height: "40px",
                    textAlign: "center",
                    fontSize: "1.5rem",
                    borderRadius: "5px",
                    border: "1px solid #ccc"
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleVerify}
              style={{
                width: "100%",
                backgroundColor: "#16a34a",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
