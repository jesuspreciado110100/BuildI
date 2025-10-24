import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { FAQ, HelpTicket } from '../types/Learning';
import { learningCenterService } from '../services/LearningCenterService';

interface HelpCenterTabProps {
  userRole: string;
  userId: string;
}

export const HelpCenterTab: React.FC<HelpCenterTabProps> = ({ userRole, userId }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [questionSubject, setQuestionSubject] = useState('');
  const [questionMessage, setQuestionMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Projects', 'Labor Management', 'Materials', 'Payments', 'Technical'];

  useEffect(() => {
    loadFAQs();
  }, [userRole, searchTerm, selectedCategory]);

  const loadFAQs = async () => {
    try {
      const faqData = await learningCenterService.getFAQs(userRole, searchTerm);
      const filtered = selectedCategory === 'all' 
        ? faqData 
        : faqData.filter(faq => faq.category === selectedCategory);
      setFaqs(filtered);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionSubject.trim() || !questionMessage.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message');
      return;
    }

    try {
      const ticket: Omit<HelpTicket, 'id' | 'created_at'> = {
        user_id: userId,
        subject: questionSubject,
        message: questionMessage,
        status: 'open',
        priority: 'medium'
      };

      await learningCenterService.createHelpTicket(ticket);
      Alert.alert('Success', 'Your question has been submitted. We\'ll get back to you soon!');
      setQuestionSubject('');
      setQuestionMessage('');
      setShowAskQuestion(false);
    } catch (error) {
      console.error('Error submitting question:', error);
      Alert.alert('Error', 'Failed to submit your question. Please try again.');
    }
  };

  const renderFAQItem = (faq: FAQ) => (
    <View key={faq.id} style={styles.faqCard}>
      <Text style={styles.faqQuestion}>{faq.question}</Text>
      <Text style={styles.faqAnswer}>{faq.answer}</Text>
      <View style={styles.faqFooter}>
        <Text style={styles.faqCategory}>{faq.category}</Text>
        <Text style={styles.faqHelpful}>👍 {faq.helpful_count}</Text>
      </View>
    </View>
  );

  const renderAskQuestionForm = () => (
    <View style={styles.askQuestionForm}>
      <Text style={styles.formTitle}>Ask a Question</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={questionSubject}
        onChangeText={setQuestionSubject}
        maxLength={100}
      />
      
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Describe your question or issue..."
        value={questionMessage}
        onChangeText={setQuestionMessage}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      
      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setShowAskQuestion(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleAskQuestion}
        >
          <Text style={styles.submitButtonText}>Submit Question</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading help center...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help Center</Text>
        <TouchableOpacity
          style={styles.askButton}
          onPress={() => setShowAskQuestion(!showAskQuestion)}
        >
          <Text style={styles.askButtonText}>Ask a Question</Text>
        </TouchableOpacity>
      </View>

      {showAskQuestion && renderAskQuestionForm()}

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category === 'all' ? 'All' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
          {faqs.length > 0 && ` (${faqs.length})`}
        </Text>
        
        {faqs.length > 0 ? (
          faqs.map(renderFAQItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No FAQs found matching your search' : 'No FAQs available'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still need help?</Text>
        <Text style={styles.contactText}>
          If you can't find what you're looking for, feel free to ask a question above or contact our support team.
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>📧 Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  askButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  askQuestionForm: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  faqSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  faqCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  faqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqCategory: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  faqHelpful: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  contactSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});