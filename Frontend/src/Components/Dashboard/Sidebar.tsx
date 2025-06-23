import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/tail";

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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    if (!isCollapsed) {
      onToggleCollapse();
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const desktopSidebarCollapsed = !isHovered;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggleCollapse}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        layout
        className={cn(
          "fixed left-0 top-0 h-full bg-white shadow-elegant z-50 flex flex-col hidden lg:flex",
          desktopSidebarCollapsed ? "w-[60px]" : "w-[300px]"
        )}
        onMouseEnter={() => {
          setIsHovered(true);
          onToggleCollapse();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onToggleCollapse();
        }}
        animate={{ width: desktopSidebarCollapsed ? 60 : 300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div
          className={cn(
            "p-6 border-b border-gray-100",
            desktopSidebarCollapsed ? "flex justify-center" : ""
          )}
        >
          <motion.div
            layout
            className={cn(
              "flex items-center",
              desktopSidebarCollapsed
                ? "flex-col gap-5 items-center justify-center"
                : "justify-between"
            )}
          >
            <motion.div
              layout
              className={cn(
                "flex items-center space-x-3",
                desktopSidebarCollapsed ? "flex-col space-y-2 space-x-0" : ""
              )}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <AnimatePresence mode="wait">
                {!desktopSidebarCollapsed && (
                  <motion.div
                    key="greenwatt-title"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-pre"
                  >
                    <h1 className="text-xl font-bold text-text">GreenWatt</h1>
                    <p className="text-sm text-gray-500">Energy Tracker</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id} className="relative h-[56px]">
                  {" "}
                  {/* Added fixed height */}
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "group relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left nav-link transition-colors duration-200 overflow-hidden",
                      isActive ? "text-white" : "text-text",
                      isActive ? "" : "hover:bg-accent hover:text-text",
                      desktopSidebarCollapsed
                        ? "justify-center space-x-0 flex-col items-center gap-1"
                        : ""
                    )}
                    title={desktopSidebarCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeLinkHighlight"
                        className="absolute inset-0 rounded-full bg-primary -z-1"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.4,
                        }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                    <AnimatePresence mode="wait">
                      {!desktopSidebarCollapsed && (
                        <motion.span
                          key={item.id + "-label"}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="font-medium whitespace-pre text-sm relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 overflow-hidden">
          <button
            onClick={handleLogout}
            className={cn(
              "relative w-full flex items-center space-x-3 px-4 py-3 rounded-full text-white hover:bg-red-600 transition-all duration-200 hover-scale h-[56px]", // Added fixed height and relative
              desktopSidebarCollapsed
                ? "justify-center space-x-0 flex-col items-center gap-1"
                : ""
            )}
            title="Logout"
          >
            <motion.div // Animated background
              layout
              className="absolute inset-0 bg-red-500 rounded-full -z-1"
              animate={{ width: desktopSidebarCollapsed ? 'auto' : '100%' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <LogOut className="w-5 h-5 relative z-10" />
            <AnimatePresence mode="wait">
              {!desktopSidebarCollapsed && (
                <motion.span
                  key="logout-label"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium whitespace-pre text-sm relative z-10"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed h-full w-full inset-0 bg-white p-10 z-[100] flex flex-col justify-between lg:hidden"
          >
            <button
              onClick={onToggleCollapse}
              className="absolute right-10 top-10 z-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <li key={item.id} className="relative h-[56px]">
                      {" "}
                      {/* Added fixed height */}
                      <button
                        onClick={() => {
                          onSectionChange(item.id);
                          onToggleCollapse();
                        }}
                        className={cn(
                          "group relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left nav-link transition-colors duration-200 overflow-hidden",
                          isActive ? "text-white" : "text-text",
                          isActive ? "" : "hover:bg-accent hover:text-text"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveLinkHighlight"
                            className="absolute inset-0 rounded-xl bg-primary z-[-1]"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.4,
                            }}
                          />
                        )}
                        <Icon className="w-5 h-5 relative z-10" />
                        <span className="font-medium relative z-10">
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 hover-scale h-[56px]" // Added fixed height
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          `fixed top-4 left-4 z-60 lg:hidden p-3 bg-white rounded-xl shadow-card transition-all duration-300 hover-scale`,
          !isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Menu className="w-6 h-6 text-text" />
      </button>
    </>
  );
};

export default Sidebar;