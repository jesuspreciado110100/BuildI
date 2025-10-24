import { TelemetryLog } from '../types';

class TelemetryService {
  private static instance: TelemetryService;
  private telemetryLogs: TelemetryLog[] = [];
  private thresholds = {
    temperature: 85, // Celsius
    vibration: 7.5, // mm/s
    hoursForService: 500 // hours
  };

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  constructor() {
    this.generateMockTelemetryData();
  }

  private generateMockTelemetryData() {
    const machines = ['machine-1', 'machine-2', 'machine-3', 'machine-4'];
    const now = new Date();
    
    machines.forEach(machineId => {
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
        const temp = 70 + Math.random() * 30;
        const vibration = 3 + Math.random() * 8;
        const hoursRun = 400 + Math.random() * 200;
        
        this.telemetryLogs.push({
          id: `${machineId}-${i}`,
          machine_id: machineId,
          hours_run: hoursRun,
          temp: temp,
          vibration: vibration,
          last_service_date: '2024-01-15',
          timestamp: timestamp.toISOString(),
          anomaly_detected: this.detectAnomaly(temp, vibration, hoursRun)
        });
      }
    });
  }

  private detectAnomaly(temp: number, vibration: number, hoursRun: number): boolean {
    return temp > this.thresholds.temperature || 
           vibration > this.thresholds.vibration ||
           hoursRun > this.thresholds.hoursForService;
  }

  getTelemetryForMachine(machineId: string): TelemetryLog[] {
    return this.telemetryLogs
      .filter(log => log.machine_id === machineId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAllTelemetry(): TelemetryLog[] {
    return this.telemetryLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAnomalies(): TelemetryLog[] {
    return this.telemetryLogs.filter(log => log.anomaly_detected);
  }

  predictMaintenanceRisk(machineId: string): { riskScore: number; nextMaintenance: string; alerts: string[] } {
    const logs = this.getTelemetryForMachine(machineId);
    if (logs.length === 0) return { riskScore: 0, nextMaintenance: 'Unknown', alerts: [] };

    const latest = logs[0];
    const anomalies = logs.filter(log => log.anomaly_detected).length;
    const riskScore = Math.min(100, (anomalies / logs.length) * 100 + (latest.hours_run / 1000) * 50);
    
    const alerts: string[] = [];
    if (latest.temp > this.thresholds.temperature) alerts.push('High temperature detected');
    if (latest.vibration > this.thresholds.vibration) alerts.push('Excessive vibration');
    if (latest.hours_run > this.thresholds.hoursForService) alerts.push('Service overdue');
    
    const nextMaintenanceDate = new Date();
    nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + Math.max(1, 30 - Math.floor(riskScore / 10)));
    
    return {
      riskScore: Math.round(riskScore),
      nextMaintenance: nextMaintenanceDate.toLocaleDateString(),
      alerts
    };
  }
}

export default TelemetryService.getInstance();