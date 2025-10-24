export class MachineryCatalogService {
  static async getCatalog() {
    return [
      { id: '1', name: 'Excavator', category: 'excavator', dailyRate: 400, available: true },
      { id: '2', name: 'Bulldozer', category: 'bulldozer', dailyRate: 350, available: true },
      { id: '3', name: 'Crane', category: 'crane', dailyRate: 600, available: false },
      { id: '4', name: 'Loader', category: 'loader', dailyRate: 300, available: true }
    ];
  }

  static async searchMachinery(query: string, location?: string) {
    const catalog = await this.getCatalog();
    return catalog.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  static async getMachineryById(id: string) {
    const catalog = await this.getCatalog();
    return catalog.find(item => item.id === id);
  }
}