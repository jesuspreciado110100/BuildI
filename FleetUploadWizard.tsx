import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { PhotoUploadStep } from './PhotoUploadStep';
import { styles } from './FleetUploadWizardStyles';

interface FleetUploadWizardProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export const FleetUploadWizard: React.FC<FleetUploadWizardProps> = ({
  visible,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    photos: {},
    nickname: '',
    dailyRate: '',
    availability: 'available',
    contactPhone: '',
    operatorLanguage: 'english'
  });

  const categories = [
    { id: 'excavator', name: 'Excavator', icon: '🚜' },
    { id: 'loader', name: 'Loader', icon: '🏗️' },
    { id: 'compactor', name: 'Compactor', icon: '🛤️' },
    { id: 'crane', name: 'Crane', icon: '🏗️' },
    { id: 'bulldozer', name: 'Bulldozer', icon: '🚜' },
    { id: 'other', name: 'Other', icon: '⚙️' }
  ];

  const brands = {
    excavator: ['Caterpillar', 'Komatsu', 'Volvo', 'JCB', 'Hitachi'],
    loader: ['Caterpillar', 'John Deere', 'Case', 'Volvo', 'Komatsu'],
    compactor: ['Caterpillar', 'Bomag', 'Dynapac', 'Hamm', 'Volvo'],
    crane: ['Liebherr', 'Tadano', 'Grove', 'Terex', 'Manitowoc'],
    bulldozer: ['Caterpillar', 'Komatsu', 'John Deere', 'Case', 'Liebherr'],
    other: ['Various']
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const completeData = {
      ...formData,
      uploadedBy: 'agent',
      status: 'unverified',
      createdAt: new Date().toISOString()
    };
    onComplete(completeData);
    onClose();
    setCurrentStep(1);
    setFormData({
      category: '',
      brand: '',
      model: '',
      photos: {},
      nickname: '',
      dailyRate: '',
      availability: 'available',
      contactPhone: '',
      operatorLanguage: 'english'
    });
  };

  if (!visible) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Machinery Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTile,
                    formData.category === category.id && styles.selectedTile
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id })}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.nextButton, !formData.category && styles.disabledButton]}
                onPress={handleNext}
                disabled={!formData.category}
              >
                <Text style={[styles.nextText, !formData.category && styles.disabledText]}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Brand & Model (Optional)</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Brand</Text>
              <ScrollView style={styles.dropdown} horizontal showsHorizontalScrollIndicator={false}>
                {brands[formData.category]?.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.dropdownItem,
                      formData.brand === brand && styles.selectedDropdownItem
                    ]}
                    onPress={() => setFormData({ ...formData, brand })}
                  >
                    <Text style={[
                      styles.dropdownText,
                      formData.brand === brand && styles.selectedDropdownText
                    ]}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 3:
        return (
          <PhotoUploadStep
            photos={formData.photos}
            onPhotosChange={(photos) => setFormData({ ...formData, photos })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 4:
        return (
          <ScrollView style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Machine Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Machine Nickname *</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => Alert.prompt('Machine Nickname', 'Enter a nickname for this machine', (text) => {
                  setFormData({ ...formData, nickname: text || '' });
                })}
              >
                <Text style={formData.nickname ? styles.inputText : styles.placeholder}>
                  {formData.nickname || 'e.g. Big Yellow Excavator'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daily Rental Rate *</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => Alert.prompt('Daily Rate', 'Enter daily rental rate ($)', (text) => {
                  setFormData({ ...formData, dailyRate: text || '' });
                })}
              >
                <Text style={formData.dailyRate ? styles.inputText : styles.placeholder}>
                  {formData.dailyRate ? `$${formData.dailyRate}/day` : 'Enter amount'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Availability</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.availability === 'available' && styles.activeToggle
                  ]}
                  onPress={() => setFormData({ ...formData, availability: 'available' })}
                >
                  <Text style={[
                    styles.toggleText,
                    formData.availability === 'available' && styles.activeToggleText
                  ]}>Available</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.availability === 'unavailable' && styles.activeToggle
                  ]}
                  onPress={() => setFormData({ ...formData, availability: 'unavailable' })}
                >
                  <Text style={[
                    styles.toggleText,
                    formData.availability === 'unavailable' && styles.activeToggleText
                  ]}>Unavailable</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.completeButton, (!formData.nickname || !formData.dailyRate) && styles.disabledButton]}
                onPress={handleComplete}
                disabled={!formData.nickname || !formData.dailyRate}
              >
                <Text style={[styles.completeText, (!formData.nickname || !formData.dailyRate) && styles.disabledText]}>Complete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Machinery</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Step {currentStep} of 4</Text>
          </View>
        </View>
        {renderStep()}
      </View>
    </View>
  );
};