import "./Components/Style/style.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/about";
import Explore from "./Pages/Explore";
import Layout from "./components/Layout/Layout";
import UserPage from "./Pages/UserPage";

function App() {
  const username = "Sushant"; // Example username
  const userId = "67793573326ef0dd8d22cb11"; // Example userId
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
