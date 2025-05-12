import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || ""); 

  useEffect(() => {
    const updateRole = () => {
      const newRole = localStorage.getItem("role") || "";
      setRole(newRole);

      // ✅ Auto Reload when role changes
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    window.addEventListener("storage", updateRole);
    window.addEventListener("roleUpdated", updateRole);

    return () => {
      window.removeEventListener("storage", updateRole);
      window.removeEventListener("roleUpdated", updateRole);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setRole(""); 
    window.dispatchEvent(new Event("roleUpdated"));

    // ✅ Auto Reload after Logout
    setTimeout(() => {
      window.location.reload();
      navigate("/login");
    }, 100);
  };

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(handleLogout, 15 * 60 * 1000); // 15 minutes
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // Start timer when component mounts

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Navbar onLogout={handleLogout} />
      <div className="flex flex-1">
        {(role === "ADMIN" || role === "LIBRARIAN") && <Sidebar userRole={role} />}
        <div className="flex-1">
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
