import { SmartContractData, BookingRequest, LaborProposal, MaterialQuoteRequest } from '../types';

export class SmartContractService {
  private static instance: SmartContractService;
  private contracts: Map<string, SmartContractData> = new Map();

  static getInstance(): SmartContractService {
    if (!SmartContractService.instance) {
      SmartContractService.instance = new SmartContractService();
    }
    return SmartContractService.instance;
  }

  async generateSmartContract(data: any): Promise<SmartContractData> {
    const contractContent = this.buildContractContent(data);
    const contractHash = await this.hashContract(contractContent);
    const blockchainTxId = await this.simulateBlockchainTx(contractHash);

    const contract: SmartContractData = {
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contract_hash: contractHash,
      blockchain_tx_id: blockchainTxId,
      escrow_status: 'pending',
      confirmation_status: 'pending',
      created_at: new Date().toISOString(),
      contract_content: contractContent,
      parties: data.parties || [],
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      delivery_confirmed_by: [],
    };

    this.contracts.set(contract.id, contract);
    return contract;
  }

  async hashContract(content: string): Promise<string> {
    // Mock SHA256 hash generation
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async simulateBlockchainTx(hash: string): Promise<string> {
    // Mock blockchain transaction simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `0x${hash.substring(0, 16)}${Math.random().toString(16).substr(2, 8)}`;
  }

  async lockEscrow(contractId: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (contract) {
      contract.escrow_status = 'locked';
      this.contracts.set(contractId, contract);
    }
  }

  async releasePayment(bookingId: string): Promise<void> {
    const contract = this.findContractByBookingId(bookingId);
    if (contract) {
      contract.escrow_status = 'released';
      contract.confirmation_status = 'confirmed';
      this.contracts.set(contract.id, contract);
    }
  }

  async markDisputed(bookingId: string, reason?: string): Promise<void> {
    const contract = this.findContractByBookingId(bookingId);
    if (contract) {
      contract.confirmation_status = 'disputed';
      contract.dispute_reason = reason;
      this.contracts.set(contract.id, contract);
    }
  }

  async confirmDelivery(contractId: string, userId: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (contract) {
      if (!contract.delivery_confirmed_by) {
        contract.delivery_confirmed_by = [];
      }
      if (!contract.delivery_confirmed_by.includes(userId)) {
        contract.delivery_confirmed_by.push(userId);
      }
      
      // If both parties confirmed, release payment
      if (contract.delivery_confirmed_by.length >= 2) {
        contract.escrow_status = 'released';
        contract.confirmation_status = 'confirmed';
      }
      
      this.contracts.set(contractId, contract);
    }
  }

  async adminOverride(contractId: string, action: 'release' | 'refund'): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (contract) {
      contract.escrow_status = action === 'release' ? 'released' : 'refunded';
      contract.confirmation_status = 'confirmed';
      contract.admin_override = true;
      this.contracts.set(contractId, contract);
    }
  }

  getContract(contractId: string): SmartContractData | undefined {
    return this.contracts.get(contractId);
  }

  getAllContracts(): SmartContractData[] {
    return Array.from(this.contracts.values());
  }

  getContractsByStatus(status: string): SmartContractData[] {
    return Array.from(this.contracts.values()).filter(
      contract => contract.escrow_status === status || contract.confirmation_status === status
    );
  }

  private buildContractContent(data: any): string {
    return `
SMART CONTRACT AGREEMENT
========================
Contract ID: ${data.id || 'N/A'}
Parties: ${(data.parties || []).join(', ')}
Amount: ${data.amount || 0} ${data.currency || 'USD'}
Service: ${data.service || 'Construction Services'}
Delivery Date: ${data.deliveryDate || 'TBD'}
Terms: ${data.terms || 'Standard terms apply'}
Generated: ${new Date().toISOString()}
========================
`;
  }

  private findContractByBookingId(bookingId: string): SmartContractData | undefined {
    return Array.from(this.contracts.values()).find(
      contract => contract.id.includes(bookingId) || contract.contract_content.includes(bookingId)
    );
  }
}