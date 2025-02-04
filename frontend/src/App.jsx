import "./Components/Style/style.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Explore from "./Pages/Explore";
import Layout from "./components/Layout/Layout";
import UserPage from "./Pages/UserPage";
import SignupLogin from "./Pages/Signup";
import ProtectedRoute from "./Services/protectedRoute";
import ParentComponent from "./Components/ParentComponent";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Open routes (not protected) */}
          <Route
            path='/signup'
            element={<SignupLogin />}
          />
          <Route
            path='/login'
            element={<SignupLogin />}
          />

          {/* Protected routes */}
          <Route
            path='/'
            element={<ProtectedRoute element={<Home />} />}
          />
          <Route
            path='/explore'
            element={<ProtectedRoute element={<Explore />} />}
          />
          <Route
            path='/user/:userId'
            element={<ProtectedRoute element={<UserPage />} />}
          />
          <Route
            path='/complete-profile'
            element={<ParentComponent />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
