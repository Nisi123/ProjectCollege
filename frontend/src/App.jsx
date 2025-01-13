import "./Components/Style/style.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/about";
import Explore from "./Pages/Explore";
import Layout from "./components/Layout/Layout";
import UserPage from "./Pages/UserPage";
import SignUp from "./Pages/Signup";
import Login from "./Pages/Login";

function App() {
  const username = "Shyam";
  const userId = "678541cab374690a1a846106";
  return (
    <Router>
      <Layout
        username={username}
        userId={userId}
      >
        <Routes>
          <Route
            exact
            path='/'
            element={<Home />}
          />
          <Route
            path='/about'
            element={<About />}
          />
          <Route
            path='/explore'
            element={<Explore />}
          />
          <Route
            path='/user/:userId'
            element={<UserPage />}
          />
          <Route
            path='/signup'
            element={<SignUp />}
          />
          <Route
            path='/login'
            element={<Login />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
