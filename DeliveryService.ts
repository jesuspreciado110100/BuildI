import { DeliveryVehicle, MaterialQuoteRequest } from '../types';
import { NotificationService } from './NotificationService';

export class DeliveryService {
  // Mock data for demonstration
  private static mockVehicles: DeliveryVehicle[] = [
    {
      id: '1',
      supplier_id: 'supplier1',
      driver_name: 'John Smith',
      current_location: 'Downtown Warehouse',
      status: 'available',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      supplier_id: 'supplier1',
      driver_name: 'Maria Garcia',
      current_location: 'Highway 101, Mile 15',
      active_order_id: 'order1',
      status: 'delivering',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  private static mockOrders: MaterialQuoteRequest[] = [
    {
      id: 'order1',
      contractor_id: 'contractor1',
      material_id: 'material1',
      supplier_id: 'supplier1',
      site_id: 'site1',
      quantity: 100,
      status: 'accepted',
      material_name: 'Concrete Mix',
      requested_by_contractor_id: 'contractor1',
      delivery_status: 'en_route',
      delivery_eta: '2 hours',
      delivery_notes: 'Call on arrival',
      vehicle_id: '2',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T01:00:00Z',
    },
    {
      id: 'order2',
      contractor_id: 'contractor1',
      material_id: 'material2',
      supplier_id: 'supplier1',
      site_id: 'site1',
      quantity: 50,
      status: 'accepted',
      material_name: 'Steel Rebar',
      requested_by_contractor_id: 'contractor1',
      delivery_status: 'pending',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T01:00:00Z',
    },
  ];

  static async getVehiclesBySupplier(supplierId: string): Promise<DeliveryVehicle[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockVehicles.filter(v => v.supplier_id === supplierId);
  }

  static async getAcceptedOrdersForDelivery(supplierId: string): Promise<MaterialQuoteRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockOrders.filter(o => o.supplier_id === supplierId && o.status === 'accepted');
  }

  static async assignVehicleToOrder(
    orderId: string,
    vehicleId: string,
    eta: string,
    notes: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const vehicle = this.mockVehicles.find(v => v.id === vehicleId);
    const order = this.mockOrders.find(o => o.id === orderId);
    
    if (vehicle && order) {
      vehicle.status = 'delivering';
      vehicle.active_order_id = orderId;
      order.vehicle_id = vehicleId;
      order.delivery_eta = eta;
      order.delivery_notes = notes;
      order.delivery_status = 'en_route';
      
      // Send notification to contractor
      await NotificationService.sendDeliveryNotification(
        order.contractor_id,
        'shipped',
        orderId,
        order.material_name,
        `ETA: ${eta}`
      );
    }
  }

  static async updateDeliveryStatus(
    orderId: string,
    status: 'pending' | 'en_route' | 'delivered' | 'delayed' | 'cancelled',
    notes?: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const order = this.mockOrders.find(o => o.id === orderId);
    if (order) {
      order.delivery_status = status;
      if (notes) order.delivery_notes = notes;
      
      // Send appropriate notification
      if (status === 'delivered') {
        await NotificationService.sendDeliveryNotification(
          order.contractor_id,
          'delivered',
          orderId,
          order.material_name
        );
      }
    }
  }

  static async flagDeliveryIssue(orderId: string, issueDescription: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const order = this.mockOrders.find(o => o.id === orderId);
    if (order) {
      order.delivery_status = 'delayed';
      
      // Notify supplier
      await NotificationService.sendDeliveryNotification(
        order.supplier_id,
        'issue_flagged',
        orderId,
        order.material_name,
        issueDescription
      );
    }
  }

  static async getOrdersByContractor(contractorId: string): Promise<MaterialQuoteRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockOrders.filter(o => o.contractor_id === contractorId);
  }

  static async createVehicle(vehicle: Omit<DeliveryVehicle, 'id' | 'created_at'>): Promise<DeliveryVehicle> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newVehicle: DeliveryVehicle = {
      ...vehicle,
      id: `vehicle_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.mockVehicles.push(newVehicle);
    return newVehicle;
  }
}