import { Route } from "react-router-dom";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </>
  );
}