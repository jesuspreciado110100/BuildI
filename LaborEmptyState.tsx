import React from 'react';
import { EmptyState } from './EmptyState';

interface LaborEmptyStateProps {
  onSendRequest: () => void;
}

export function LaborEmptyState({ onSendRequest }: LaborEmptyStateProps) {
  return (
    <EmptyState
      title="No proposals submitted yet"
      description="Connect with skilled crews by sending open requests to get competitive proposals."
      icon="👷"
      primaryCTA={{
        text: "Send open request to crews",
        onPress: onSendRequest
      }}
      secondaryCTA={{
        text: "Browse available crews",
        onPress: () => console.log('Browse crews')
      }}
    />
  );
}