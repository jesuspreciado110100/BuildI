import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/context/AuthContext';
import BookingDashboard from '@/app/components/machinery/BookingDashboard';
import BookingList from '@/app/components/machinery/BookingList';
import BookingCalendar from '@/app/components/machinery/BookingCalendar';
import RevenueChart from '@/app/components/machinery/RevenueChart';
import BookingService, { MachineryBooking } from '@/app/services/BookingService';

export default function MachineryRenterHome() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'active' | 'completed' | 'calendar' | 'analytics'>('dashboard');
  const [selectedBooking, setSelectedBooking] = useState<MachineryBooking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [processing, setProcessing] = useState(false);

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    setProcessing(true);
    const status = action === 'accept' ? 'accepted' : 'rejected';
    const rejectionReason = action === 'reject' ? 'Not available for the requested dates' : undefined;
    
    const { data, error } = await BookingService.updateBookingStatus(bookingId, status, rejectionReason);
    
    if (!error) {
      Alert.alert('Success', `Booking ${action}ed successfully`);
      setModalVisible(false);
      setSelectedBooking(null);
    } else {
      Alert.alert('Error', `Failed to ${action} booking`);
    }
    setProcessing(false);
  };

  const exportFinancialReport = async () => {
    try {
      const { data: bookings } = await BookingService.getBookingsByRenter(user?.id || '');
      
      // Create CSV content
      let csvContent = 'Date,Contractor,Company,Machinery,Days,Amount,Status,Payment Status\n';
      bookings?.forEach(booking => {
        csvContent += `${booking.start_date},${booking.contractor_name},${booking.contractor_company || ''},${booking.machinery?.name || ''},${booking.total_days},${booking.total_amount},${booking.status},${booking.payment_status}\n`;
      });

      // Create a simple alert with the report summary
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const totalBookings = bookings?.length || 0;
      
      Alert.alert(
        'Financial Report',
        `Total Bookings: ${totalBookings}\nTotal Revenue: $${totalRevenue.toFixed(2)}\n\nReport data has been generated.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const renderBookingModal = () => {
    if (!selectedBooking) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Contractor Information</Text>
                <Text style={styles.detailText}>Name: {selectedBooking.contractor_name}</Text>
                <Text style={styles.detailText}>Company: {selectedBooking.contractor_company}</Text>
                <Text style={styles.detailText}>Phone: {selectedBooking.contractor_phone}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
                <Text style={styles.detailText}>
                  Machinery: {selectedBooking.machinery?.name || 'Unknown'}
                </Text>
                <Text style={styles.detailText}>
                  Start Date: {new Date(selectedBooking.start_date).toLocaleDateString()}
                </Text>
                <Text style={styles.detailText}>
                  End Date: {new Date(selectedBooking.end_date).toLocaleDateString()}
                </Text>
                <Text style={styles.detailText}>Duration: {selectedBooking.total_days} days</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Financial Details</Text>
                <Text style={styles.detailText}>Daily Rate: ${selectedBooking.daily_rate}</Text>
                <Text style={styles.detailText}>Total Amount: ${selectedBooking.total_amount}</Text>
                <Text style={styles.detailText}>
                  Payment Status: {selectedBooking.payment_status}
                </Text>
              </View>

              {selectedBooking.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.detailText}>{selectedBooking.notes}</Text>
                </View>
              )}

              {selectedBooking.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleBookingAction(selectedBooking.id, 'accept')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Accept Booking</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleBookingAction(selectedBooking.id, 'reject')}
                    disabled={processing}
                  >
                    <Text style={styles.buttonText}>Reject Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        style={styles.tabBar}
        showsHorizontalScrollIndicator={false}
      >
        {[
          { id: 'dashboard', label: 'Overview', icon: 'grid' },
          { id: 'pending', label: 'Pending', icon: 'time' },
          { id: 'active', label: 'Active', icon: 'checkmark-circle' },
          { id: 'completed', label: 'Completed', icon: 'archive' },
          { id: 'calendar', label: 'Calendar', icon: 'calendar' },
          { id: 'analytics', label: 'Analytics', icon: 'stats-chart' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTabStyle]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <BookingDashboard onViewDetails={(id) => {}} />
            <RevenueChart period={chartPeriod} />
            <View style={styles.periodSelector}>
              {(['daily', 'weekly', 'monthly'] as const).map(period => (
                <TouchableOpacity
                  key={period}
                  style={[styles.periodButton, chartPeriod === period && styles.activePeriod]}
                  onPress={() => setChartPeriod(period)}
                >
                  <Text style={[styles.periodText, chartPeriod === period && styles.activePeriodText]}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {(activeTab === 'pending' || activeTab === 'active' || activeTab === 'completed') && (
          <BookingList 
            status={activeTab as any}
            onBookingPress={(booking) => {
              setSelectedBooking(booking);
              setModalVisible(true);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <BookingCalendar />
        )}

        {activeTab === 'analytics' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.analyticsContainer}>
              <Text style={styles.analyticsTitle}>Revenue Analytics</Text>
              <RevenueChart period="monthly" />
              
              <TouchableOpacity 
                style={styles.exportButton}
                onPress={exportFinancialReport}
              >
                <Ionicons name="download" size={20} color="white" />
                <Text style={styles.exportButtonText}>Export Financial Report</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {renderBookingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    backgroundColor: 'white',
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeTabStyle: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activePeriod: {
    backgroundColor: '#4CAF50',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
  },
  activePeriodText: {
    color: 'white',
    fontWeight: '600',
  },
  analyticsContainer: {
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    gap: 8,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});