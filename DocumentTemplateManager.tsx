import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { TemplateLibrary } from './TemplateLibrary';
import { TemplateEditor } from './TemplateEditor';
import { TemplateRenderer } from './TemplateRenderer';
import { DocumentTemplate } from '../services/DocumentTemplateService';

interface DocumentTemplateManagerProps {
  visible: boolean;
  onClose: () => void;
  onDocumentCreated?: (data: { [key: string]: any }, template: DocumentTemplate) => void;
}

export const DocumentTemplateManager: React.FC<DocumentTemplateManagerProps> = ({
  visible,
  onClose,
  onDocumentCreated
}) => {
  const [currentView, setCurrentView] = useState<'library' | 'editor' | 'renderer'>('library');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('renderer');
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setCurrentView('editor');
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setCurrentView('editor');
  };

  const handleSaveTemplate = (template: DocumentTemplate) => {
    setCurrentView('library');
    setEditingTemplate(null);
  };

  const handleSaveDocument = (data: { [key: string]: any }) => {
    if (selectedTemplate && onDocumentCreated) {
      onDocumentCreated(data, selectedTemplate);
    }
    onClose();
  };

  const handleCancel = () => {
    if (currentView === 'library') {
      onClose();
    } else {
      setCurrentView('library');
      setSelectedTemplate(null);
      setEditingTemplate(null);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'library':
        return (
          <TemplateLibrary
            onSelectTemplate={handleSelectTemplate}
            onCreateNew={handleCreateNew}
          />
        );
      case 'editor':
        return (
          <TemplateEditor
            template={editingTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={handleCancel}
          />
        );
      case 'renderer':
        return selectedTemplate ? (
          <TemplateRenderer
            template={selectedTemplate}
            onSave={handleSaveDocument}
            onCancel={handleCancel}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {renderCurrentView()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});