import { LaborProposal, LaborRequest, ConstructionConcept } from '../types';
import { NotificationService } from './NotificationService';

interface ContractData {
  jobScope: string;
  siteInfo: string;
  startDate: string;
  duration: number;
  unitPrice: number;
  volume: number;
  totalAmount: number;
  paymentSchedule: string;
  contractorName: string;
  laborChiefName: string;
}

class LaborContractGeneratorService {
  private static contracts: Array<{
    id: string;
    proposal_id: string;
    contract_text: string;
    contract_url: string;
    created_at: string;
    status: 'unsigned' | 'signed' | 'disputed';
  }> = [];

  static async generateContract(
    proposal: LaborProposal,
    request: LaborRequest,
    concept: ConstructionConcept
  ): Promise<string> {
    const contractData: ContractData = {
      jobScope: `${concept.name} - ${request.trade_type}`,
      siteInfo: `Site ID: ${request.site_id}`,
      startDate: proposal.available_start_date,
      duration: request.duration_days,
      unitPrice: proposal.proposed_price / request.workers_needed,
      volume: request.workers_needed,
      totalAmount: proposal.proposed_price,
      paymentSchedule: this.generatePaymentSchedule(proposal.proposed_price),
      contractorName: 'Contractor Name', // Would come from user data
      laborChiefName: 'Labor Chief Name' // Would come from user data
    };

    const contractText = this.generateContractText(contractData);
    const contractUrl = await this.generatePDF(contractText, proposal.id);

    // Store contract
    this.contracts.push({
      id: Date.now().toString(),
      proposal_id: proposal.id,
      contract_text: contractText,
      contract_url: contractUrl,
      created_at: new Date().toISOString(),
      status: 'unsigned'
    });

    // Send notifications
    await this.sendContractNotifications(proposal, request);

    return contractUrl;
  }

  private static generatePaymentSchedule(totalAmount: number): string {
    const half = totalAmount / 2;
    return `50% (${half.toFixed(2)}) upon contract signing, 50% (${half.toFixed(2)}) upon job completion`;
  }

  private static generateContractText(data: ContractData): string {
    return `
LABOR SERVICE AGREEMENT

This Labor Service Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()} between:

CONTRACTOR: ${data.contractorName}
LABOR CHIEF: ${data.laborChiefName}

JOB SCOPE:
${data.jobScope}

SITE INFORMATION:
${data.siteInfo}

TERMS AND CONDITIONS:
1. Start Date: ${data.startDate}
2. Duration: ${data.duration} days
3. Workers Required: ${data.volume}
4. Rate per Worker: $${data.unitPrice.toFixed(2)}/day
5. Total Contract Amount: $${data.totalAmount.toFixed(2)}

PAYMENT TERMS:
${data.paymentSchedule}

LEGAL BOILERPLATE:
- This agreement is governed by local labor laws
- All work must comply with safety regulations
- Either party may terminate with 24-hour notice
- Disputes will be resolved through arbitration

By signing below, both parties agree to the terms stated above.

_________________                    _________________
Contractor Signature                 Labor Chief Signature

Date: ___________                    Date: ___________
    `;
  }

  private static async generatePDF(contractText: string, proposalId: string): Promise<string> {
    // Mock PDF generation - in real app would use PDF library
    const mockUrl = `https://contracts.example.com/labor-contract-${proposalId}.pdf`;
    return mockUrl;
  }

  private static async sendContractNotifications(
    proposal: LaborProposal,
    request: LaborRequest
  ): Promise<void> {
    // Notify contractor
    await NotificationService.createNotification({
      user_id: request.contractor_id,
      title: 'Contract Generated',
      message: 'A new labor contract has been generated and is ready for signing.',
      type: 'contract_generated',
      related_id: proposal.id,
      related_type: 'labor_proposal'
    });

    // Notify labor chief
    await NotificationService.createNotification({
      user_id: proposal.labor_chief_id,
      title: 'Contract Generated',
      message: 'A new labor contract has been generated and is ready for signing.',
      type: 'contract_generated',
      related_id: proposal.id,
      related_type: 'labor_proposal'
    });

    // Schedule reminder for 48 hours
    setTimeout(async () => {
      await this.sendSigningReminder(proposal, request);
    }, 48 * 60 * 60 * 1000); // 48 hours
  }

  private static async sendSigningReminder(
    proposal: LaborProposal,
    request: LaborRequest
  ): Promise<void> {
    if (!proposal.is_signed) {
      await NotificationService.createNotification({
        user_id: request.contractor_id,
        title: 'Contract Signing Reminder',
        message: 'Please sign your labor contract to proceed with the job.',
        type: 'contract_reminder',
        related_id: proposal.id,
        related_type: 'labor_proposal'
      });

      await NotificationService.createNotification({
        user_id: proposal.labor_chief_id,
        title: 'Contract Signing Reminder',
        message: 'Please sign your labor contract to proceed with the job.',
        type: 'contract_reminder',
        related_id: proposal.id,
        related_type: 'labor_proposal'
      });
    }
  }

  static async getContract(proposalId: string) {
    return this.contracts.find(c => c.proposal_id === proposalId);
  }

  static async getAllContracts() {
    return this.contracts;
  }

  static async markContractSigned(proposalId: string): Promise<void> {
    const contract = this.contracts.find(c => c.proposal_id === proposalId);
    if (contract) {
      contract.status = 'signed';
    }
  }
}

export { LaborContractGeneratorService };
export default LaborContractGeneratorService;