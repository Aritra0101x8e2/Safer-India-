
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getTopFraudStates } from '@/services/fraudDataService';
import { StateStats } from '@/types/fraud';

const TopStatesChart: React.FC = () => {
  const [topStates, setTopStates] = useState<StateStats[]>([]);

  useEffect(() => {
    // Initial load
    updateTopStates();
    
    // Update every second
    const interval = setInterval(() => {
      updateTopStates();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const updateTopStates = () => {
    const stats = getTopFraudStates(5);
    setTopStates(stats);
  };

  // Color based on risk score
  const getBarColor = (score: number) => {
    const normalizedScore = score / (topStates[0]?.riskScore || 1);
    if (normalizedScore > 0.8) return '#EA384C'; // High risk - red
    if (normalizedScore > 0.5) return '#F97316'; // Medium risk - orange
    return '#FACC15'; // Low risk - yellow
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyber-background p-2 border border-cyber-blue/30 rounded text-xs">
          <p className="font-mono">{`${payload[0].payload.name}`}</p>
          <p className="text-cyber-blue">{`Count: ${payload[0].value}`}</p>
          <p className="text-white/70">{`${payload[0].payload.percentage.toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-mono mb-2 text-white glow-text">LIVE MONITORING</h3>
      
      <div className="flex-1">
        {topStates.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topStates}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: '#FFF', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topStates.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.riskScore)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopStatesChart;
