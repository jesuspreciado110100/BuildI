import React, { useEffect } from 'react';
import { ConceptBenchmarkService } from '../services/ConceptBenchmarkService';
import { notificationService } from '../services/NotificationService';
import { ConstructionConcept } from '../types';

interface BenchmarkNotificationSchedulerProps {
  contractorId: string;
  concepts: ConstructionConcept[];
}

export const BenchmarkNotificationScheduler: React.FC<BenchmarkNotificationSchedulerProps> = ({
  contractorId,
  concepts
}) => {
  useEffect(() => {
    // Schedule weekly digest
    const scheduleWeeklyDigest = () => {
      notificationService.scheduleWeeklyBenchmarkDigest(contractorId);
    };

    // Monitor concept performance for risk alerts
    const monitorConcepts = async () => {
      for (const concept of concepts) {
        if (concept.benchmarking_metrics) {
          await notificationService.monitorConceptPerformance(
            contractorId,
            concept.id,
            concept.name,
            concept.benchmarking_metrics
          );
        }
      }
    };

    // Initial setup
    scheduleWeeklyDigest();
    monitorConcepts();

    // Set up periodic monitoring (every hour in real app)
    const monitoringInterval = setInterval(monitorConcepts, 60000); // 1 minute for demo

    return () => {
      clearInterval(monitoringInterval);
    };
  }, [contractorId, concepts]);

  // This is a background component, no UI needed
  return null;
};

export default BenchmarkNotificationScheduler;