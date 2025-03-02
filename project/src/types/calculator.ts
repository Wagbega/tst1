export interface ApplianceProfile {
  id: string;
  name: string;
  appliances: Array<{
    name: string;
    watts: number;
    hours: number;
    count?: number;
    backupHours: number;
  }>;
  created_at: string;
}

export interface WeatherData {
  location: string;
  sun_hours: number;
  cloud_cover: number;
  updated_at: string;
}

export interface SystemRecommendation {
  solar_size: number;
  battery_size: number;
  inverter_size: number;
  daily_usage: number;
  daily_cost: number;
  monthly_cost: number;
  yearly_cost: number;
}

export interface CalculationHistory {
  id: string;
  date: string;
  daily_usage: number;
  solar_size: number;
  battery_size: number;
  inverter_size: number;
}