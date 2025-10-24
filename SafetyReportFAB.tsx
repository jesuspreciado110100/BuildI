import React, { useState } from 'react';
import { View } from 'react-native';
import { FloatingActionButton } from './FloatingActionButton';
import { SafetyIncidentModal } from './SafetyIncidentModal';
import { SafetyIncident } from '../types';

interface SafetyReportFABProps {
  siteId: string;
  reporterId: string;
  onIncidentCreated?: (incident: SafetyIncident) => void;
}

export const SafetyReportFAB: React.FC<SafetyReportFABProps> = ({
  siteId,
  reporterId,
  onIncidentCreated
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleIncidentCreated = (incident: SafetyIncident) => {
    onIncidentCreated?.(incident);
    setModalVisible(false);
  };

  return (
    <View>
      <FloatingActionButton
        icon="⚠️"
        label="Report Incident"
        onPress={() => setModalVisible(true)}
        backgroundColor="#FF3B30"
        position="bottom-right"
      />
      <SafetyIncidentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        siteId={siteId}
        reporterId={reporterId}
        onIncidentCreated={handleIncidentCreated}
      />
    </View>
  );
};