import React from "react";
import Dashboard from "./Dashboard";
import DataEntry from "./DataEntry";
import EnergyTips from "./EnergyTips";
import Appliances from "./Appliances";
import Profile from "./Profile";

interface MainContentProps {
  activeSection: string;
  isCollapsed: boolean;
  onSectionChange: (section: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeSection,
  isCollapsed,
  onSectionChange,
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard onSectionChange={onSectionChange} />;
      case "data-entry":
        return <DataEntry />;
      case "energy-tips":
        return <EnergyTips />;
      case "appliances":
        return <Appliances />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard onSectionChange={onSectionChange} />;
    }
  };

  return (
    <main className={`
      flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out
      ${isCollapsed ? "lg:ml-[60px]" : "lg:ml-[300px]"}
      bg-gray-50
    `}
    >
      <div className="p-6 lg:p-8">{renderContent()}</div>
    </main>
  );
};

export default MainContent;
