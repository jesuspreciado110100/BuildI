import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import ConceptFileUploader from './ConceptFileUploader';
import ConceptPreviewGrid from './ConceptPreviewGrid';

interface ConceptRow {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  group?: string;
}

interface ConceptGenerationWizardProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  onConceptsGenerated: (concepts: ConceptRow[]) => void;
}

const ConceptGenerationWizard: React.FC<ConceptGenerationWizardProps> = ({
  visible,
  onClose,
  siteId,
  onConceptsGenerated
}) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [extractedData, setExtractedData] = useState<ConceptRow[]>([]);

  const handleFileSelected = async (file: any) => {
    // Mock data extraction - in real implementation, parse Excel/PDF here
    const mockData: ConceptRow[] = [
      {
        id: '1',
        description: 'Concrete Foundation',
        unit: 'CY',
        quantity: 25,
        unitPrice: 150,
        group: 'Foundation'
      },
      {
        id: '2',
        description: 'Steel Framing',
        unit: 'LF',
        quantity: 500,
        unitPrice: 12.5,
        group: 'Structure'
      },
      {
        id: '3',
        description: 'Drywall Installation',
        unit: 'SF',
        quantity: 2000,
        unitPrice: 3.25,
        group: 'Interior'
      },
      {
        id: '4',
        description: 'Electrical Rough-in',
        unit: 'EA',
        quantity: 15,
        unitPrice: 250,
        group: 'MEP'
      },
      {
        id: '5',
        description: 'Plumbing Fixtures',
        unit: 'EA',
        quantity: 8,
        unitPrice: 180,
        group: 'MEP'
      }
    ];
    
    setExtractedData(mockData);
    setStep('preview');
  };

  const handleConfirmConcepts = (mappedData: ConceptRow[]) => {
    // Generate concepts with auto IDs and initialize progress
    const concepts = mappedData.map(row => ({
      ...row,
      id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      siteId,
      progress: 0,
      status: 'not_started' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    onConceptsGenerated(concepts);
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setExtractedData([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {step === 'upload' && (
          <ConceptFileUploader
            onFileSelected={handleFileSelected}
            siteId={siteId}
          />
        )}
        
        {step === 'preview' && (
          <ConceptPreviewGrid
            data={extractedData}
            onConfirm={handleConfirmConcepts}
            onCancel={handleClose}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default ConceptGenerationWizard;