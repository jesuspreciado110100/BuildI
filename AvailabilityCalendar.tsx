import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';

interface AvailabilityCalendarProps {
  workerId: string;
  onDateSelect?: (date: string) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  workerId,
  onDateSelect
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  const getSlotColor = (day: number, time: string) => {
    const isAvailable = Math.random() > 0.3;
    return isAvailable ? '#4CAF50' : '#F44336';
  };

  const handleSlotPress = (day: number, time: string) => {
    const dateStr = `2024-01-${day + 1} ${time}`;
    setSelectedDate(dateStr);
    onDateSelect?.(dateStr);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Worker Availability</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.calendar}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayHeader}>
              <Text style={styles.dayName}>{day}</Text>
              <Text style={styles.dayDate}>{index + 1}</Text>
            </View>
          ))}
        </View>

        {timeSlots.map((time, timeIndex) => (
          <View key={timeIndex} style={styles.timeBlockRow}>
            <Text style={styles.timeLabel}>{time}</Text>
            {weekDays.map((_, dayIndex) => (
              <View key={dayIndex} style={styles.timeSlot}>
                <TouchableOpacity
                  style={[
                    styles.slotButton,
                    { backgroundColor: getSlotColor(dayIndex, time) }
                  ]}
                  onPress={() => handleSlotPress(dayIndex, time)}
                >
                  <Text style={styles.slotText}>✓</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal visible={showNoteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter booking note..."
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  legend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 5 },
  legendText: { fontSize: 12, color: '#6b7280' },
  calendar: { flex: 1 },
  weekHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  dayHeader: { flex: 1, alignItems: 'center' },
  dayName: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  dayDate: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  timeBlockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  timeLabel: { width: 80, fontSize: 12, color: '#6b7280', textAlign: 'center', fontWeight: '500' },
  timeSlot: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  slotButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  slotText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  noteInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelButton: { backgroundColor: '#6b7280', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  cancelText: { color: 'white', fontWeight: '600' },
  saveButton: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: 'white', fontWeight: '600' }
});