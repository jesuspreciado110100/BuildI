import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground
} from 'react-native';

const { width } = Dimensions.get('window');

interface RoleSelectorProps {
  onSelectRole: (role: string) => void;
}

const roleImages: { [key: string]: string } = {
  builder: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708933764_0acf480b.webp',
  machineryrenter: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708937736_2633e02b.webp',
  client: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708941893_6d99526f.webp',
  'chief-of-labor': 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708950865_4ba51243.webp'
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { id: 'builder', title: 'Builder', description: 'Build and develop properties' },
    { id: 'client', title: 'Client', description: 'Hire contractors for projects' },
    { id: 'machineryrenter', title: 'Machinery Renter', description: 'Rent out construction equipment' },
    { id: 'chief-of-labor', title: 'Chief of Labor', description: 'Manage workforce and labor' }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    onSelectRole(roleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you'll use the platform</Text>
      
      <ScrollView contentContainerStyle={styles.rolesContainer} showsVerticalScrollIndicator={false}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, selectedRole === role.id && styles.selectedCard]}
            onPress={() => handleRoleSelect(role.id)}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: roleImages[role.id] }}
              style={styles.cardBackground}
              imageStyle={styles.cardImage}
            >
              <View style={styles.gradient}>
                <View style={styles.cardContent}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  rolesContainer: { paddingBottom: 20 },
  roleCard: { width: width - 40, height: 180, marginBottom: 16, borderRadius: 16, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 10 },
  selectedCard: { borderWidth: 3, borderColor: '#4CAF50' },
  cardBackground: { flex: 1, width: '100%', height: '100%' },
  cardImage: { borderRadius: 16 },
  gradient: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  cardContent: { padding: 20 },
  roleTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  roleDescription: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 18 }
});

export default RoleSelector;
