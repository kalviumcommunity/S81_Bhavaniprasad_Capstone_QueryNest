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
    const value = e.target.value.replace(/\D/, '');
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
    <div className="flex items-center justify-center h-screen w-screen bg-cover bg-no-repeat bg-center">
      <div className="w-[400px] bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h2 className="mb-5 font-nunito font-bold text-2xl">OTP Verification</h2>

        <form
          className="flex flex-col items-center gap-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`otp-input-${index}`}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                autoFocus={index === 0}
                className="w-10 h-10 text-center text-2xl rounded border border-gray-300"
              />
            ))}
          </div>

          {loading && <p className="text-blue-600">Verifying...</p>}
          {message && (
            <p
              className={`font-bold ${
                message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
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
