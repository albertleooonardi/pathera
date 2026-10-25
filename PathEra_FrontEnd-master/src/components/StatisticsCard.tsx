import React from "react";

interface StatisticsCardProps {
  title: string;
  value: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value }) => {
  return (
    <div className="flex flex-col gap-1 bg-white px-5 py-5 sm:px-6">
      <p className="font-display text-3xl tracking-tight sm:text-4xl">{value}</p>
      <p className="eyebrow">{title}</p>
    </div>
  );
};

export default StatisticsCard;
