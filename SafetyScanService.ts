export interface SafetyViolation {
  id: string;
  type: 'missing_helmet' | 'missing_vest' | 'missing_gloves' | 'unsafe_posture' | 'unsafe_behavior';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface SafetyScanResult {
  id: string;
  photoUrl: string;
  scannedAt: Date;
  violations: SafetyViolation[];
  overallScore: number;
  status: 'safe' | 'warning' | 'violation';
}

class SafetyScanService {
  private mockViolationTypes = [
    { type: 'missing_helmet', severity: 'high', description: 'Hard hat not detected' },
    { type: 'missing_vest', severity: 'medium', description: 'Safety vest not visible' },
    { type: 'missing_gloves', severity: 'low', description: 'Protective gloves not worn' },
    { type: 'unsafe_posture', severity: 'medium', description: 'Unsafe working posture detected' },
    { type: 'unsafe_behavior', severity: 'high', description: 'Unsafe behavior identified' }
  ];

  async scanPhoto(photoUrl: string): Promise<SafetyScanResult> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const violations: SafetyViolation[] = [];
    const numViolations = Math.floor(Math.random() * 3); // 0-2 violations

    for (let i = 0; i < numViolations; i++) {
      const mockType = this.mockViolationTypes[Math.floor(Math.random() * this.mockViolationTypes.length)];
      violations.push({
        id: `violation_${Date.now()}_${i}`,
        type: mockType.type as any,
        severity: mockType.severity as any,
        confidence: 0.7 + Math.random() * 0.3,
        description: mockType.description,
        boundingBox: {
          x: Math.random() * 0.6,
          y: Math.random() * 0.6,
          width: 0.2 + Math.random() * 0.2,
          height: 0.2 + Math.random() * 0.2
        }
      });
    }

    const overallScore = violations.length === 0 ? 100 : 
      Math.max(20, 100 - (violations.length * 25) - 
      violations.reduce((acc, v) => acc + (v.severity === 'high' ? 20 : v.severity === 'medium' ? 10 : 5), 0));

    const status = overallScore >= 80 ? 'safe' : overallScore >= 60 ? 'warning' : 'violation';

    return {
      id: `scan_${Date.now()}`,
      photoUrl,
      scannedAt: new Date(),
      violations,
      overallScore,
      status
    };
  }

  async scanMultiplePhotos(photoUrls: string[]): Promise<SafetyScanResult[]> {
    const results = [];
    for (const url of photoUrls) {
      results.push(await this.scanPhoto(url));
    }
    return results;
  }
}

export default new SafetyScanService();