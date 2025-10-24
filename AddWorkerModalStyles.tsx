import { StyleSheet } from 'react-native';

export const AddWorkerModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledButton: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  assignmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  optionText: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 12,
  },
  activeOptionText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  conceptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conceptDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  volumeText: {
    fontSize: 12,
    color: '#475569',
  },
  priceText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '500',
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  assignmentButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeAssignmentButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  assignmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeAssignmentButtonText: {
    color: '#0EA5E9',
  },
});