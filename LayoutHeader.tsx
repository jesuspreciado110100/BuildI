import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '../types';
import { ThemeToggleButton } from './ThemeToggleButton';
import { NotificationBell } from './NotificationBell';

interface LayoutHeaderProps {
  user: User;
  title: string;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({ 
  user, 
  title, 
  onMenuPress, 
  onProfilePress 
}) => {
  const primaryColor = user.brand_theme?.primary_color || '#007AFF';
  const showPoweredBy = user.brand_theme?.powered_by_footer !== false;

  return (
    <View style={{ 
      backgroundColor: primaryColor, 
      paddingTop: 50, 
      paddingBottom: 15, 
      paddingHorizontal: 20 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left side - Logo/Menu */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {onMenuPress && (
            <TouchableOpacity onPress={onMenuPress} style={{ marginRight: 15 }}>
              <Text style={{ color: '#FFF', fontSize: 18 }}>☰</Text>
            </TouchableOpacity>
          )}
          
          {user.brand_theme?.logo_url ? (
            <Image
              source={{ uri: user.brand_theme.logo_url }}
              style={{ width: 120, height: 30, marginRight: 15 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 15 }}>
              ConstructionHub
            </Text>
          )}
          
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
            {title}
          </Text>
        </View>

        {/* Right side - Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NotificationBell />
          <ThemeToggleButton />
          
          {onProfilePress && (
            <TouchableOpacity onPress={onProfilePress} style={{ marginLeft: 10 }}>
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                />
              ) : (
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {!showPoweredBy && (
        <View style={{ marginTop: 5 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, textAlign: 'right' }}>
            {/* White label mode - no powered by footer */}
          </Text>
        </View>
      )}
    </View>
  );
};