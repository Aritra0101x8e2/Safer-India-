import React, { useEffect, useState, useRef } from 'react';
import { FraudEvent } from '@/types/fraud';
import {
  subscribeFraudStream,
  getLatestFrauds,
  formatAmount,
  formatTime,
} from '@/services/fraudDataService';

const LiveFraudTicker: React.FC = () => {
  const [fraudEvents, setFraudEvents] = useState<FraudEvent[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFraudEvents(getLatestFrauds(10));

    const unsubscribe = subscribeFraudStream((newEvent) => {
      setFraudEvents((prev) => [newEvent, ...prev].slice(0, 20));

      if (tickerRef.current) {
        tickerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getRiskClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'bg-cyber-red';
      case 'MEDIUM':
        return 'bg-cyber-orange';
      case 'LOW':
        return 'bg-cyber-yellow';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="hidden sm:block h-full overflow-hidden px-2 sm:px-4">
      <h3 className="text-sm font-mono mb-2 text-white glow-text text-center sm:text-left">
        LIVE UPI FRAUD STREAM
      </h3>

      <div
        className="ticker-container h-full overflow-y-auto scroll-smooth space-y-2"
        ref={tickerRef}
      >
        {fraudEvents.map((event) => (
          <div
            key={event.id}
            className="bg-cyber-background/50 border-l-4 border-cyber-blue p-2 rounded-md text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center animate-slide-up gap-1"
          >
            <div className="flex flex-wrap items-center gap-2 text-gray-200">
              <span className="text-gray-400">{formatTime(event.timestamp)}</span>
              <span className="text-white">{`${event.city}, ${event.state}`}</span>
              <span className="font-mono">{formatAmount(event.amount)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className={`px-2 py-0.5 rounded text-white ${getRiskClass(event.riskLevel)}`}>
                {event.riskLevel}
              </span>
              <span className="text-gray-400 text-[11px] sm:text-xs">{event.deviceType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFraudTicker;
