/*
 * QUESTION VIEW - FILLER CONTENT IMPLEMENTATION
 * 
 * This is a placeholder question view with filler content for collecting user preferences during onboarding.
 * 
 * Features:
 * - Multi-step questionnaire with progress tracking
 * - Smooth animations between questions
 * - Safe area handling for iOS
 * - Response saving to AsyncStorage
 * - Theme integration with consistent styling
 * - Haptic feedback for interactions
 * 
 * To Customize:
 * 1. Replace filler questions with your actual onboarding questions
 * 2. Update question titles, descriptions, and answer options
 * 3. Add different question types (multiple choice, text input, sliders, etc.)
 * 4. Save responses to your preferred storage system
 * 5. Use responses to personalize the app experience
 * 6. Add analytics to track user preferences
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserManager } from '../../utils/userManager';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getButtonStyles } from '@/constants/ButtonStyles';
import { useColorScheme } from '@/hooks/useColorScheme';

// Question model interface
interface OnboardingQuestion {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: string[];
}

// Sample questions data
const SAMPLE_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'sample_question_1',
    title: 'This is sample question 1',
    description: 'Replace this with your actual first question',
    icon: 'checkbox',
    options: [
      'Sample answer A',
      'Sample answer B', 
      'Sample answer C',
      'Sample answer D'
    ]
  },
  {
    id: 'sample_question_2',
    title: 'This is sample question 2',
    description: 'Replace this with your actual second question',
    icon: 'settings',
    options: [
      'Option 1',
      'Option 2',
      'Option 3', 
      'Option 4'
    ]
  },
  {
    id: 'sample_question_3',
    title: 'This is sample question 3',
    description: 'Replace this with your actual third question',
    icon: 'star',
    options: [
      'Choice A',
      'Choice B',
      'Choice C',
      'Choice D'
    ]
  },
  {
    id: 'sample_question_4',
    title: 'This is the final sample question',
    description: 'Replace this with your actual final question',
    icon: 'checkmark-circle',
    options: [
      'Final option 1',
      'Final option 2',
      'Final option 3',
      'Final option 4'
    ]
  }
];

// Progress bar component
const ProgressBar: React.FC<{ progress: number; colors: any }> = ({ progress, colors }) => (
  <View style={styles.progressContainer}>
    <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
    </View>
  </View>
);

// Answer option component
const AnswerOption: React.FC<{
  text: string;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  fonts: any;
}> = ({ text, isSelected, onPress, colors, fonts }) => (
  <TouchableOpacity 
    style={[
      styles.optionContainer, 
      { backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary },
      { borderColor: isSelected ? colors.primary : colors.border }
    ]} 
    onPress={onPress}
  >
    <Text style={[
      styles.optionText, 
      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
      fonts.bodyLarge
    ]}>
      {text}
    </Text>
    {isSelected && (
      <Ionicons 
        name="checkmark-circle" 
        size={20} 
        color="#FFFFFF" 
        style={styles.checkmark}
      />
    )}
  </TouchableOpacity>
);

// Continue button component
const ContinueButton: React.FC<{ 
  title: string; 
  onPress: () => void;
  visible: boolean;
  colors: any;
  fonts: any;
  buttonStyles: any;
}> = ({ title, onPress, visible, colors, fonts, buttonStyles }) => {
  if (!visible) return null;
  
  return (
    <TouchableOpacity style={[styles.continueButton, buttonStyles.primary]} onPress={onPress}>
      <Text style={[styles.continueButtonText, { color: '#FFFFFF' }, fonts.buttonLarge]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default function QuestionView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fonts = Fonts;
  const buttonStyles = getButtonStyles(colorScheme);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Computed values
  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length;
  const isLastQuestion = currentQuestionIndex === SAMPLE_QUESTIONS.length - 1;
  const hasAnswer = !!responses[currentQuestion.id];

  const handleSelectAnswer = async (answer: string) => {
    // Add haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update responses
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleContinue = async () => {
    if (isLastQuestion) {
      await completeQuestions();
    } else {
      await moveToNextQuestion();
    }
  };

  const moveToNextQuestion = async () => {
    // Add haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const completeQuestions = async () => {
    try {
      // Save responses to AsyncStorage
      await saveResponses();
      
      // Complete onboarding in UserManager
      UserManager.shared.completeOnboarding();
      
      // Add completion haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to main app
      router.replace('/(tabs)/mainView');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    }
  };

  const saveResponses = async () => {
    try {
      // Save individual responses
      for (const [questionId, response] of Object.entries(responses)) {
        await AsyncStorage.setItem(`onboarding_${questionId}`, response);
      }
      
      // Save all responses as a batch (optional for UserManager integration)
      UserManager.shared.updateUserData({ onboarding_responses: responses });
      
      console.log('🎯 Onboarding responses saved:', responses);
    } catch (error) {
      console.error('Error saving responses:', error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Progress Bar */}
      <ProgressBar progress={progress} colors={colors} />
      
      {/* Question Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Question Header */}
          <View style={styles.questionHeader}>
            {/* Question Icon */}
            <View style={styles.iconContainer}>
              <Ionicons 
                name={currentQuestion.icon} 
                size={48} 
                color={colors.primary} 
              />
            </View>
            
            {/* Question Title */}
            <Text style={[styles.questionTitle, { color: colors.textPrimary }, fonts.titleLarge]}>
              {currentQuestion.title}
            </Text>
            
            {/* Question Description */}
            {currentQuestion.description && (
              <Text style={[styles.questionDescription, { color: colors.textSecondary }, fonts.bodyMedium]}>
                {currentQuestion.description}
              </Text>
            )}
          </View>
          
          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <AnswerOption
                key={index}
                text={option}
                isSelected={responses[currentQuestion.id] === option}
                onPress={() => handleSelectAnswer(option)}
                colors={colors}
                fonts={fonts}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <ContinueButton
          title={isLastQuestion ? 'Complete Setup' : 'Continue'}
          onPress={handleContinue}
          visible={hasAnswer}
          colors={colors}
          fonts={fonts}
          buttonStyles={buttonStyles}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for button
  },
  questionHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  questionDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    marginLeft: 12,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
