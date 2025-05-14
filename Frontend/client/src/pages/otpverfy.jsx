import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const OtpVerifyPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setMessage('No email found. Please go back to the signup page.');
    }
  }, [email]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ''); // only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpValue) => {
    if (!email) {
      setMessage('Email is missing');
      return;
    }

    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/user/otp-verify',
        { email, otp: otpValue },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid OTP, please try again');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
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
          OTP Verification
        </h2>

        <form
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`otp-input-${index}`}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength="1"
                ref={(el) => inputRefs.current[index] = el}
                autoFocus={index === 0}
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

          {loading && <p style={{ color: "blue" }}>Verifying...</p>}
          {message && (
            <p
              style={{
                color: message.toLowerCase().includes('success') ? "green" : "red",
                fontWeight: "bold"
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
