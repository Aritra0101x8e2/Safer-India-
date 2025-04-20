import React, { useEffect, useState } from 'react';
import MapComponent from '@/components/MapComponent';
import SearchBar from '@/components/SearchBar';
import TopStatesChart from '@/components/TopStatesChart';
import LiveFraudTicker from '@/components/LiveFraudTicker';
import { startFraudStream } from '@/services/fraudDataService';

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    const stopStream = startFraudStream(500);
    return () => stopStream();
  }, []);

  const handleSearch = (query: string) => {
    setSelectedState(query);
    console.log('Searching for:', query);
  };

  return (
    <div className="min-h-screen w-full bg-cyber-background flex flex-col">
      <header className="border-b border-cyber-blue/30 px-4 py-3 bg-cyber-background/90 z-30 relative">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              <span className="text-cyber-blue glow-text">UPI</span> Fraud Tracker by DarkWave CyberSecurity
            </h1>
            <p className="text-xs text-gray-400">
              Real-time visualization of fraudulent activities across India
            </p>
          </div>
          <div className="w-full md:w-64">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <MapComponent onStateSelect={setSelectedState} />
        </div>

        <div className="hidden md:block relative z-10 w-80 bg-cyber-background/80 backdrop-blur-sm border-l border-cyber-blue/30 h-full overflow-hidden">
          <div className="h-full flex flex-col p-4">
            <div className="h-1/2 mb-4 map-overlay p-4">
              <TopStatesChart />
            </div>
            <div className="flex-1 map-overlay p-4">
              <LiveFraudTicker />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-cyber-blue/30 bg-cyber-background/90 text-xs text-gray-500 p-2 text-center relative z-10">
        <p>Real-Time UPI Fraud Tracker Dashboard • Cyber India Watch - DARKWAVE Security - Aritra Kundu</p>
      </footer>
    </div>
  );
};

export default Index;
