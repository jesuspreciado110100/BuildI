import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface EmailTemplate {
  subject: string;
  headerColor: string;
  buttonColor: string;
  companyName: string;
  logoEmoji: string;
}

export default function EmailTemplateCustomizer() {
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: 'Verify Your Email',
    headerColor: '#667eea',
    buttonColor: '#667eea',
    companyName: 'BuildConnect',
    logoEmoji: '🏗️'
  });

  const [preview, setPreview] = useState(false);

  const updateTemplate = (key: keyof EmailTemplate, value: string) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Email Template Customization</Text>
      
      <View style={styles.field}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          value={template.companyName}
          onChangeText={(v) => updateTemplate('companyName', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Logo Emoji</Text>
        <TextInput
          style={styles.input}
          value={template.logoEmoji}
          onChangeText={(v) => updateTemplate('logoEmoji', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email Subject</Text>
        <TextInput
          style={styles.input}
          value={template.subject}
          onChangeText={(v) => updateTemplate('subject', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Header Color</Text>
        <TextInput
          style={styles.input}
          value={template.headerColor}
          onChangeText={(v) => updateTemplate('headerColor', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Button Color</Text>
        <TextInput
          style={styles.input}
          value={template.buttonColor}
          onChangeText={(v) => updateTemplate('buttonColor', v)}
        />
      </View>

      <TouchableOpacity 
        style={styles.previewButton}
        onPress={() => setPreview(!preview)}
      >
        <Text style={styles.previewButtonText}>
          {preview ? 'Hide Preview' : 'Show Preview'}
        </Text>
      </TouchableOpacity>

      {preview && (
        <View style={[styles.preview, { backgroundColor: template.headerColor }]}>
          <Text style={styles.previewLogo}>{template.logoEmoji}</Text>
          <Text style={styles.previewCompany}>{template.companyName}</Text>
          <View style={styles.previewContent}>
            <Text style={styles.previewSubject}>{template.subject}</Text>
            <TouchableOpacity 
              style={[styles.previewBtn, { backgroundColor: template.buttonColor }]}
            >
              <Text style={styles.previewBtnText}>Verify Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  field: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#666' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  previewButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 20 },
  previewButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  preview: { borderRadius: 12, padding: 20, marginTop: 10 },
  previewLogo: { fontSize: 48, textAlign: 'center' },
  previewCompany: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 10 },
  previewContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginTop: 20 },
  previewSubject: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  previewBtn: { padding: 15, borderRadius: 8, alignItems: 'center' },
  previewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
