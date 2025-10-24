export interface RentalContractData {
  bookingId: string;
  machine: {
    model: string;
    brand: string;
    serialNumber: string;
    hourlyRate: number;
  };
  contractor: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  renter: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  operator?: {
    name: string;
    license: string;
    phone: string;
  };
  rental: {
    startDate: string;
    endDate: string;
    location: string;
    totalHours: number;
    totalCost: number;
  };
  terms: {
    damageDeposit: number;
    fuelPolicy: string;
    cancellationPolicy: string;
    insuranceRequired: boolean;
  };
}

export interface ContractPDF {
  id: string;
  bookingId: string;
  fileName: string;
  downloadUrl: string;
  createdAt: Date;
  contractorSigned: boolean;
  renterSigned: boolean;
}

class RentalContractService {
  private contracts: Map<string, ContractPDF> = new Map();

  generateContract(data: RentalContractData): ContractPDF {
    const contractId = `contract_${data.bookingId}_${Date.now()}`;
    const fileName = `rental_agreement_${data.bookingId}.pdf`;
    
    // In a real app, this would generate an actual PDF
    const mockPdfUrl = `https://example.com/contracts/${fileName}`;
    
    const contract: ContractPDF = {
      id: contractId,
      bookingId: data.bookingId,
      fileName,
      downloadUrl: mockPdfUrl,
      createdAt: new Date(),
      contractorSigned: false,
      renterSigned: false
    };

    this.contracts.set(contractId, contract);
    return contract;
  }

  getContract(contractId: string): ContractPDF | null {
    return this.contracts.get(contractId) || null;
  }

  getContractByBooking(bookingId: string): ContractPDF | null {
    for (const contract of this.contracts.values()) {
      if (contract.bookingId === bookingId) {
        return contract;
      }
    }
    return null;
  }

  signContract(contractId: string, signedBy: 'contractor' | 'renter'): boolean {
    const contract = this.contracts.get(contractId);
    if (!contract) return false;

    if (signedBy === 'contractor') {
      contract.contractorSigned = true;
    } else {
      contract.renterSigned = true;
    }

    this.contracts.set(contractId, contract);
    return true;
  }

  isFullySigned(contractId: string): boolean {
    const contract = this.contracts.get(contractId);
    return contract ? contract.contractorSigned && contract.renterSigned : false;
  }

  downloadContract(contractId: string): Promise<string> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Mock download - in real app would return actual file
    return Promise.resolve(contract.downloadUrl);
  }

  generateContractHTML(data: RentalContractData): string {
    return `
      <html>
        <head><title>Rental Agreement</title></head>
        <body>
          <h1>MACHINERY RENTAL AGREEMENT</h1>
          <p><strong>Contract ID:</strong> ${data.bookingId}</p>
          
          <h2>EQUIPMENT DETAILS</h2>
          <p><strong>Machine:</strong> ${data.machine.brand} ${data.machine.model}</p>
          <p><strong>Serial Number:</strong> ${data.machine.serialNumber}</p>
          <p><strong>Hourly Rate:</strong> $${data.machine.hourlyRate}</p>
          
          <h2>RENTAL PERIOD</h2>
          <p><strong>Start:</strong> ${data.rental.startDate}</p>
          <p><strong>End:</strong> ${data.rental.endDate}</p>
          <p><strong>Location:</strong> ${data.rental.location}</p>
          <p><strong>Total Hours:</strong> ${data.rental.totalHours}</p>
          <p><strong>Total Cost:</strong> $${data.rental.totalCost}</p>
          
          <h2>PARTIES</h2>
          <p><strong>Renter:</strong> ${data.renter.name} (${data.renter.company})</p>
          <p><strong>Contractor:</strong> ${data.contractor.name} (${data.contractor.company})</p>
          
          <h2>TERMS & CONDITIONS</h2>
          <p><strong>Damage Deposit:</strong> $${data.terms.damageDeposit}</p>
          <p><strong>Fuel Policy:</strong> ${data.terms.fuelPolicy}</p>
          <p><strong>Insurance Required:</strong> ${data.terms.insuranceRequired ? 'Yes' : 'No'}</p>
          
          <div style="margin-top: 50px;">
            <p>Contractor Signature: ___________________ Date: ___________</p>
            <p>Renter Signature: ___________________ Date: ___________</p>
          </div>
        </body>
      </html>
    `;
  }
}

export const rentalContractService = new RentalContractService();