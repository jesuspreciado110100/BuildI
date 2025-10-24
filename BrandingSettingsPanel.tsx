import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { User } from '../types';
import { FileUploader } from './FileUploader';
import { AnimatedButton } from './AnimatedButton';

interface BrandingSettingsPanelProps {
  user: User;
  onSave: (brandTheme: User['brand_theme']) => void;
}

export const BrandingSettingsPanel: React.FC<BrandingSettingsPanelProps> = ({ user, onSave }) => {
  const [brandTheme, setBrandTheme] = useState(user.brand_theme || {
    primary_color: '#007AFF',
    logo_url: '',
    powered_by_footer: true
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave(brandTheme);
    Alert.alert('Success', 'Branding settings saved successfully!');
  };

  const colorOptions = [
    { name: 'Blue', value: '#007AFF' },
    { name: 'Green', value: '#34C759' },
    { name: 'Orange', value: '#FF9500' },
    { name: 'Red', value: '#FF3B30' },
    { name: 'Purple', value: '#AF52DE' },
    { name: 'Teal', value: '#5AC8FA' }
  ];

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <View style={{ marginTop: 20, padding: 15, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Preview</Text>
        
        {/* Login Screen Preview */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Login Screen</Text>
          <View style={{ backgroundColor: '#FFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5' }}>
            {brandTheme.logo_url && (
              <Image
                source={{ uri: brandTheme.logo_url }}
                style={{ width: 120, height: 40, alignSelf: 'center', marginBottom: 10 }}
                resizeMode="contain"
              />
            )}
            <View style={{ height: 40, backgroundColor: brandTheme.primary_color, borderRadius: 8, justifyContent: 'center' }}>
              <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: '600' }}>Sign In</Text>
            </View>
            {brandTheme.powered_by_footer && (
              <Text style={{ textAlign: 'center', fontSize: 12, color: '#666', marginTop: 10 }}>Powered by ConstructionHub</Text>
            )}
          </View>
        </View>

        {/* Navigation Bar Preview */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Navigation Bar</Text>
          <View style={{ backgroundColor: brandTheme.primary_color, padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            {brandTheme.logo_url && (
              <Image
                source={{ uri: brandTheme.logo_url }}
                style={{ width: 80, height: 25, marginRight: 10 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Dashboard</Text>
          </View>
        </View>

        {/* Report Header Preview */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Report Export Header</Text>
          <View style={{ backgroundColor: '#FFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              {brandTheme.logo_url && (
                <Image
                  source={{ uri: brandTheme.logo_url }}
                  style={{ width: 100, height: 30, marginRight: 15 }}
                  resizeMode="contain"
                />
              )}
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Progress Report</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Generated on {new Date().toLocaleDateString()}</Text>
              </View>
            </View>
            {brandTheme.powered_by_footer && (
              <Text style={{ fontSize: 10, color: '#999', textAlign: 'right' }}>Powered by ConstructionHub</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#FFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Branding Settings</Text>

      {/* Logo Upload */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Company Logo</Text>
        <FileUploader
          onFileSelect={(url) => setBrandTheme({ ...brandTheme, logo_url: url })}
          acceptedTypes={['image/*']}
          maxSize={2}
        />
        {brandTheme.logo_url && (
          <Image
            source={{ uri: brandTheme.logo_url }}
            style={{ width: 150, height: 50, marginTop: 10, borderRadius: 4 }}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Primary Color */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Primary Color</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={{
                width: 50,
                height: 50,
                backgroundColor: color.value,
                borderRadius: 25,
                marginRight: 10,
                marginBottom: 10,
                borderWidth: brandTheme.primary_color === color.value ? 3 : 0,
                borderColor: '#333'
              }}
              onPress={() => setBrandTheme({ ...brandTheme, primary_color: color.value })}
            />
          ))}
        </View>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            marginTop: 10
          }}
          placeholder="Custom hex color (e.g., #FF5733)"
          value={brandTheme.primary_color}
          onChangeText={(text) => setBrandTheme({ ...brandTheme, primary_color: text })}
        />
      </View>

      {/* White Label Mode */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>White Label Mode</Text>
            <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>Hide "Powered by ConstructionHub" footer</Text>
          </View>
          <Switch
            value={!brandTheme.powered_by_footer}
            onValueChange={(value) => setBrandTheme({ ...brandTheme, powered_by_footer: !value })}
            trackColor={{ false: '#E5E5E5', true: brandTheme.primary_color }}
          />
        </View>
      </View>

      {/* Preview Toggle */}
      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: '#F8F9FA',
          borderRadius: 8,
          marginBottom: 20
        }}
        onPress={() => setShowPreview(!showPreview)}
      >
        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: brandTheme.primary_color }}>
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Text>
      </TouchableOpacity>

      {renderPreview()}

      {/* Save Button */}
      <AnimatedButton
        title="Save Branding Settings"
        onPress={handleSave}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};