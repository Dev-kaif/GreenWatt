/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Zap,
  Leaf,
  Users,
  AlertCircle,
  Lightbulb,
  TrendingDown,
  IndianRupee,
  Gauge,
  Clock,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { motion, type Variants } from "motion/react";
import axiosInstance from "../../utils/axios";
import { MessageBox } from "../Ui/MessageBox";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);


// Parent container variants for staggered children animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delay between children animations
      delayChildren: 0.2, // Initial delay before children start animating
    },
  },
};

// Variants for individual items within a staggered container
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};


// Variants for the Anomaly Flag
const anomalyVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

interface DashboardProps {
  onSectionChange: (sectionId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSectionChange }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [monthlyConsumptionData, setMonthlyConsumptionData] =
    useState<any>(null);
  const [monthlyChangeData, setMonthlyChangeData] = useState<any>(null);
  const [dailyConsumptionData, setDailyConsumptionData] = useState<any>(null);
  const [, setAllMeterReadings] = useState<any[]>([]); // Raw readings from backend
  const [latestTip, setLatestTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [messageBox, setMessageBox] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [totalMonetarySavings, setTotalMonetarySavings] = useState<
    number | null
  >(null);
  const [totalCo2ReductionOverall, setTotalCo2ReductionOverall] = useState<
    number | null
  >(null);
  const [anomalyFlag, setAnomalyFlag] = useState<boolean>(false); // State for anomaly flag

  // Refs for chart container dimensions
  const chartContainerRefs = {
    monthlyTrend: useRef<HTMLDivElement | null>(null),
    monthlyChange: useRef<HTMLDivElement | null>(null),
    dailyConsumption: useRef<HTMLDivElement | null>(null),
  };

  const [chartHeights, setChartHeights] = useState({
    monthlyTrend: 350,
    monthlyChange: 350,
    dailyConsumption: 350,
  });

  // Function to determine chart height dynamically based on container width
  const getDynamicChartHeight = (
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    if (ref.current) {
      const width = ref.current.offsetWidth;
      if (width < 400) return 250; // Extra small mobile
      if (width < 768) return 300; // Small mobile/tablet
      if (width < 1024) return 350; // Tablet/small desktop
      return 400; // Larger screens
    }
    return 350; // Default fallback
  };

  // --- Fetch All Dashboard Data ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch user profile
      const profileResponse = await axiosInstance.get("/api/profile");
      setUserProfile(profileResponse.data.user);

      // 2. Fetch all meter readings
      const allReadingsResponse = await axiosInstance.get(
        "/api/meter-readings"
      );
      const fetchedReadings = allReadingsResponse.data.readings.sort(
        (a: any, b: any) =>
          new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
      );
      setAllMeterReadings(fetchedReadings);

      // --- Data Aggregation for Charts ---
      // Monthly Summary
      const monthlySummary: {
        [key: string]: {
          totalConsumptionKWH: number;
          totalEmissionCO2kg: number;
          monthStart: Date;
        };
      } = {};
      fetchedReadings.forEach((reading: any) => {
        const date = new Date(reading.readingDate);
        const monthYear = date.toISOString().substring(0, 7);
        if (!monthlySummary[monthYear]) {
          monthlySummary[monthYear] = {
            totalConsumptionKWH: 0,
            totalEmissionCO2kg: 0,
            monthStart: new Date(date.getFullYear(), date.getMonth(), 1),
          };
        }
        monthlySummary[monthYear].totalConsumptionKWH += reading.consumptionKWH;
        monthlySummary[monthYear].totalEmissionCO2kg +=
          reading.emissionCO2kg || 0;
      });

      const sortedMonths = Object.keys(monthlySummary).sort();
      const labels = sortedMonths.map((month) =>
        new Date(month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      );
      const consumptionValues = sortedMonths.map(
        (month) => monthlySummary[month].totalConsumptionKWH
      );
      const emissionValues = sortedMonths.map(
        (month) => monthlySummary[month].totalEmissionCO2kg
      );

      // Month-over-Month Changes
      const consumptionChangeValues: (number | null)[] = [];
      const emissionChangeValues: (number | null)[] = [];

      for (let i = 0; i < consumptionValues.length; i++) {
        if (i === 0) {
          consumptionChangeValues.push(null);
          emissionChangeValues.push(null);
        } else {
          const consumptionDiff =
            consumptionValues[i] - consumptionValues[i - 1];
          consumptionChangeValues.push(consumptionDiff);
          const emissionDiff = emissionValues[i] - emissionValues[i - 1];
          emissionChangeValues.push(emissionDiff);
        }
      }

      setMonthlyConsumptionData({
        labels,
        datasets: [
          {
            label: "Electricity Consumption (kWh)",
            data: consumptionValues,
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#4CAF50",
            pointBorderColor: "#fff",
            pointHoverRadius: 6,
            pointRadius: 4,
          },
          {
            label: "CO2 Emissions (kg)",
            data: emissionValues,
            borderColor: "#FFC107",
            backgroundColor: "rgba(255, 193, 7, 0.2)",
            tension: 0.4,
            fill: true,
            yAxisID: "y1",
            pointBackgroundColor: "#FFC107",
            pointBorderColor: "#fff",
            pointHoverRadius: 6,
            pointRadius: 4,
          },
        ],
      });

      setMonthlyChangeData({
        labels,
        datasets: [
          {
            label: "Consumption Change (kWh)",
            data: consumptionChangeValues,
            backgroundColor: consumptionChangeValues.map((val) =>
              val === null ? "rgba(0,0,0,0.1)" : val < 0 ? "#4CAF50" : "#EF5350"
            ),
            borderColor: consumptionChangeValues.map((val) =>
              val === null ? "rgba(0,0,0,0.1)" : val < 0 ? "#388E3C" : "#D32F2F"
            ),
            borderWidth: 1,
          },
          {
            label: "Emissions Change (kg CO2)",
            data: emissionChangeValues,
            backgroundColor: emissionChangeValues.map((val) =>
              val === null ? "rgba(0,0,0,0.1)" : val < 0 ? "#03A9F4" : "#FF9800"
            ),
            borderColor: emissionChangeValues.map((val) =>
              val === null ? "rgba(0,0,0,0.1)" : val < 0 ? "#0288D1" : "#F57C00"
            ),
            borderWidth: 1,
            yAxisID: "y2",
          },
        ],
      });

      // Daily Consumption
      const dailySummaryMap = new Map<
        string,
        { date: Date; consumption: number }
      >();
      fetchedReadings.forEach((reading: any) => {
        const date = new Date(reading.readingDate);
        const dayKey = date.toISOString().substring(0, 10);
        if (dailySummaryMap.has(dayKey)) {
          dailySummaryMap.get(dayKey)!.consumption += reading.consumptionKWH;
        } else {
          dailySummaryMap.set(dayKey, {
            date: date,
            consumption: reading.consumptionKWH,
          });
        }
      });
      const sortedDailyData = Array.from(dailySummaryMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      const last30UniqueDays = sortedDailyData.slice(
        Math.max(0, sortedDailyData.length - 30)
      );

      const dailyLabels = last30UniqueDays.map((d) =>
        d.date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
      );
      const dailyValues = last30UniqueDays.map((d) => d.consumption);

      setDailyConsumptionData({
        labels: dailyLabels,
        datasets: [
          {
            label: "Daily Consumption (kWh)",
            data: dailyValues,
            backgroundColor: "rgba(79, 109, 253, 0.8)",
            borderColor: "#4F6DFD",
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      });

      // 3. Fetch Most Recent Energy Tip
      const tipsResponse = await axiosInstance.get("/api/energy-tips/history");
      if (tipsResponse.data.tips && tipsResponse.data.tips.length > 0) {
        setLatestTip(tipsResponse.data.tips[0].tipText);
      } else {
        setLatestTip(
          "No energy tips generated yet. Visit the Energy Tips page to get your first tip!"
        );
      }

      // 4. Fetch Total Savings from Analytics Endpoint
      try {
        const savingsResponse = await axiosInstance.get(
          "/api/analytics/total-savings"
        );
        setTotalMonetarySavings(savingsResponse.data.totalSavings);
      } catch (err: any) {
        console.warn(
          "Failed to fetch total monetary savings for dashboard:",
          err.message
        );
        setTotalMonetarySavings(null);
      }

      // 5. Fetch Total CO2 Reduction from Analytics Endpoint
      try {
        const co2ReductionResponse = await axiosInstance.get(
          "/api/analytics/total-co2-reduction"
        );
        setTotalCo2ReductionOverall(
          co2ReductionResponse.data.totalCo2Reduction
        );
      } catch (err: any) {
        console.warn(
          "Failed to fetch overall CO2 reduction for dashboard:",
          err.message
        );
        setTotalCo2ReductionOverall(null);
      }

      // Anomaly Detection (using fetched allMeterReadings)
      const currentAnomalyFlag = (() => {
        if (fetchedReadings.length < 4) return false;
        const latestReading =
          fetchedReadings[fetchedReadings.length - 1].consumptionKWH;
        const previousReadings = fetchedReadings
          .slice(fetchedReadings.length - 4, fetchedReadings.length - 1)
          .map((r: any) => r.consumptionKWH);
        const averagePrevious =
          previousReadings.reduce((sum: any, val: any) => sum + val, 0) /
          previousReadings.length;
        const percentageDifference =
          ((latestReading - averagePrevious) / averagePrevious) * 100;
        return Math.abs(percentageDifference) > 20;
      })();
      setAnomalyFlag(currentAnomalyFlag);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setMessageBox({
        message: "Failed to load dashboard data. Please check your connection.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up resize listener for chart heights
    const handleResize = () => {
      setChartHeights({
        monthlyTrend: getDynamicChartHeight(chartContainerRefs.monthlyTrend),
        monthlyChange: getDynamicChartHeight(chartContainerRefs.monthlyChange),
        dailyConsumption: getDynamicChartHeight(
          chartContainerRefs.dailyConsumption
        ),
      });
    };
    window.addEventListener("resize", handleResize);
    // Initial call to set heights correctly on mount
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // --- Chart Options Definitions (Responsive) ---
  const getBaseChartOptions = (
    titleText: string,
    yAxisTitle: string,
    yAxisColor: string,
    isDaily = false
  ) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: (window.innerWidth < 768 ? "bottom" : "top") as
          | "top"
          | "bottom"
          | "left"
          | "right",
        labels: {
          font: {
            size: window.innerWidth < 768 ? 10 : 14,
            family: "Inter",
            weight: "normal" as const,
          },
          boxWidth: 20,
        },
      },
      title: {
        display: true,
        text: titleText,
        font: {
          size: window.innerWidth < 768 ? 14 : 18,
          family: "Inter",
          weight: "bold" as const,
        },
        color: "#333",
      },
      tooltip: {
        bodyFont: { size: window.innerWidth < 768 ? 10 : 12 },
        titleFont: { size: window.innerWidth < 768 ? 12 : 14 },
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 2,
                signDisplay: isDaily ? "auto" : "auto",
              }).format(context.parsed.y);
              label += context.dataset.label.includes("kWh")
                ? " kWh"
                : " kg CO2";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
            family: "Inter",
            weight: "normal" as const,
          },
          color: "#555",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: yAxisTitle,
          font: {
            size: window.innerWidth < 768 ? 10 : 14,
            family: "Inter",
            weight: "bold" as const,
          },
          color: yAxisColor,
        },
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
            family: "Inter",
            weight: "normal" as const,
          },
          color: "#555",
        },
      },
    },
  });

  const chartOptions = {
    // Monthly Energy & Emissions Trend
    ...getBaseChartOptions(
      "Monthly Energy & Emissions Trend",
      "Energy Consumption (kWh)",
      "#4CAF50"
    ),
    scales: {
      ...getBaseChartOptions(
        "Monthly Energy & Emissions Trend",
        "Energy Consumption (kWh)",
        "#4CAF50"
      ).scales,
      y1: {
        // Secondary Y-axis for CO2 emissions
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "CO2 Emissions (kg)",
          font: {
            size: window.innerWidth < 768 ? 10 : 14,
            family: "Inter",
            weight: "bold" as const,
          },
          color: "#FFC107",
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
            family: "Inter",
            weight: "normal" as const,
          },
          color: "#555",
        },
      },
    },
  };

  const changeChartOptions = {
    // Month-over-Month Energy & Emissions Change
    ...getBaseChartOptions(
      "Month-over-Month Energy & Emissions Change",
      "Consumption Change (kWh)",
      "#4CAF50"
    ),
    plugins: {
      ...getBaseChartOptions(
        "Month-over-Month Energy & Emissions Change",
        "Consumption Change (kWh)",
        "#4CAF50"
      ).plugins,
      tooltip: {
        // Customize tooltip for change values
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                signDisplay: "always",
                maximumFractionDigits: 1,
              }).format(context.parsed.y);
              label += context.dataset.label.includes("Consumption")
                ? " kWh"
                : " kg CO2";
            }
            return label;
          },
        },
      },
    },
    scales: {
      ...getBaseChartOptions(
        "Month-over-Month Energy & Emissions Change",
        "Consumption Change (kWh)",
        "#4CAF50"
      ).scales,
      y2: {
        // Secondary Y-axis for CO2 emissions change
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "CO2 Emissions Change (kg)",
          font: {
            size: window.innerWidth < 768 ? 10 : 14,
            family: "Inter",
            weight: "bold" as const,
          },
          color: "#03A9F4",
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
            family: "Inter",
            weight: "normal" as const,
          },
          color: "#555",
        },
      },
    },
  };

  const dailyChartOptions = {
    // Recent Daily Energy Consumption
    ...getBaseChartOptions(
      "Recent Daily Energy Consumption",
      "Energy Consumption (kWh)",
      "#4F6DFD",
      true
    ),
    plugins: {
      ...getBaseChartOptions(
        "Recent Daily Energy Consumption",
        "Energy Consumption (kWh)",
        "#4F6DFD",
        true
      ).plugins,
      legend: { display: false }, // No legend for single dataset
    },
  };

  // Derived metrics from fetched data
  const householdSize = userProfile?.householdSize
    ? `${userProfile.householdSize} people`
    : "N/A";
  const electricityRate = userProfile?.userProfile?.electricityRatePerKWh;
  const targetReduction = userProfile?.userProfile?.targetReduction;

  // Monthly Consumption for current/previous month
  const latestMonthConsumption =
    monthlyConsumptionData?.datasets?.[0]?.data.length > 0
      ? monthlyConsumptionData.datasets[0].data[
          monthlyConsumptionData.datasets[0].data.length - 1
        ]
      : null;

  const allMonthlyConsumptionValues =
    monthlyConsumptionData?.datasets?.[0]?.data || [];

  // Calculate Overall Average Monthly Consumption from all available months
  const overallAverageMonthlyConsumption =
    allMonthlyConsumptionValues.length > 0
      ? allMonthlyConsumptionValues.reduce(
          (sum: number, val: number) => sum + val,
          0
        ) / allMonthlyConsumptionValues.length
      : 0;

  // Month-over-month change for metrics cards
  const latestConsumptionChangeVal =
    monthlyChangeData?.datasets?.[0]?.data?.[
      monthlyChangeData.datasets[0].data.length - 1
    ] || 0;
  const latestEmissionChangeVal =
    monthlyChangeData?.datasets?.[1]?.data?.[
      monthlyChangeData.datasets[1].data.length - 1
    ] || 0;

  // Estimated Monthly Bill Calculation
  let estimatedMonthlyBill = "N/A";
  if (
    typeof latestMonthConsumption === "number" &&
    typeof electricityRate === "number" &&
    electricityRate > 0
  ) {
    estimatedMonthlyBill = `₹${(
      latestMonthConsumption * electricityRate
    ).toFixed(2)}`;
  } else if (typeof latestMonthConsumption === "number") {
    estimatedMonthlyBill = `Rate Needed`;
  }

  // Energy Consumption Change Metric (for card)
  const energyChangeValue =
    typeof latestConsumptionChangeVal === "number"
      ? latestConsumptionChangeVal < 0
        ? `${Math.abs(latestConsumptionChangeVal).toFixed(1)} kWh Saved`
        : latestConsumptionChangeVal > 0
        ? `${latestConsumptionChangeVal.toFixed(1)} kWh Increased`
        : `No Change`
      : "N/A";
  const energyChangeIcon =
    typeof latestConsumptionChangeVal === "number"
      ? latestConsumptionChangeVal < 0
        ? TrendingDown
        : TrendingUp
      : TrendingUp;
  const energyChangeColor =
    typeof latestConsumptionChangeVal === "number"
      ? latestConsumptionChangeVal < 0
        ? "text-primary"
        : latestConsumptionChangeVal > 0
        ? "text-red-500"
        : "text-gray-600"
      : "text-gray-600";

  // CO2 Emissions Change Metric (for card)
  const co2ChangeValue =
    typeof latestEmissionChangeVal === "number"
      ? latestEmissionChangeVal < 0
        ? `${Math.abs(latestEmissionChangeVal).toFixed(1)} kg Reduced`
        : latestEmissionChangeVal > 0
        ? `${latestEmissionChangeVal.toFixed(1)} kg Increased`
        : `No Change`
      : "N/A";
  const co2ChangeIcon =
    typeof latestEmissionChangeVal === "number"
      ? latestEmissionChangeVal < 0
        ? TrendingDown
        : TrendingUp
      : TrendingUp;
  const co2ChangeColor =
    typeof latestEmissionChangeVal === "number"
      ? latestEmissionChangeVal < 0
        ? "text-emerald-600"
        : latestEmissionChangeVal > 0
        ? "text-red-500"
        : "text-gray-600"
      : "text-gray-600";

  // Energy Efficiency Score / Target Progress Calculation
  let efficiencyScoreValue = "N/A";
  let efficiencyScoreColor = "text-gray-500";
  let efficiencyScoreText = "Set your target reduction in profile!";
  let efficiencyProgressBar = 0; // 0-100 for progress bar width

  // Use a more robust check for sufficient data for efficiency score
  const hasSufficientDataForEfficiency =
    allMonthlyConsumptionValues.length >= 3 &&
    typeof latestMonthConsumption === "number" &&
    overallAverageMonthlyConsumption > 0;

  if (
    typeof targetReduction === "number" &&
    targetReduction > 0 &&
    hasSufficientDataForEfficiency
  ) {
    const targetConsumption =
      overallAverageMonthlyConsumption * (1 - targetReduction / 100);

    // Current progress towards *target* reduction
    let currentReductionPercentage = 0;
    if (overallAverageMonthlyConsumption > 0) {
      currentReductionPercentage =
        ((overallAverageMonthlyConsumption - latestMonthConsumption) /
          overallAverageMonthlyConsumption) *
        100;
    }

    efficiencyProgressBar = Math.min(
      100,
      Math.max(0, (currentReductionPercentage / targetReduction) * 100)
    );

    if (latestMonthConsumption <= targetConsumption) {
      efficiencyScoreValue = `On Track!`;
      efficiencyScoreColor = "text-primary";
      efficiencyScoreText = `Great! You're meeting your ${targetReduction}% target.`;
    } else {
      const difference = latestMonthConsumption - targetConsumption;
      efficiencyScoreValue = `Needs Improvement`;
      efficiencyScoreColor = "text-red-500";
      efficiencyScoreText = `You're currently using ${difference.toFixed(
        1
      )} kWh above your target.`;
    }
  } else if (typeof targetReduction === "number" && targetReduction > 0) {
    efficiencyScoreText = `Need more data (at least 3 months) to track progress against your ${targetReduction}% target.`;
  } else {
    efficiencyScoreText =
      "Set your target reduction in your profile to track efficiency!";
    efficiencyScoreValue = "Not Set";
    efficiencyScoreColor = "text-gray-500";
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 font-inter antialiased min-h-screen">
      {messageBox && (
        <MessageBox
          message={messageBox.message}
          type={messageBox.type}
          onClose={() => setMessageBox(null)}
        />
      )}

      {/* Anomaly Flag */}
      {anomalyFlag && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={anomalyVariants} // Use specific anomaly variants
          className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-xl flex items-center space-x-3 shadow-md"
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium">
            Heads up! Your latest energy consumption is significantly different
            from your recent average. This could indicate an unusual usage
            pattern or a data anomaly.
          </p>
        </motion.div>
      )}

      {/* Key Performance Indicators (KPIs) Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
      >
        {/* Estimated Monthly Bill */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-blue-500 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-blue-800">
              Estimated Monthly Bill
            </h3>
            <Zap className="w-7 h-7 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {estimatedMonthlyBill}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Based on your latest consumption
          </p>
        </motion.div>

        {/* Total Savings Overall */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-primary flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-primary">
              {totalMonetarySavings !== null && totalMonetarySavings < 0
                ? "Extra Cost Overall"
                : "Total Savings Overall"}
            </h3>
            <IndianRupee className="w-7 h-7 text-primary" />
          </div>
          <p
            className={`text-3xl font-bold ${
              totalMonetarySavings !== null && totalMonetarySavings < 0
                ? "text-red-600"
                : "text-primary"
            }`}
          >
            {totalMonetarySavings !== null
              ? `₹${Math.abs(totalMonetarySavings).toLocaleString("en-IN")}`
              : isLoading
              ? "Calculating..."
              : "N/A"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Since your tracking started
          </p>
        </motion.div>

        {/* CO2 Reduction Overall */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-purple-500 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-purple-800">
              {totalCo2ReductionOverall !== null && totalCo2ReductionOverall < 0
                ? "CO2 Increase Overall"
                : "CO2 Reduction Overall"}
            </h3>
            <Leaf className="w-7 h-7 text-purple-500" />
          </div>
          <p
            className={`text-3xl font-bold ${
              totalCo2ReductionOverall !== null && totalCo2ReductionOverall < 0
                ? "text-red-600"
                : "text-purple-700"
            }`}
          >
            {totalCo2ReductionOverall !== null
              ? `${Math.abs(totalCo2ReductionOverall).toFixed(2)} kg`
              : isLoading
              ? "Calculating..."
              : "N/A"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Since your tracking started
          </p>
        </motion.div>

        {/* Energy Efficiency Score */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-orange-500 flex flex-col justify-between h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-orange-800">
              Energy Efficiency Score
            </h3>
            <Gauge className="w-7 h-7 text-orange-500" />
          </div>
          <p className={`text-3xl font-bold ${efficiencyScoreColor} mb-2`}>
            {efficiencyScoreValue}
          </p>
          <p className="text-sm text-gray-600 mb-3">{efficiencyScoreText}</p>
          {typeof targetReduction === "number" &&
          targetReduction > 0 &&
          allMonthlyConsumptionValues.length >= 3 ? (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${efficiencyProgressBar}%` }}
              ></div>
            </div>
          ) : (
            <button
              onClick={() => onSectionChange("profile")}
              className="mt-2 w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Setup Target in Profile
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Secondary Metrics & User Info */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
      >
        {/* Last Month's Energy Change */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3 mb-3">
            {React.createElement(energyChangeIcon, {
              className: `w-6 h-6 ${energyChangeColor}`,
            })}
            <h3 className="text-md font-semibold text-gray-700">
              Last Month's Energy
            </h3>
          </div>
          <p className={`text-2xl font-bold ${energyChangeColor}`}>
            {energyChangeValue}
          </p>
          <p className="text-sm text-gray-500 mt-2">vs. previous month</p>
        </motion.div>

        {/* Last Month's CO2 Change */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3 mb-3">
            {React.createElement(co2ChangeIcon, {
              className: `w-6 h-6 ${co2ChangeColor}`,
            })}
            <h3 className="text-md font-semibold text-gray-700">
              Last Month's CO2
            </h3>
          </div>
          <p className={`text-2xl font-bold ${co2ChangeColor}`}>
            {co2ChangeValue}
          </p>
          <p className="text-sm text-gray-500 mt-2">vs. previous month</p>
        </motion.div>

        {/* Household Size & Member Since */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-6 h-6 text-indigo-500" />
            <h3 className="text-md font-semibold text-gray-700">
              Household Details
            </h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{householdSize}</p>
          <div className="flex items-center text-sm text-gray-500 mt-2 space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Member since{" "}
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt).getFullYear()
                : "N/A"}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
      >
        {/* Monthly Energy & Emissions Trend */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
          ref={chartContainerRefs.monthlyTrend}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
            Monthly Energy & Emissions Trend
          </h2>
          <div style={{ height: chartHeights.monthlyTrend }}>
            {monthlyConsumptionData &&
            monthlyConsumptionData.labels.length > 0 ? (
              <Line data={monthlyConsumptionData} options={chartOptions} />
            ) : (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                No monthly energy trend data available. Add readings!
              </div>
            )}
          </div>
        </motion.div>

        {/* Month-over-Month Change */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
          ref={chartContainerRefs.monthlyChange}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
            Month-over-Month Energy & Emissions Change
          </h2>
          <div style={{ height: chartHeights.monthlyChange }}>
            {monthlyChangeData && monthlyChangeData.labels.length > 1 ? (
              <Bar data={monthlyChangeData} options={changeChartOptions} />
            ) : (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                Need at least two months of data to show monthly changes.
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Daily Energy Consumption */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
          ref={chartContainerRefs.dailyConsumption}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
            Recent Daily Energy Consumption
            <span className="block text-sm text-gray-500 font-normal mt-1">
              (Last {dailyConsumptionData?.labels?.length || 0} days with
              readings)
            </span>
          </h2>
          <div style={{ height: chartHeights.dailyConsumption }}>
            {dailyConsumptionData && dailyConsumptionData.labels.length > 0 ? (
              <Bar data={dailyConsumptionData} options={dailyChartOptions} />
            ) : (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                No recent daily consumption data available. Add daily readings!
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Insights & Quick Actions Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
      >
        {/* Your Latest Energy Tip */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>Your Latest Energy Tip</span>
          </h3>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-gray-700 flex-grow">
            <p className="text-sm">
              {latestTip ||
                "No energy tips generated yet. Visit the Energy Tips page to get your first tip!"}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Personalized advice to help you save more.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3 flex-grow flex flex-col justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSectionChange("data-entry")}
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Add Today's Reading
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSectionChange("profile")}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Update Profile
            </motion.button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Quickly manage your data and settings.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
