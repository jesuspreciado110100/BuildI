import { CommissionConfig, CommissionHistory, EarningsData } from '../types';

export class CommissionManagerService {
  private static configs: CommissionConfig[] = [
    {
      id: '1',
      module: 'labor',
      payer_role: 'contractor',
      percentage: 8.0,
      country_code: 'US',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      updated_by: 'admin'
    },
    {
      id: '2',
      module: 'machinery',
      payer_role: 'contractor',
      percentage: 10.0,
      country_code: 'US',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      updated_by: 'admin'
    },
    {
      id: '3',
      module: 'material',
      payer_role: 'contractor',
      percentage: 5.0,
      country_code: 'US',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      updated_by: 'admin'
    }
  ];

  private static history: CommissionHistory[] = [];

  static getCurrentFee(module: string, role: string, region: string): number {
    const config = this.configs.find(c => 
      c.module === module && 
      c.payer_role === role && 
      c.country_code === region && 
      c.is_active
    );
    return config ? config.percentage : 0;
  }

  static calculatePlatformCut(amount: number, module: string, role: string, region: string): number {
    const feePercentage = this.getCurrentFee(module, role, region);
    return Math.round(amount * (feePercentage / 100) * 100) / 100;
  }

  static logCommissionHistory(configId: string, oldPercentage: number, newPercentage: number, adminId: string, reason?: string): void {
    const historyEntry: CommissionHistory = {
      id: Date.now().toString(),
      config_id: configId,
      old_percentage: oldPercentage,
      new_percentage: newPercentage,
      changed_by: adminId,
      changed_at: new Date().toISOString(),
      reason
    };
    this.history.push(historyEntry);
  }

  static getAllConfigs(): CommissionConfig[] {
    return this.configs;
  }

  static updateConfig(id: string, percentage: number, adminId: string): boolean {
    const config = this.configs.find(c => c.id === id);
    if (!config) return false;

    const oldPercentage = config.percentage;
    config.percentage = percentage;
    config.updated_at = new Date().toISOString();
    config.updated_by = adminId;

    this.logCommissionHistory(id, oldPercentage, percentage, adminId);
    return true;
  }

  static toggleConfigStatus(id: string, adminId: string): boolean {
    const config = this.configs.find(c => c.id === id);
    if (!config) return false;

    config.is_active = !config.is_active;
    config.updated_at = new Date().toISOString();
    config.updated_by = adminId;
    return true;
  }

  static getEarningsData(): EarningsData {
    return {
      total_revenue: 125000,
      platform_fees: 12500,
      module_breakdown: {
        labor: 8500,
        machinery: 3200,
        material: 800
      },
      top_earners: [
        { id: '1', name: 'ABC Construction', earnings: 2500 },
        { id: '2', name: 'XYZ Machinery', earnings: 1800 },
        { id: '3', name: 'BuildCorp', earnings: 1200 }
      ],
      monthly_trend: [
        { month: 'Jan', revenue: 8500 },
        { month: 'Feb', revenue: 9200 },
        { month: 'Mar', revenue: 11800 },
        { month: 'Apr', revenue: 12500 }
      ]
    };
  }

  static getCommissionHistory(): CommissionHistory[] {
    return this.history;
  }
}