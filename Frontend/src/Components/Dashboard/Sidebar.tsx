import React from "react";
import {
  ChartBar,
  File,
  Lightbulb,
  Plug,
  User,
  LogOut,
  Leaf,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ChartBar },
    { id: "data-entry", label: "Data Entry", icon: File },
    { id: "energy-tips", label: "Energy Tips", icon: Lightbulb },
    { id: "appliances", label: "Appliances", icon: Plug },
    { id: "profile", label: "Profile", icon: User },
  ];

  const navigate = useNavigate()

  const handleLogout = ()=>{
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50  z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-full bg-white shadow-elegant z-50 transition-all duration-300 ease-in-out
        ${
          isCollapsed
            ? "-translate-x-full lg:translate-x-0 lg:w-20"
            : "translate-x-0 w-80 lg:w-80"
        }
        animate-slide-in-left flex flex-col
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div
            className={`${
              isCollapsed
                ? "flex flex-col gap-5"
                : "flex items-center justify-between"
            }`}
          >
            {/* Logo + Title */}
            {isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className={`hidden lg:block p-2 rounded-lg hover:bg-accent transition-colors `}
                title={isCollapsed && "Collapse Sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="text-xl font-bold text-dark-accent">
                    GreenWatt
                  </h1>
                  <p className="text-sm text-gray-500">Energy Tracker</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-lg hover:bg-accent transition-colors "
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Mobile Close */}
            <button
              onClick={onToggleCollapse}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-6 border-b border-gray-100 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-primary to-green-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">JD</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">John Doe</h3>
                <p className="text-sm text-gray-500">john.doe@example.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li
                  key={item.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left nav-link
                      ${
                        isActive
                          ? "bg-light-bg text-green-primary shadow-sm"
                          : "text-gray-600 hover:text-green-primary hover:bg-light-bg"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-green-primary" : ""
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
          onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl
              bg-red-500 text-white hover:bg-red-600 transition-all duration-200 hover-scale
              ${isCollapsed ? "justify-center" : ""}
            `}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile menu open */}
      <button
        onClick={onToggleCollapse}
        className={`
          fixed top-4 left-4 z-60 lg:hidden p-3 bg-white rounded-xl shadow-card
          transition-all duration-300 hover-scale
          ${!isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        <Menu className="w-6 h-6 text-text-primary" />
      </button>
    </>
  );
};

export default Sidebar;
