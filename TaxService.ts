interface TaxCalculation {
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  tax_label: string;
  total_with_tax: number;
}

interface TaxRegionConfig {
  tax_rate: number;
  tax_label: string;
  currency_symbol: string;
  date_format: string;
  requires_tax_id: boolean;
  supports_cfdi: boolean;
}

interface InvoiceFormatting {
  header_format: string;
  tax_display_format: string;
  footer_format: string;
  legal_disclaimer: string;
}

class TaxService {
  private static taxRegions: Record<string, TaxRegionConfig> = {
    'MX': {
      tax_rate: 0.16,
      tax_label: 'IVA',
      currency_symbol: '$',
      date_format: 'DD/MM/YYYY',
      requires_tax_id: true,
      supports_cfdi: true
    },
    'US': {
      tax_rate: 0.08,
      tax_label: 'Sales Tax',
      currency_symbol: '$',
      date_format: 'MM/DD/YYYY',
      requires_tax_id: false,
      supports_cfdi: false
    },
    'CA': {
      tax_rate: 0.13,
      tax_label: 'HST',
      currency_symbol: '$',
      date_format: 'DD/MM/YYYY',
      requires_tax_id: true,
      supports_cfdi: false
    }
  };

  static calculateTax(subtotal: number, rate?: number, region?: string): TaxCalculation {
    const regionConfig = region ? this.taxRegions[region] : null;
    const taxRate = rate || regionConfig?.tax_rate || 0;
    const taxLabel = regionConfig?.tax_label || 'Tax';
    
    const taxAmount = subtotal * taxRate;
    const totalWithTax = subtotal + taxAmount;

    return {
      subtotal,
      tax_amount: taxAmount,
      tax_rate: taxRate,
      tax_label: taxLabel,
      total_with_tax: totalWithTax
    };
  }

  static formatInvoice(invoiceData: any, region: string): InvoiceFormatting {
    const regionConfig = this.taxRegions[region];
    if (!regionConfig) {
      throw new Error(`Unsupported tax region: ${region}`);
    }

    const headerFormat = this.getHeaderFormat(region);
    const taxDisplayFormat = this.getTaxDisplayFormat(region);
    const footerFormat = this.getFooterFormat(region);
    const legalDisclaimer = this.getLegalDisclaimer(region);

    return {
      header_format: headerFormat,
      tax_display_format: taxDisplayFormat,
      footer_format: footerFormat,
      legal_disclaimer: legalDisclaimer
    };
  }

  private static getHeaderFormat(region: string): string {
    switch (region) {
      case 'MX':
        return 'RFC: {tax_id} | Régimen: {tax_regime}';
      case 'US':
        return 'Tax ID: {tax_id} | EIN: {ein}';
      case 'CA':
        return 'GST/HST: {tax_id} | Business Number: {business_number}';
      default:
        return 'Tax ID: {tax_id}';
    }
  }

  private static getTaxDisplayFormat(region: string): string {
    switch (region) {
      case 'MX':
        return 'Subtotal: {subtotal}\nIVA (16%): {tax_amount}\nTotal: {total}';
      case 'US':
        return 'Subtotal: {subtotal}\nSales Tax: {tax_amount}\nTotal: {total}';
      case 'CA':
        return 'Subtotal: {subtotal}\nHST: {tax_amount}\nTotal: {total}';
      default:
        return 'Subtotal: {subtotal}\nTax: {tax_amount}\nTotal: {total}';
    }
  }

  private static getFooterFormat(region: string): string {
    switch (region) {
      case 'MX':
        return 'Este documento es una representación impresa de un CFDI';
      case 'US':
        return 'Payment terms: Net 30 days';
      case 'CA':
        return 'GST/HST Registration: {tax_id}';
      default:
        return 'Thank you for your business';
    }
  }

  private static getLegalDisclaimer(region: string): string {
    switch (region) {
      case 'MX':
        return 'Factura generada conforme a la legislación fiscal mexicana';
      case 'US':
        return 'This invoice complies with US tax regulations';
      case 'CA':
        return 'This invoice complies with Canadian tax regulations';
      default:
        return 'This invoice complies with local tax regulations';
    }
  }

  static getTaxRegionConfig(region: string): TaxRegionConfig | null {
    return this.taxRegions[region] || null;
  }

  static getSupportedRegions(): string[] {
    return Object.keys(this.taxRegions);
  }

  static generateCFDI(invoiceData: any): string {
    // Mock CFDI XML generation for Mexico
    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3">
  <cfdi:Emisor Rfc="${invoiceData.supplier_tax_id}" Nombre="${invoiceData.supplier_name}"/>
  <cfdi:Receptor Rfc="${invoiceData.client_tax_id}" Nombre="${invoiceData.client_name}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto Cantidad="${invoiceData.quantity}" Descripcion="${invoiceData.description}" ValorUnitario="${invoiceData.unit_price}" Importe="${invoiceData.total}"/>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${invoiceData.tax_amount}">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${invoiceData.tax_amount}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
</cfdi:Comprobante>`;
  }
}

export default TaxService;