import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingQuestion } from '@/lib/onboardingFlow';
import { SubscriberProfile, emptyProfile } from '@/lib/subscriberSchema';
import { saveSubscriberData, getCurrentUserId, saveLocalProfile } from '@/services/subscriberService';
import { CheckCircle, ChevronLeft, ChevronRight, Mic, Upload, X } from 'lucide-react';

interface ChatbotOnboardingProps {
  questions: OnboardingQuestion[];
  onComplete: (profile: Partial<SubscriberProfile>) => void;
  onSkip: () => void;
}

export function ChatbotOnboarding({ questions, onComplete, onSkip }: ChatbotOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<SubscriberProfile>>(emptyProfile);
  const [error, setError] = useState<string | null>(null);
  
  const currentQuestion = questions[currentStep];
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        setError(null);
      } else {
        completeOnboarding();
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };
  
  const validateCurrentStep = () => {
    const question = questions[currentStep];
    const value = profile[question.field as keyof SubscriberProfile];
    
    if (question.required) {
      if (value === undefined || value === null || value === '') {
        setError(`This field is required`);
        return false;
      }
      
      if (Array.isArray(value) && value.length === 0) {
        setError(`Please select at least one option`);
        return false;
      }
    }
    
    if (question.validation && value) {
      if (typeof question.validation === 'string') {
        // Custom validation would go here if needed
      } else if (question.validation instanceof RegExp) {
        if (!question.validation.test(String(value))) {
          setError(`Invalid format`);
          return false;
        }
      }
    }
    
    return true;
  };
  
  const completeOnboarding = async () => {
    try {
      // Mark onboarding as completed
      const updatedProfile = {
        ...profile,
        completedOnboarding: true,
        updatedAt: new Date()
      };
      
      // Save to Firebase if user is logged in
      const userId = getCurrentUserId();
      if (userId) {
        await saveSubscriberData(userId, updatedProfile);
      } else {
        // Otherwise save to local storage
        saveLocalProfile(updatedProfile);
      }
      
      // Notify parent component
      onComplete(updatedProfile);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to save your profile. Please try again.');
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };
  
  const handleMultipleChoiceChange = (field: string, value: string, checked: boolean) => {
    setProfile(prev => {
      const currentValues = Array.isArray(prev[field as keyof SubscriberProfile]) 
        ? [...(prev[field as keyof SubscriberProfile] as string[])] 
        : [];
      
      if (checked) {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      }
    });
    setError(null);
  };
  
  const renderQuestion = () => {
    const question = questions[currentStep];
    
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.label}</Label>
            {question.description && (
              <p className="text-sm text-muted-foreground">{question.description}</p>
            )}
            <Input
              id={question.id}
              placeholder={question.placeholder}
              value={profile[question.field as keyof SubscriberProfile] as string || ''}
              onChange={e => handleChange(question.field, e.target.value)}
            />
          </div>
        );
        
      case 'multipleChoice':
        if (!question.options) return null;
        
        // Check if options should be rendered as radio buttons (single select) or checkboxes (multi-select)
        const isSingleSelect = !Array.isArray(profile[question.field as keyof SubscriberProfile]);
        
        if (isSingleSelect) {
          return (
            <div className="space-y-2">
              <Label>{question.label}</Label>
              {question.description && (
                <p className="text-sm text-muted-foreground">{question.description}</p>
              )}
              <RadioGroup
                value={profile[question.field as keyof SubscriberProfile] as string || ''}
                onValueChange={value => handleChange(question.field, value)}
              >
                {question.options.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                    <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <Label>{question.label}</Label>
              {question.description && (
                <p className="text-sm text-muted-foreground">{question.description}</p>
              )}
              <div className="space-y-2">
                {question.options.map(option => {
                  const values = (profile[question.field as keyof SubscriberProfile] as string[]) || [];
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`${question.id}-${option}`} 
                        checked={values.includes(option)}
                        onCheckedChange={(checked) => handleMultipleChoiceChange(question.field, option, checked === true)}
                      />
                      <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        
      case 'boolean':
        return (
          <div className="space-y-2">
            <Label>{question.label}</Label>
            {question.description && (
              <p className="text-sm text-muted-foreground">{question.description}</p>
            )}
            <RadioGroup
              value={String(profile[question.field as keyof SubscriberProfile] || '')}
              onValueChange={value => handleChange(question.field, value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`}>No</Label>
              </div>
            </RadioGroup>
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.label}</Label>
            {question.description && (
              <p className="text-sm text-muted-foreground">{question.description}</p>
            )}
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
              {profile[question.field as keyof SubscriberProfile] && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleChange(question.field, null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
        
      case 'voice':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.label}</Label>
            {question.description && (
              <p className="text-sm text-muted-foreground">{question.description}</p>
            )}
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline">
                <Mic className="mr-2 h-4 w-4" />
                Record Voice
              </Button>
              <Textarea
                id={question.id}
                placeholder="Transcription will appear here..."
                value={profile[question.field as keyof SubscriberProfile] as string || ''}
                onChange={e => handleChange(question.field, e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      <div className="px-4 py-3 border-b">
        <div className="flex justify-between items-center">
          <div className="text-sm">Step {currentStep + 1} of {questions.length}</div>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-primary h-1.5 rounded-full" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question content */}
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {renderQuestion()}
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="p-4 border-t flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep < questions.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Complete
              <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}