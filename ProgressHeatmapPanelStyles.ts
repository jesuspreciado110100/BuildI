import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Inter'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    fontFamily: 'Inter'
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'Inter'
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6
  },
  siteLabel: {
    width: 60
  },
  dateText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Inter'
  },
  heatmapGrid: {
    marginBottom: 16
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  siteText: {
    width: 60,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter'
  },
  tile: {
    flex: 1,
    height: 24,
    marginHorizontal: 1,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  tileText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Inter'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'Inter'
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter'
  },
  shimmerContainer: {
    opacity: 0.6
  },
  shimmerRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  shimmer: {
    backgroundColor: '#e5e7eb'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tooltip: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  tooltipTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Inter'
  },
  tooltipDate: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter'
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Inter'
  }
});