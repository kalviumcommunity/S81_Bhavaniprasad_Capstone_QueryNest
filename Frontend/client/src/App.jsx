import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import GoogleSuccess from './components/GoogleSuccess';
import OtpVerifyPage from './pages/otpverfy';
import EmailVerification from './pages/forgotpassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/google-success' element={<GoogleSuccess/>} />
        <Route path='/otp-verfy' element={<OtpVerifyPage/>} />
        <Route path='/forgot' element={<EmailVerification/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App