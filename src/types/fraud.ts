
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FraudEvent {
  id: string;
  timestamp: number;
  state: string;
  city: string;
  amount: number;
  riskLevel: RiskLevel;
  deviceType: 'Android' | 'iOS' | 'Desktop' | 'Other';
  latitude: number;
  longitude: number;
}

export interface StateStats {
  name: string;
  count: number;
  percentage: number;
  riskScore: number;
}
