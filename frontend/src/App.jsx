import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home/home";
import About from "./Pages/About/about";
import Explore from "./Pages/Explore/explore";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
