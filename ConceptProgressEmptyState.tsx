import React from 'react';
import { EmptyState } from './EmptyState';

interface ConceptProgressEmptyStateProps {
  onUploadPhoto: () => void;
}

export function ConceptProgressEmptyState({ onUploadPhoto }: ConceptProgressEmptyStateProps) {
  return (
    <EmptyState
      title="Nothing logged yet"
      description="Start documenting your project progress by uploading evidence photos and milestone updates."
      icon="📸"
      primaryCTA={{
        text: "Upload first evidence photo",
        onPress: onUploadPhoto
      }}
      secondaryCTA={{
        text: "Create milestone",
        onPress: () => console.log('Create milestone')
      }}
    />
  );
}