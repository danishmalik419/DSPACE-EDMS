import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

import { MdDashboard } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoCart } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { BiImport, BiSlider } from "react-icons/bi";
import { IoKey, IoPencil } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { RxActivityLog } from "react-icons/rx";
import { FaUser } from "react-icons/fa";

const Sidebar = ({ userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeParentIndex, setActiveParentIndex] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", icon: <MdDashboard size={28} />, url: "/" },
    ...(userRole !== "LIBRARIAN"
      ? [
          {
            name: "Add",
            icon: <IoMdAddCircleOutline size={28} />,
            subMenu: [
              { name: "New Collection", url: "/newCollection" },
              { name: "New Community", url: "/newCommunity" },
              { name: "E Person", url: "/createUser" },
              { name: "Item", url: "/newItem" },
            ],
          },
          {
            name: "Edit",
            icon: <IoPencil size={28} />,
            subMenu: [
              { name: "Edit Collection", url: "/editCollection" },
              { name: "Edit Community", url: "/editCommunity" },
              { name: "Edit Item", url: "/editItem" },
              { name: "Edit Group", url: "/groups" },
            ],
          },
          { name: "Import", icon: <BiImport size={28} />, url: "/item-batch" },
          { name: "Activity", icon: <RxActivityLog size={24} />, url: "/activityLog" },
          {
            name: "Archived",
            icon: <IoMdAddCircleOutline size={28} />,
            subMenu: [
              { name: "Archived Collections", url: "/archivedCollections" },
              { name: "Archived Communities", url: "/archivedCommunities" },
              { name: "Archived Users", url: "/archivedUsers" },
              { name: "Archived Items", url: "/archivedItems" },
            ],
          },
          { name: "Carousel Panel", icon: <BiSlider size={28} />, url: "/carousel-panel" },
          {
            name: "More",
            icon: <IoMdAddCircleOutline size={28} />,
            subMenu: [
              { name: "Item Key Mappings", url: "/mapping" },
            ],
          },
        ]
      : []),
    { name: "Search", icon: <IoMdSearch size={28} />, url: "/search" },
    ...(userRole === "LIBRARIAN"
      ? [
          { name: "Cart Management", icon: <IoCart size={28} />, url: "/cartManagement" },
          { name: "Notification", icon: <IoMdNotifications size={28} />, url: "/notification" },
          { name: "Request", icon: <FaUser size={24} />, url: "/userRequest" },
        ]
      : []),
    { name: "Access Control", icon: <IoKey size={28} />, url: "/user" },
  ];

  const handleParentClick = (index) => {
    setActiveParentIndex(index);
    setActiveSubIndex(null); // Reset sub-menu selection when clicking a new parent menu
  };

  return (
    <div
      className={`bg-white h-screen  shadow-xl flex flex-col fixed left-0 top-0 transition-all duration-300 z-50 ${
        isExpanded ? "w-72" : "w-20"
      } overflow-y-auto`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Sidebar Logo */}
      <div className="flex items-center py-4 border-b px-5">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 rounded-full cursor-pointer"
            onClick={() => navigate("/")}
          />
          {isExpanded && <span className="ml-4 text-gray-800 font-semibold text-lg">Management</span>}
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="flex flex-col space-y-2 mt-8 px-3">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.subMenu ? (
              <div>
                {/* Main Menu Item (Dropdown Toggle) */}
                <button
                  onClick={() => handleParentClick(index)}
                  className={`flex items-center justify-between p-3 rounded-lg w-full transition-all duration-200 hover:bg-gray-50 ${
                    activeParentIndex === index ? "bg-orange-100" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl text-gray-600">{item.icon}</span>
                    {isExpanded && <span className="ml-4 text-gray-900 font-medium">{item.name}</span>}
                  </div>
                  {isExpanded && (
                    <span className={`transform transition-transform ${activeParentIndex === index ? "rotate-180" : "rotate-0"}`}>
                      ▼
                    </span>
                  )}
                </button>

                {/* Submenu Items */}
                {activeParentIndex === index && (
                  <div className={`transition-all duration-300 ${isExpanded ? "ml-10 space-y-1 visible" : "hidden"}`}>
                    {item.subMenu.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={() => {
                          setActiveParentIndex(index);
                          setActiveSubIndex(subIndex);
                          navigate(subItem.url);
                        }}
                        className={`block py-2 px-3 rounded-lg text-gray-600 hover:text-orange-500 transition-all duration-200 ${
                          activeSubIndex === subIndex ? "bg-orange-200 text-orange-600" : ""
                        }`}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveParentIndex(index);
                  setActiveSubIndex(null);
                  navigate(item.url);
                }}
                className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 ${
                  activeParentIndex === index ? "bg-orange-100 text-orange-600" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-gray-600">{item.icon}</span>
                {isExpanded && <span className="ml-4">{item.name}</span>}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
