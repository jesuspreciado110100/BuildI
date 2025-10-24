export class QRGeneratorService {
  // Generate QR code for material order
  static generateMaterialOrderQR(orderId: string): string {
    const qrData = {
      type: 'material_order',
      id: orderId,
      timestamp: new Date().toISOString()
    };
    return `QR_MATERIAL_${orderId}_${Date.now()}`;
  }

  // Generate QR code for construction concept
  static generateConceptQR(conceptId: string): string {
    const qrData = {
      type: 'concept',
      id: conceptId,
      timestamp: new Date().toISOString()
    };
    return `QR_CONCEPT_${conceptId}_${Date.now()}`;
  }

  // Generate printable QR code data
  static generatePrintableQR(type: 'material' | 'concept', id: string, name: string): {
    qr_code: string;
    display_text: string;
    print_url: string;
  } {
    const qrCode = type === 'material' 
      ? this.generateMaterialOrderQR(id)
      : this.generateConceptQR(id);
    
    return {
      qr_code: qrCode,
      display_text: `${type.toUpperCase()}: ${name}`,
      print_url: `data:image/svg+xml;base64,${btoa(this.generateQRSVG(qrCode))}`
    };
  }

  // Generate SVG QR code (mock implementation)
  private static generateQRSVG(data: string): string {
    return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black" opacity="0.1"/>
      <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="8">${data}</text>
      <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="10">QR Code</text>
    </svg>`;
  }

  // Decode QR code data
  static decodeQR(qrCode: string): {
    type: 'material_order' | 'concept' | 'unknown';
    id: string;
    isValid: boolean;
  } {
    if (qrCode.startsWith('QR_MATERIAL_')) {
      const parts = qrCode.split('_');
      return {
        type: 'material_order',
        id: parts[2],
        isValid: true
      };
    }
    
    if (qrCode.startsWith('QR_CONCEPT_')) {
      const parts = qrCode.split('_');
      return {
        type: 'concept',
        id: parts[2],
        isValid: true
      };
    }
    
    return {
      type: 'unknown',
      id: '',
      isValid: false
    };
  }

  // Generate batch QR codes for multiple items
  static generateBatchQRs(items: Array<{id: string; name: string; type: 'material' | 'concept'}>): Array<{
    id: string;
    name: string;
    qr_code: string;
    print_url: string;
  }> {
    return items.map(item => {
      const printable = this.generatePrintableQR(item.type, item.id, item.name);
      return {
        id: item.id,
        name: item.name,
        qr_code: printable.qr_code,
        print_url: printable.print_url
      };
    });
  }
}