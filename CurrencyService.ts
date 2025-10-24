export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  last_updated: string;
}

export interface CurrencyConfig {
  default_currency: string;
  exchange_rates: CurrencyRate[];
  auto_update: boolean;
}

export class CurrencyService {
  private static exchangeRates: { [key: string]: number } = {
    'USD_MXN': 18.5,
    'MXN_USD': 0.054,
    'USD_EUR': 0.85,
    'EUR_USD': 1.18,
    'MXN_EUR': 0.046,
    'EUR_MXN': 21.7
  };

  private static currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'MXN': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$'
  };

  static formatCurrency(amount: number, currencyCode: string): string {
    const symbol = this.currencySymbols[currencyCode] || currencyCode;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    if (currencyCode === 'USD') {
      return `${symbol}${formatted} USD`;
    } else if (currencyCode === 'MXN') {
      return `${symbol}${formatted} MXN`;
    }
    return `${symbol}${formatted} ${currencyCode}`;
  }

  static convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = this.exchangeRates[rateKey];
    
    if (!rate) {
      console.warn(`Exchange rate not found for ${rateKey}`);
      return amount;
    }
    
    return amount * rate;
  }

  static formatDualCurrency(amount: number, baseCurrency: string, displayCurrency?: string): string {
    if (!displayCurrency || baseCurrency === displayCurrency) {
      return this.formatCurrency(amount, baseCurrency);
    }
    
    const convertedAmount = this.convert(amount, baseCurrency, displayCurrency);
    const baseFormatted = this.formatCurrency(amount, baseCurrency);
    const convertedFormatted = this.formatCurrency(convertedAmount, displayCurrency);
    
    return `${baseFormatted} (~${convertedFormatted})`;
  }

  static getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    return this.exchangeRates[rateKey] || 1;
  }

  static updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number): void {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    this.exchangeRates[rateKey] = rate;
  }

  static getSupportedCurrencies(): string[] {
    return Object.keys(this.currencySymbols);
  }
}