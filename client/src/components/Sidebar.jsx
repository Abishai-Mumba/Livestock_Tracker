import React, { useState } from 'react'

export default function Sidebar({ children, tooltips = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className='absolute z-1000 shadow-lg rounded-xl bg-[#78a3e4] p-3 mx-2 left-0 -translate-x-6 h-50 top-1/3 -translate-y-1/2 rounded-3xl
            flex flex-col justify-center items-center text-white'>
      {children && children.map((icon, i) => (
        <SideBarIcon
          icon={icon}
          key={i}
          text={tooltips[i] || "tooltip 💡"}
          active={activeIndex === i}
          onClick={() => setActiveIndex(i)}
        />
      ))}
    </div>
  );
}

function SideBarIcon({ icon, text = "tooltip 💡", active, onClick }) {
  return (
    <div
      className={`sidebar-icon group cursor-pointer ${active ? "bg-[#41577975]" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span className="sidebar-tooltip group-hover:scale-100">
        {text}
      </span>
    </div>
  );
}
