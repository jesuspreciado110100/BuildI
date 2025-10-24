import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import SignupRoleSelector from './SignupRoleSelector';
import { SocialLoginButton } from './SocialLoginButton';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSignupStep2, setIsSignupStep2] = useState(false);
  const { login, signup, isLoading, setNeedsProfileCompletion } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && !selectedRole) {
      setIsSignupStep2(true);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        setNeedsProfileCompletion(false);
      } else {
        await signup(email, password, { name, role: selectedRole });
        setNeedsProfileCompletion(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    Alert.alert('Social Login', `${provider} login coming soon!`);
  };

  if (isSignupStep2) {
    return (
      <SignupRoleSelector 
        onSelectRole={(role) => {
          setSelectedRole(role);
          setIsSignupStep2(false);
        }}
        onBack={() => setIsSignupStep2(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1752439416975_2cdd4474.jpeg' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

      <View style={styles.socialContainer}>
        <SocialLoginButton provider="google" onPress={() => handleSocialLogin('Google')} disabled={isLoading} />
        <SocialLoginButton provider="facebook" onPress={() => handleSocialLogin('Facebook')} disabled={isLoading} />
        <SocialLoginButton provider="apple" onPress={() => handleSocialLogin('Apple')} disabled={isLoading} />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>
      
      {!isLogin && (
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      )}
      
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} 
        keyboardType="email-address" autoCapitalize="none" />
      
      <TextInput style={styles.input} placeholder="Password" value={password} 
        onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 180, height: 60 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { marginHorizontal: 16, color: '#666', fontSize: 14 },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007aff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#007aff', fontSize: 16 }
});

export default AuthScreen;
