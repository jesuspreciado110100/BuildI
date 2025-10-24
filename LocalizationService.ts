import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

type UnitType = 'area' | 'volume' | 'weight' | 'length' | 'temperature';
type UnitSystem = 'metric' | 'imperial';
type Language = 'en' | 'es';

interface UnitConversion {
  metric: { unit: string; factor: number };
  imperial: { unit: string; factor: number };
}

const translations: Record<Language, any> = {
  en: enTranslations,
  es: esTranslations
};

const unitConversions: Record<UnitType, UnitConversion> = {
  area: {
    metric: { unit: 'm²', factor: 1 },
    imperial: { unit: 'ft²', factor: 10.764 }
  },
  volume: {
    metric: { unit: 'm³', factor: 1 },
    imperial: { unit: 'ft³', factor: 35.314 }
  },
  weight: {
    metric: { unit: 'kg', factor: 1 },
    imperial: { unit: 'lbs', factor: 2.205 }
  },
  length: {
    metric: { unit: 'm', factor: 1 },
    imperial: { unit: 'ft', factor: 3.281 }
  },
  temperature: {
    metric: { unit: '°C', factor: 1 },
    imperial: { unit: '°F', factor: 1 }
  }
};

export class LocalizationService {
  private static currentLanguage: Language = 'en';
  private static currentUnitSystem: UnitSystem = 'metric';

  static setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  static setUnitSystem(unitSystem: UnitSystem): void {
    this.currentUnitSystem = unitSystem;
  }

  static getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  static getCurrentUnitSystem(): UnitSystem {
    return this.currentUnitSystem;
  }

  static t(key: string, lang?: Language): string {
    const language = lang || this.currentLanguage;
    const translation = translations[language];
    
    if (!translation) {
      return key;
    }

    const keys = key.split('.');
    let result = translation;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  }

  static formatMeasurement(
    value: number,
    unitType: UnitType,
    unitSystem?: UnitSystem,
    precision: number = 1
  ): string {
    const system = unitSystem || this.currentUnitSystem;
    const conversion = unitConversions[unitType];
    
    if (!conversion) {
      return `${value}`;
    }

    const targetUnit = conversion[system];
    const convertedValue = system === 'metric' ? value : value * targetUnit.factor;
    const formattedValue = convertedValue.toFixed(precision);
    
    return `${formattedValue} ${targetUnit.unit}`;
  }

  static formatProgressMessage(
    value: number,
    unitType: UnitType,
    concept: string,
    action: string = 'completed'
  ): string {
    const measurement = this.formatMeasurement(value, unitType);
    const translatedConcept = this.t(`concepts.${concept}`);
    const translatedAction = this.t(`measurements.${action}`);
    
    return `${this.t('dashboard.progress')}: ${measurement} ${translatedConcept} ${translatedAction}`;
  }

  static formatNotification(
    type: string,
    details: Record<string, any>
  ): string {
    const baseMessage = this.t(`notifications.${type}`);
    
    if (details.measurement && details.unitType) {
      const measurement = this.formatMeasurement(details.measurement, details.unitType);
      return `${baseMessage} - ${measurement}`;
    }
    
    return baseMessage;
  }

  static getAvailableLanguages(): Array<{ code: Language; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' }
    ];
  }

  static getAvailableUnitSystems(): Array<{ code: UnitSystem; name: string }> {
    return [
      { code: 'metric', name: this.t('common.metric') },
      { code: 'imperial', name: this.t('common.imperial') }
    ];
  }

  static detectBrowserLanguage(): Language {
    const browserLang = navigator.language.split('-')[0] as Language;
    return translations[browserLang] ? browserLang : 'en';
  }

  static convertTemperature(value: number, fromSystem: UnitSystem, toSystem: UnitSystem): number {
    if (fromSystem === toSystem) return value;
    
    if (fromSystem === 'metric' && toSystem === 'imperial') {
      return (value * 9/5) + 32; // Celsius to Fahrenheit
    } else if (fromSystem === 'imperial' && toSystem === 'metric') {
      return (value - 32) * 5/9; // Fahrenheit to Celsius
    }
    
    return value;
  }
}