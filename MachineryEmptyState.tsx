import React from 'react';
import { EmptyState } from './EmptyState';

interface MachineryEmptyStateProps {
  onRequestMachine: () => void;
}

export function MachineryEmptyState({ onRequestMachine }: MachineryEmptyStateProps) {
  return (
    <EmptyState
      title="No rentals yet"
      description="Start by requesting machinery from nearby suppliers to get your project moving."
      icon="🏗️"
      primaryCTA={{
        text: "Request nearby machine",
        onPress: onRequestMachine
      }}
      secondaryCTA={{
        text: "Browse catalog",
        onPress: () => console.log('Browse catalog')
      }}
    />
  );
}