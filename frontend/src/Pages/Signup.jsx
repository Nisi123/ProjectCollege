import { useState } from "react";
import SignupLoginIllustration from "../Media/SignupLogin.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/users/login", {
        email,
        password,
      });

      const userData = {
        username: response.data.username,
        userId: response.data.id,
        email: response.data.email,
        profile_pic: response.data.profile_pic,
        isAdmin: response.data.isAdmin,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.data.token);

      // Redirect admin users to admin panel, regular users to home
      if (response.data.isAdmin) {
        navigate("/admin");
      } else {
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
        <h1>Welcome Back</h1>
        <p>Login below to continue</p>
        <form
          className='signupForm'
          onSubmit={handleSubmit}
        >
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
          <button type='submit'>Login</button>
        </form>
        {error && <p className='error'>{error}</p>}
      </div>
      <div className='signupIllustration'>
        <img
          src={SignupLoginIllustration}
          alt='Login'
        />
      </div>
    </div>
  );
}

export default Login;
