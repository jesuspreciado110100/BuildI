import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}

const providerConfig = {
  google: {
    icon: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1757427289987_de7b4558.webp',
    text: 'Continue with Google',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#dadce0',
  },
  facebook: {
    icon: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1757427293190_634659a4.webp',
    text: 'Continue with Facebook',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#dadce0',
  },
  apple: {
    icon: 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1757427297308_ee793f55.webp',
    text: 'Continue with Apple',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#dadce0',
  },
};

export function SocialLoginButton({ provider, onPress, disabled }: SocialLoginButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image source={{ uri: config.icon }} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  disabled: {
    opacity: 0.6,
  },
});