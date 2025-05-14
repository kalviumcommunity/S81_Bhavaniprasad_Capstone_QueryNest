import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EmailVerification() {
  const [email, setEmail] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    <div className="flex items-center justify-center h-screen w-screen bg-cover bg-no-repeat bg-center">
      <div className="w-[400px] bg-white rounded-lg shadow-xl p-8 flex flex-col items-center">
        <h2 className="mb-5 font-nunito font-bold text-xl">
          Verify Your Email
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-5 rounded border border-gray-300"
        />

        {!showOtp && (
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className={`w-full py-2 mb-5 rounded font-bold text-white ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        )}

        {message && (
          <p
            className={`font-bold mb-5 text-center ${
              messageType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        {showOtp && (
          <>
            <div className="flex gap-2 mb-5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  className="w-10 h-10 text-center text-xl rounded border border-gray-300"
                />
              ))}
            </div>
            <button
              onClick={handleVerify}
              className="w-full py-2 rounded font-bold text-white bg-green-600 hover:bg-green-700"
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
