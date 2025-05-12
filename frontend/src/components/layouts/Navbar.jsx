import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../assets/logo.jpg";

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");

    if (token && userName) {
      setUser(userName);
      setRole(userRole);
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${import.meta.env.VITE_API_URL}/user/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Clear user data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    setIsOpen(false);

    // Dispatch custom event to notify Layout to hide sidebar
    window.dispatchEvent(new Event("roleUpdated"));

    // Call the parent component's logout function (Layout)
    if (onLogout) {
      onLogout();
    }

    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm py-3 px-6 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between items-center">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10 ml-28 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Right - Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm text-gray-500">
          {["COMMUNITIES & COLLECTIONS"].map((item, index) => (
            <a
              key={index}
              href="/communityList"
              className="relative uppercase font-medium hover:text-orange-600 flex items-center 
                         after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
                         after:w-0 after:h-[2px] after:bg-orange-500 after:transition-all after:duration-300
                         hover:after:w-full"
            >
              {item}
            </a>
          ))}

          {role === "ADMIN" && (
            <a
              href="/metadataRegistry"
              className="text-gray-500 hover:text-orange-600 uppercase font-medium flex items-center 
               relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
               after:w-0 after:h-[2px] after:bg-orange-500 after:transition-all after:duration-300
               hover:after:w-full"
            >
              METADATA
            </a>
          )}

          {role === "USER" && (
            <a
              href="/cart"
              className="text-gray-500 hover:text-orange-600 uppercase font-medium flex items-center 
                         relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
                         after:w-0 after:h-[2px] after:bg-orange-500 after:transition-all after:duration-300
                         hover:after:w-full"
            >
              CART
            </a>
          )}

          {user ? (
            <div className="relative">
              <button
                className="text-gray-500 hover:text-orange-600 uppercase font-medium flex items-center"
                onClick={() => setIsOpen(!isOpen)}
              >
                {user}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div
                className={`absolute right-0 mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all z-50 
                ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-[-10px] pointer-events-none"}`}
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 transition-all"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>

            </div>
          ) : (
            <a
              href="/login"
              className="text-gray-500 hover:text-orange-600 uppercase font-medium flex items-center
                         relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
                         after:w-0 after:h-[2px] after:bg-orange-500 after:transition-all after:duration-300
                         hover:after:w-full"
            >
              LOG IN
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
