    import React, { useState } from "react";
    import { motion } from "framer-motion";
    import { ImSpinner2 } from "react-icons/im";


    function GoogleButton() {
      const [loading, setLoading] = useState(false);

      const handleGoogleSignIn = () => {
        setLoading(true);
        setTimeout(() => {
          window.location.href = "http://localhost:8080/user/google";
        }, 500); 
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full"
        >
          <motion.button
            onClick={handleGoogleSignIn}
            whileHover={!loading && { scale: 1.03, boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
            whileTap={!loading && { scale: 0.97 }}
            disabled={loading}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex items-center justify-center w-full gap-3 border border-[#dadce0] rounded-md shadow-sm px-6 py-2 bg-white text-[#3c4043] text-sm font-medium transition duration-300 hover:bg-[#f8f9fa] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            style={{
              fontFamily: "Roboto, sans-serif",
            }}
          >
            {loading ? (
              <ImSpinner2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google Logo"
                  className="w-5 h-5 object-contain"
                />
                Sign in with Google
              </>
            )}
          </motion.button>
        </motion.div>
      );
    }


    export default GoogleButton;