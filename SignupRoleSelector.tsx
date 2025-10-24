import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

interface SignupRoleSelectorProps {
  onSelectRole: (role: string) => void;
  onBack: () => void;
}

const roleImages: { [key: string]: string } = {
  contractor: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708930073_5c981b82.webp',
  builder: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708933764_0acf480b.webp',
  machineryrenter: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708937736_2633e02b.webp',
  client: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708941893_6d99526f.webp',
  'material-supplier': 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708947061_66cf73ac.webp',
  'chief-of-labor': 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1759708950865_4ba51243.webp'
};

const SignupRoleSelector: React.FC<SignupRoleSelectorProps> = ({ onSelectRole, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { id: 'contractor', title: 'Contractor', description: 'Manage construction projects and teams' },
    { id: 'builder', title: 'Builder', description: 'Build and develop properties' },
    { id: 'machineryrenter', title: 'Machinery Renter', description: 'Rent out construction equipment' },
    { id: 'client', title: 'Client', description: 'Hire contractors for projects' },
    { id: 'material-supplier', title: 'Material Supplier', description: 'Supply construction materials' },
    { id: 'chief-of-labor', title: 'Chief of Labor', description: 'Manage workforce and labor' }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>This will be your primary account type</Text>
      
      <ScrollView contentContainerStyle={styles.rolesContainer} showsVerticalScrollIndicator={false}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, selectedRole === role.id && styles.selectedCard]}
            onPress={() => handleRoleSelect(role.id)}
            activeOpacity={0.8}
          >
            <ImageBackground source={{ uri: roleImages[role.id] }} style={styles.cardBackground} imageStyle={styles.cardImage}>
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.continueButton, !selectedRole && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  rolesContainer: { paddingBottom: 100 },
  roleCard: { width: width - 40, height: 180, marginBottom: 16, borderRadius: 16, overflow: 'hidden', elevation: 5 },
  selectedCard: { borderWidth: 3, borderColor: '#4CAF50' },
  cardBackground: { flex: 1, width: '100%', height: '100%' },
  cardImage: { borderRadius: 16 },
  gradient: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  cardContent: { padding: 20 },
  roleTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  roleDescription: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  buttonContainer: { flexDirection: 'row', position: 'absolute', bottom: 20, left: 20, right: 20, gap: 10 },
  backButton: { flex: 1, padding: 16, backgroundColor: '#E2E8F0', borderRadius: 8, alignItems: 'center' },
  backButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  continueButton: { flex: 1, padding: 16, backgroundColor: '#007aff', borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  continueButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});

export default SignupRoleSelector;
