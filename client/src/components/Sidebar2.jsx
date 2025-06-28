import {createContext, useContext, useState} from 'react'
import { CircleUserRound, MoreVertical, PanelRightOpen, PanelLeftOpen, AlignJustify, X} from 'lucide-react'
import image from '../assets/react.svg'
import { useEffect } from 'react';

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  // Determine initial expanded state based on screen size
  const getInitialExpanded = () => {
    if (window.innerWidth >= 1024) return true; // large screens: open
    if (window.innerWidth >= 768) return false; // medium screens: closed
    return false; // small screens: closed (sidebar hidden)
  };

  const [expanded, setExpanded] = useState(getInitialExpanded());
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isDesktop = width >= 768;
      setShowSidebar(isDesktop);
      if (width >= 1024) {
        setExpanded(true); // large: open
        setMenuOpen(false);
      } else if (width >= 768) {
        setExpanded(false); // medium: closed
        setMenuOpen(false);
      } else {
        setExpanded(false); // small: closed
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hamburger menu for mobile (small screens)
  if (!showSidebar) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen z-50">
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="p-4 text-white"
      >
        {menuOpen ? <X className="text-gray-500" size={28} /> : <AlignJustify className="text-gray-500" size={28} />}
      </button>
      {menuOpen && (
        <nav className="flex flex-col items-start p-4">
        <SidebarContext.Provider value={{ expanded: true }}>
          <ul className="flex-1 flex-col px-3">{children}</ul>
        </SidebarContext.Provider>
        </nav>
      )}
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={`w-50 h-screen m-0 flex flex-col bg-gray-900
        text-midnight border-1 border-gray-200 shadow-sm rounded-l-2xl
        hidden md:flex transition-all duration-200`}
    >
      <nav className="h-full flex flex-col bg-white">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src={image}
            alt="logo"
            className={`overflow-hidden transition-all ${expanded ? "w-8" : "w-0"}`}
          />
          <button
            aria-label="Toggle sidebar"
            onClick={() => setExpanded((current) => !current)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? (
              <PanelLeftOpen size={28} className="text-gray-500" />
            ) : (
              <PanelRightOpen size={28} className="text-gray-500" />
            )}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 flex-col px-3">{children}</ul>
        </SidebarContext.Provider>

        <div
          className={`flex justify-between items-center px-4 py-3`}
        >
          <CircleUserRound
            className="text-gray-500"
          />
          {expanded && (
            <>
              <div className="leading-4 ml-3">
                <h4 className="font-semibold">John Doe</h4>
                <span className="text-xs text-gray-600">johndoe@gmail.com</span>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 ml-3" />
            </>
          )}
        </div>
        
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <li
      className={`relative flex items-center px-3 py-2 my-1 rounded-lg cursor-pointer transition-colors group
        ${active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
        }`}
    >
      <span className="text-gray-500">{icon}</span>
      <span
        className={`text-sm text-gray-700 overflow-hidden transition-all
          ${expanded ? "w-52 ml-3" : "w-0"}`}
      >
        {text}
      </span>
      {alert && (
        <span
          className={`absolute top-3 left-0 w-2 h-2 bg-red-500 rounded-full overflow-hidden transition-all
            ${expanded ? "" : "top-2"}`}
        ></span>
      )}
    </li>
  );
}
