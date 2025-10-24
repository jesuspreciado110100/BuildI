import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

export const AddToHomeScreenPrompt: React.FC = () => {
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToHomeScreen = () => {
    HapticFeedbackService.onSuccess();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    HapticFeedbackService.onButtonPress();
    setShowPrompt(false);
  };

  return (
    <Modal
      visible={showPrompt}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>📱 Add to Home Screen</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            Install this app on your home screen for quick access!
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.dismissButton, { borderColor: theme.colors.border }]}
              onPress={handleDismiss}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddToHomeScreen}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButton: {
    borderWidth: 1,
  },
  addButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});