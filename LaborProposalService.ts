import { LaborProposal } from '../types';
import { LaborContractGeneratorService } from './LaborContractGeneratorService';
import { LaborRequestService } from './LaborRequestService';

class LaborProposalService {
  private static proposals: LaborProposal[] = [
    {
      id: '1',
      request_id: '1',
      labor_chief_id: 'lc1',
      proposed_price: 2800,
      available_start_date: '2024-01-20',
      message: 'Experienced crew available with all equipment',
      status: 'approved',
      created_at: '2024-01-15T10:00:00Z',
      payment_terms: '50% upfront, 50% on completion',
      contract_url: 'https://contracts.example.com/labor-contract-1.pdf',
      is_signed: true,
      signed_at: '2024-01-16T14:30:00Z'
    },
    {
      id: '2',
      request_id: '1',
      labor_chief_id: 'lc2',
      proposed_price: 3200,
      available_start_date: '2024-01-18',
      message: 'Premium crew with 15+ years experience',
      status: 'pending',
      created_at: '2024-01-15T11:30:00Z'
    }
  ];

  static async createProposal(proposal: Omit<LaborProposal, 'id' | 'created_at'>): Promise<LaborProposal> {
    const newProposal: LaborProposal = {
      ...proposal,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    this.proposals.push(newProposal);
    return newProposal;
  }

  static async getProposalsByRequest(requestId: string): Promise<LaborProposal[]> {
    return this.proposals.filter(p => p.request_id === requestId);
  }

  static async getProposalsByLaborChief(laborChiefId: string): Promise<LaborProposal[]> {
    return this.proposals.filter(p => p.labor_chief_id === laborChiefId);
  }

  static async getApprovedProposals(): Promise<LaborProposal[]> {
    return this.proposals.filter(p => p.status === 'approved');
  }

  static async updateProposalStatus(proposalId: string, status: 'approved' | 'rejected'): Promise<void> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (proposal) {
      proposal.status = status;
      
      // Auto-generate contract when proposal is approved
      if (status === 'approved') {
        await this.generateContractForProposal(proposal);
      }
    }
  }

  private static async generateContractForProposal(proposal: LaborProposal): Promise<void> {
    try {
      const request = await LaborRequestService.getRequest(proposal.request_id);
      if (request) {
        // Mock concept data - in real app would fetch from ConceptService
        const mockConcept = {
          id: request.concept_id,
          name: 'Foundation Work',
          description: 'Concrete foundation construction',
          trade: request.trade_type,
          tags: [],
          phases: [],
          total_volume: 100,
          unit: 'sq ft',
          estimated_duration: request.duration_days,
          created_at: new Date().toISOString(),
          contractor_id: request.contractor_id,
          status: 'planning' as const
        };

        const contractUrl = await LaborContractGeneratorService.generateContract(
          proposal,
          request,
          mockConcept
        );

        // Update proposal with contract details
        proposal.contract_url = contractUrl;
        proposal.payment_terms = '50% upfront, 50% on completion';
        proposal.is_signed = false;
      }
    } catch (error) {
      console.error('Error generating contract:', error);
    }
  }

  static async markProposalSigned(proposalId: string): Promise<void> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (proposal) {
      proposal.is_signed = true;
      proposal.signed_at = new Date().toISOString();
      
      // Update contract status
      await LaborContractGeneratorService.markContractSigned(proposalId);
    }
  }

  static async getProposal(proposalId: string): Promise<LaborProposal | null> {
    return this.proposals.find(p => p.id === proposalId) || null;
  }

  static async getSignedContracts(): Promise<LaborProposal[]> {
    return this.proposals.filter(p => p.is_signed === true);
  }

  static async getUnsignedContracts(): Promise<LaborProposal[]> {
    return this.proposals.filter(p => p.contract_url && !p.is_signed);
  }
}

export { LaborProposalService };
export default LaborProposalService;