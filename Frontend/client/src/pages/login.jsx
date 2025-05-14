import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { logo, bgimage } from "../assets/image/index";
import GoogleSignInButton from "../components/GoogleButton";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!isValidEmail(email)) {
            setMessage("Please enter a valid email address.");
            return;
        }

        setMessage("Logging you in...");
        const loginData = { email, password };

        try {
            const response = await axios.post("http://localhost:8080/user/login", loginData, { withCredentials: true });
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                setMessage("Login successful! Redirecting...");
                setTimeout(() => navigate("/signup"), 2000);
            } else {
                setMessage("Invalid email or password.");
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage("Invalid email or password.");
            } else if (error.response) {
                setMessage(error.response.data.message || "User not found.");
            } else {
                setMessage("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-cover bg-center">
            <div className="flex w-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Left Half - Gradient Background */}
                <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-gradient-to-r from-[#8EC5FC] to-[#e0c3fc]">
                    {/* <img src={logo} alt="Logo" className="w-24 h-24 rounded-full mb-5" /> */}
                    <h2 className="text-white font-bold text-center text-2xl">Welcome Back!</h2>
                </div>
                {/* Right Half - Form Fields */}
                <div className="w-1/2 flex flex-col justify-center p-8 text-center bg-gray-100">
                    <h3 className="font-bold text-[1.8rem] bg-gradient-to-r from-[#8EC5FC] to-[#e0c3fc] bg-clip-text text-transparent">
                        Log in
                    </h3>
                    {message && (
                        <p className={`font-bold mt-2 ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                            {message}
                        </p>
                    )}
                    <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
                        <input
                            type="email"
                            placeholder="Email ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="p-3 rounded border border-gray-300 text-base"
                        />
                        <input
                            type="password"
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="p-3 rounded border border-gray-300 text-base"
                        />
                        <button
                            type="submit"
                            className="p-3 rounded font-bold text-white text-base bg-gradient-to-r from-[#8EC5FC] to-[#e0c3fc] hover:opacity-80 transition-opacity duration-300"
                        >
                            Login
                        </button>
                    </form>
                    <p className="mt-3 text-sm">
                        Don’t have an account?{" "}
                        <span
                            className="text-blue-600 font-bold cursor-pointer"
                            onClick={() => navigate("/signup")}
                        >
                            Sign up
                        </span>
                    </p>
                    <GoogleSignInButton />
                </div>
            </div>
        </div>
    );
}
