import { FraudEvent, RiskLevel, StateStats } from '@/types/fraud';

// Indian states with coordinates
const INDIAN_STATES = [
  { name: 'Andhra Pradesh', lat: 15.9129, lng: 79.74 },
  { name: 'Arunachal Pradesh', lat: 28.218, lng: 94.7278 },
  { name: 'Assam', lat: 26.2006, lng: 92.9376 },
  { name: 'Bihar', lat: 25.0961, lng: 85.3131 },
  { name: 'Chhattisgarh', lat: 21.2787, lng: 81.8661 },
  { name: 'Goa', lat: 15.2993, lng: 74.124 },
  { name: 'Gujarat', lat: 22.2587, lng: 71.1924 },
  { name: 'Haryana', lat: 29.0588, lng: 76.0856 },
  { name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  { name: 'Jharkhand', lat: 23.6102, lng: 85.2799 },
  { name: 'Karnataka', lat: 15.3173, lng: 75.7139 },
  { name: 'Kerala', lat: 10.8505, lng: 76.2711 },
  { name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569 },
  { name: 'Maharashtra', lat: 19.7515, lng: 75.7139 },
  { name: 'Manipur', lat: 24.6637, lng: 93.9063 },
  { name: 'Meghalaya', lat: 25.467, lng: 91.3662 },
  { name: 'Mizoram', lat: 23.1645, lng: 92.9376 },
  { name: 'Nagaland', lat: 26.1584, lng: 94.5624 },
  { name: 'Odisha', lat: 20.9517, lng: 85.0985 },
  { name: 'Punjab', lat: 31.1471, lng: 75.3412 },
  { name: 'Rajasthan', lat: 27.0238, lng: 74.2179 },
  { name: 'Sikkim', lat: 27.533, lng: 88.5122 },
  { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569 },
  { name: 'Telangana', lat: 18.1124, lng: 79.0193 },
  { name: 'Tripura', lat: 23.9408, lng: 91.9882 },
  { name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Uttarakhand', lat: 30.0668, lng: 79.0193 },
  { name: 'West Bengal', lat: 22.9868, lng: 87.855 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Jammu and Kashmir', lat: 33.7782, lng: 76.5762 },
  { name: 'Ladakh', lat: 34.2996, lng: 78.2932 },
  { name: 'Andaman and Nicobar Islands', lat: 11.7401, lng: 92.6586 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.1809, lng: 73.0169 },
  { name: 'Lakshadweep', lat: 10.57, lng: 72.64 },
  { name: 'Puducherry', lat: 11.9416, lng: 79.8083 }
];

// Major cities with coordinates
const INDIAN_CITIES: {[key: string]: {name: string, lat: number, lng: number}[]} = {
  'Maharashtra': [
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 }
  ],
  'Karnataka': [
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394 }
  ],
  'Tamil Nadu': [
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 }
  ],
  'Delhi': [
    { name: 'New Delhi', lat: 28.6139, lng: 77.209 }
  ],
  'Telangana': [
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 }
  ],
  'Gujarat': [
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
  ],
  'West Bengal': [
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 }
  ],
  'Uttar Pradesh': [
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Kanpur', lat: 26.4499, lng: 80.3319 }
  ],
  'Rajasthan': [
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 }
  ],
  'Punjab': [
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 }
  ]
};

// Device types
const DEVICE_TYPES = ['Android', 'iOS', 'Desktop', 'Other'];

// Risk levels with their weights
const RISK_LEVELS: { level: RiskLevel, weight: number }[] = [
  { level: 'HIGH', weight: 3 },
  { level: 'MEDIUM', weight: 2 },
  { level: 'LOW', weight: 1 }
];

// States with higher fraud probability
const HIGH_FRAUD_STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu'];

// Generate a fraud event with realistic data
function generateFraudEvent(): FraudEvent {
  // Give higher probability to high fraud states
  const useHighFraudState = Math.random() < 0.7; 
  
  let selectedState;
  if (useHighFraudState) {
    selectedState = HIGH_FRAUD_STATES[Math.floor(Math.random() * HIGH_FRAUD_STATES.length)];
  } else {
    selectedState = INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)].name;
  }
  
  // Find state object
  const stateObj = INDIAN_STATES.find(state => state.name === selectedState);
  
  // Get cities for the selected state or use the state coordinates
  const cities = INDIAN_CITIES[selectedState] || [];
  let cityObj;
  let latitude, longitude;
  
  if (cities.length > 0 && Math.random() < 0.8) { 
    // 80% chance to pick a known city
    cityObj = cities[Math.floor(Math.random() * cities.length)];
    latitude = cityObj.lat + (Math.random() - 0.5) * 0.05; // Add small variation
    longitude = cityObj.lng + (Math.random() - 0.5) * 0.05; // Add small variation
  } else {
    // Use state coordinates with some randomness
    latitude = stateObj!.lat + (Math.random() - 0.5) * 0.5;
    longitude = stateObj!.lng + (Math.random() - 0.5) * 0.5;
    
    // For states without defined cities, generate a generic city name
    cityObj = { name: `${selectedState} Region` };
  }
  
  // Risk level - higher probability for MEDIUM
  const riskRoll = Math.random();
  let riskLevel: RiskLevel;
  
  if (riskRoll < 0.3) {
    riskLevel = 'HIGH';
  } else if (riskRoll < 0.7) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }
  
  // Amount between ₹1,000 and ₹50,000, with higher probability for smaller amounts
  const amount = Math.round(1000 + Math.pow(Math.random(), 2) * 49000);
  
  // Device type - higher probability for mobile
  const deviceType = DEVICE_TYPES[Math.floor(Math.random() * (riskLevel === 'HIGH' ? 2 : 4))] as 'Android' | 'iOS' | 'Desktop' | 'Other';
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now(),
    state: selectedState,
    city: cityObj.name,
    amount,
    riskLevel,
    deviceType,
    latitude,
    longitude
  };
}

// Fraud event list with a capacity
class FraudEventList {
  private events: FraudEvent[] = [];
  private maxSize: number;
  private statsMap: Map<string, { count: number, riskScore: number }> = new Map();
  private totalEvents: number = 0;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  add(event: FraudEvent) {
    // Update stats
    this.totalEvents++;
    
    const stateStats = this.statsMap.get(event.state) || { count: 0, riskScore: 0 };
    stateStats.count++;
    
    // Add risk weight
    const riskWeight = RISK_LEVELS.find(r => r.level === event.riskLevel)?.weight || 1;
    stateStats.riskScore += riskWeight;
    
    this.statsMap.set(event.state, stateStats);
    
    // Add to events list
    this.events.push(event);
    
    // Keep the list at the maximum size
    if (this.events.length > this.maxSize) {
      this.events.shift();
    }
    
    return event;
  }
  
  getTopStates(count = 5): StateStats[] {
    const stats: StateStats[] = [];
    
    for (const [name, data] of this.statsMap.entries()) {
      stats.push({
        name,
        count: data.count,
        percentage: (data.count / this.totalEvents) * 100,
        riskScore: data.riskScore
      });
    }
    
    // Sort by count and return top N
    return stats
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }
  
  getAll(): FraudEvent[] {
    return [...this.events];
  }
  
  getLatest(count = 10): FraudEvent[] {
    return [...this.events]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }
}

// Singleton instance
const fraudData = new FraudEventList(1000);

// Pre-populate with some data
for (let i = 0; i < 50; i++) {
  fraudData.add(generateFraudEvent());
}

// Stream simulation functions
const listeners: Set<(event: FraudEvent) => void> = new Set();

let streamInterval: NodeJS.Timeout | null = null;

// Start the stream simulation
export function startFraudStream(frequency = 1000) {
  if (streamInterval) {
    clearInterval(streamInterval);
  }
  
  streamInterval = setInterval(() => {
    // Generate 1-3 fraud events at random
    const eventCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < eventCount; i++) {
      const newEvent = fraudData.add(generateFraudEvent());
      
      // Notify listeners
      listeners.forEach(listener => listener(newEvent));
    }
  }, frequency);
  
  return () => {
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
  };
}

// Subscribe to the stream
export function subscribeFraudStream(callback: (event: FraudEvent) => void) {
  listeners.add(callback);
  
  return () => {
    listeners.delete(callback);
  };
}

// Get latest data
export function getLatestFrauds(count = 10): FraudEvent[] {
  return fraudData.getLatest(count);
}

// Get all data
export function getAllFrauds(): FraudEvent[] {
  return fraudData.getAll();
}

// Get top states
export function getTopFraudStates(count = 5): StateStats[] {
  return fraudData.getTopStates(count);
}

// Format amount to Indian Rupees
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format timestamp to time string
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN');
}
