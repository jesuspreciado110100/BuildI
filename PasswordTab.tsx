import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityService } from './security/SecurityService';

export default function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await SecurityService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrent}
          placeholder="Enter current password"
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>New Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNew}
          placeholder="Enter new password"
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
          <Ionicons name={showNew ? 'eye-off' : 'eye'} size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        style={styles.inputFull}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholder="Confirm new password"
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Changing...' : 'Change Password'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9' },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  inputFull: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
