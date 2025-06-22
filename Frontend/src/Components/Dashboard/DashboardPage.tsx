import { useState } from "react";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <MainContent onSectionChange={handleSectionChange} activeSection={activeSection} isCollapsed={isCollapsed} />
    </div>
  );
};

export default Index;
