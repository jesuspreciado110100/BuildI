export class MachineryRequestService {
  static async submitRequest(request: any) {
    console.log('Submitting machinery request:', request);
    return { id: Date.now().toString(), ...request, status: 'pending' };
  }

  static async getRequests(contractorId: string) {
    return [
      {
        id: '1',
        category: 'excavator',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        budget: 4000,
        finalPrice: 4400,
        region: 'Downtown',
        status: 'accepted',
        createdAt: '2024-01-15T10:00:00Z',
        acceptedBy: 'Heavy Equipment Co.',
        renterId: 'rent1'
      }
    ];
  }

  static async updateRequestStatus(requestId: string, status: string) {
    console.log('Updating request status:', requestId, status);
    return true;
  }
}