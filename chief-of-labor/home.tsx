import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityItem, ChiefOfLaborService, Contractor, formatAgo } from '@/app/services/ChiefOfLaborService';
import { LaborDataGate, useLaborData } from '@/app/components/LaborDataState';

// Inicio del contratista de mano de obra: sus números de hoy y lo último
// que pasó en sus obras (entradas que registró el residente, avance,
// inscripciones y constancias). Todo sale de Supabase.

interface HomeData {
  contractor: Contractor;
  activeCrews: number;
  sites: number;
  present: number;
  workers: number;
  blocked: number;
  activity: ActivityItem[];
}

async function loadHome(): Promise<HomeData> {
  const [contractor, sites, crews, blocked, activity] = await Promise.all([
    ChiefOfLaborService.getContractor(),
    ChiefOfLaborService.getSites(),
    ChiefOfLaborService.getCrews(),
    ChiefOfLaborService.countBlockedFronts(),
    ChiefOfLaborService.getRecentActivity(),
  ]);
  if (!contractor) throw new Error('No hay contratista.');
  const workers = await ChiefOfLaborService.getWorkers(sites);
  return {
    contractor,
    activeCrews: crews.filter(c => c.status === 'active').length,
    sites: sites.filter(s => s.active).length,
    present: workers.filter(w => w.attendance === 'present' || w.attendance === 'late').length,
    workers: workers.length,
    blocked,
    activity,
  };
}

const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = { success: '#10B981', info: '#3B82F6', warning: '#F59E0B' };

export default function ChiefOfLaborHome() {
  const { state, reload } = useLaborData(loadHome);
  return (
    <LaborDataGate title="Inicio" state={state} reload={reload}>
      {data => <HomeScreen data={data} reload={reload} />}
    </LaborDataGate>
  );
}

function HomeScreen({ data, reload }: { data: HomeData; reload: (silent?: boolean) => Promise<void> }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const stats = [
    { title: 'Cuadrillas activas', value: String(data.activeCrews), icon: 'people', color: '#3B82F6' },
    { title: 'Obras', value: String(data.sites), icon: 'construct', color: '#10B981' },
    { title: 'Llegaron hoy', value: `${data.present} de ${data.workers}`, icon: 'checkmark-circle', color: '#F59E0B' },
    { title: 'Frentes detenidos', value: String(data.blocked), icon: 'alert-circle', color: '#EF4444' },
  ];

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {data.contractor.display_name.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>{data.contractor.business_name}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.title} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <View style={styles.statHeader}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        {data.activity.length === 0 ? (
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>
              Aquí verás las entradas que registra el residente, el avance de tus frentes y los cursos de tu gente.
            </Text>
          </View>
        ) : (
          data.activity.map(activity => (
            <View key={activity.id} style={[styles.activityCard, { borderLeftWidth: 3, borderLeftColor: ACTIVITY_COLORS[activity.type] }]}>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{formatAgo(activity.at, activity.timezone)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/chief-of-labor/crew-manager')}>
        <Ionicons name="checkbox" size={24} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Pasar lista</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  activityTitle: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
