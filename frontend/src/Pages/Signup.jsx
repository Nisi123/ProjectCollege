import { useState } from "react";
import SignupLoginIllustration from "../Media/SignupLogin.jpg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function SignupLogin() {
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (isSignup && !username)) {
      setError("All fields are required.");
      return;
    }

    const url = isSignup
      ? "http://127.0.0.1:8000/users"
      : "http://127.0.0.1:8000/users/login";

    const payload = isSignup
      ? { username, email, password }
      : { email, password };

    try {
      const response = await axios.post(url, payload);
      if (isSignup) {
        alert("Signup successful! You can now log in.");
        setIsSignup(false);

        // Automatically login the user after successful signup
        const userData = {
          username: response.data.username,
          userId: response.data.id,
          email: response.data.email,
          profile_pic: response.data.profile_pic,
        };
        localStorage.setItem("user", JSON.stringify(userData)); // Store user info
        localStorage.setItem("token", response.data.token); // Save token

        // Redirect to user page after signup
        navigate(`/user/${response.data.id}`);
      } else {
        const userData = {
          username: response.data.username,
          userId: response.data.id,
          email: response.data.email,
          profile_pic: response.data.profile_pic,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
      setError(null);
    } catch (err) {
      const errorResponse = err.response?.data || {
        detail: "An error occurred.",
      };
      setError(errorResponse.detail || "An unexpected error occurred.");
    }
  };

  return (
    <div className='signupContainer'>
      <div className='signupFormContainer'>
        <h1>Welcome</h1>
        <p>
          {isSignup ? "Signup below to continue" : "Login below to continue"}
        </p>
        <form
          className='signupForm'
          onSubmit={handleSubmit}
        >
          {isSignup && (
            <input
              maxLength={25}
              type='text'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input
            maxLength={40}
            type='text'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            maxLength={25}
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type='submit'>{isSignup ? "Signup" : "Login"}</button>
        </form>
        {error && (
          <p className='error'>
            {typeof error === "string"
              ? error
              : Array.isArray(error)
              ? error.map((err, index) => <span key={index}>{err.msg}</span>)
              : "An unexpected error occurred."}
          </p>
        )}
        <p>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span>
                <Link
                  to='#'
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignup(false);
                  }}
                >
                  Login
                </Link>
              </span>{" "}
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <span>
                <Link
                  to='#'
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignup(true);
                  }}
                >
                  Signup
                </Link>
              </span>{" "}
            </>
          )}
        </p>
      </div>
      <div className='signupIllustration'>
        <img
          src={SignupLoginIllustration}
          alt='SignUp or Login'
        />
      </div>
    </div>
  );
}

export default SignupLogin;
