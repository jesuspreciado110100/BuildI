import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepIndicator: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    color: '#64748b',
  },
  stepContainer: {
    padding: 20,
    maxHeight: 400,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryTile: {
    width: '48%',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTile: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    marginRight: 8,
  },
  selectedDropdownItem: {
    backgroundColor: '#0ea5e9',
  },
  dropdownText: {
    color: '#475569',
  },
  selectedDropdownText: {
    color: 'white',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  inputText: {
    fontSize: 16,
    color: '#1e293b',
  },
  placeholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#0ea5e9',
  },
  toggleText: {
    color: '#64748b',
    fontSize: 14,
  },
  activeToggleText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  cancelText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  backText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  completeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  completeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
  },
  disabledText: {
    color: '#94a3b8',
  },
});