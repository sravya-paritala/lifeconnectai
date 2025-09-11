import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Users, UserCheck, Mic, MicOff, Play, Pause, Share2, Languages, Volume2 } from 'lucide-react';

type UserType = 'general' | 'hospital' | null;
type QuestionnaireState = 'selection' | 'questions' | 'summary';

const questions = {
  general: [
    "What is the patient's age?",
    "What is the patient's gender?", 
    "What symptoms do you observe?",
    "How long have the symptoms been present?",
    "Is the patient conscious or unconscious?"
  ],
  hospital: [
    "What is the patient's age?",
    "What is the patient's gender?",
    "What symptoms do you observe?", 
    "How long have the symptoms been present?",
    "Is the patient conscious or unconscious?",
    "What is the patient's blood pressure?",
    "What is the patient's pulse rate?",
    "What is the patient's body temperature?",
    "Does the patient have any known medical history?",
    "Does the patient have any known allergies?"
  ]
};

// Mock responses for demonstration
const mockResponses = {
  general: [
    "45 years old",
    "Male", 
    "Severe chest pain and shortness of breath",
    "About 2 hours",
    "Conscious but in distress"
  ],
  hospital: [
    "45 years old",
    "Male",
    "Severe chest pain and shortness of breath", 
    "About 2 hours",
    "Conscious but in distress",
    "150/95 mmHg",
    "95 BPM irregular",
    "98.6°F",
    "History of hypertension",
    "No known allergies"
  ]
};

export default function Emergency() {
  const [userType, setUserType] = useState<UserType>(null);
  const [state, setState] = useState<QuestionnaireState>('selection');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [summary, setSummary] = useState('');

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setState('questions');
    setCurrentQuestion(0);
    setResponses([]);
  };

  const handleNextQuestion = () => {
    const currentQuestions = userType ? questions[userType] : [];
    const mockResponseSet = userType ? mockResponses[userType] : [];
    
    // Add mock response
    const newResponses = [...responses, mockResponseSet[currentQuestion] || 'No response'];
    setResponses(newResponses);
    
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate summary
      generateSummary(newResponses);
      setState('summary');
    }
  };

  const handleSkip = () => {
    const newResponses = [...responses, 'Skipped'];
    setResponses(newResponses);
    
    const currentQuestions = userType ? questions[userType] : [];
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateSummary(newResponses);
      setState('summary');
    }
  };

  const generateSummary = (allResponses: string[]) => {
    if (userType === 'general') {
      setSummary(`Emergency Report Summary:
Patient is a ${allResponses[0]} ${allResponses[1]}, ${allResponses[4]}, reporting ${allResponses[2]} for ${allResponses[3]}. Immediate medical attention recommended.`);
    } else {
      setSummary(`Emergency Medical Report:
Patient: ${allResponses[0]} ${allResponses[1]}
Condition: ${allResponses[4]}
Symptoms: ${allResponses[2]} (Duration: ${allResponses[3]})
Vitals: BP ${allResponses[5]}, HR ${allResponses[6]}, Temp ${allResponses[7]}
History: ${allResponses[8]}
Allergies: ${allResponses[9]}

Recommendation: Immediate emergency care required based on presenting symptoms and vital signs.`);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In real implementation, this would start/stop speech recognition
  };

  const handleAction = (action: string) => {
    console.log(`Performing action: ${action}`);
    // In real implementation, these would call respective APIs
  };

  const resetQuestionnaire = () => {
    setUserType(null);
    setState('selection');
    setCurrentQuestion(0);
    setResponses([]);
    setSummary('');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl">
              <Phone className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Emergency Report Transmitter</h1>
              <p className="text-muted-foreground">Voice-driven emergency questionnaire system</p>
            </div>
          </div>
        </div>

        {/* User Type Selection */}
        {state === 'selection' && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Select User Type</CardTitle>
              <CardDescription>
                Choose your role to get the appropriate emergency questionnaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-primary transition-all duration-200 border-2 hover:border-primary/30"
                  onClick={() => handleUserTypeSelect('general')}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-gradient-primary rounded-full">
                        <Users className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">General Public</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          For family members, bystanders, or non-medical personnel reporting an emergency
                        </p>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          5 Questions
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-primary transition-all duration-200 border-2 hover:border-primary/30"
                  onClick={() => handleUserTypeSelect('hospital')}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-gradient-to-br from-accent-dark to-accent rounded-full">
                        <UserCheck className="w-8 h-8 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">Hospital Staff</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          For medical professionals with access to detailed patient information
                        </p>
                        <Badge variant="outline" className="bg-accent/10 text-accent-dark">
                          10 Questions
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questionnaire */}
        {state === 'questions' && userType && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Emergency Questionnaire</CardTitle>
                  <CardDescription>
                    Question {currentQuestion + 1} of {questions[userType].length}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-secondary/10 text-secondary">
                  {userType === 'general' ? 'General Public' : 'Hospital Staff'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions[userType].length) * 100}%` }}
                  ></div>
                </div>

                {/* Current Question */}
                <div className="bg-gradient-card p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {questions[userType][currentQuestion]}
                  </h3>
                  
                  {/* Voice Controls */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      size="lg"
                      onClick={toggleListening}
                      className="flex items-center space-x-2"
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      <span>{isListening ? 'Stop Listening' : 'Start Voice Response'}</span>
                    </Button>
                    
                    {isListening && (
                      <div className="flex items-center space-x-2 text-secondary">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                        <span className="text-sm">Listening...</span>
                      </div>
                    )}
                  </div>

                  {/* Mock Response Display */}
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Detected Response:</p>
                    <p className="text-foreground font-medium">
                      {mockResponses[userType][currentQuestion]}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleNextQuestion}
                    className="flex-1 bg-gradient-primary hover:shadow-glow"
                  >
                    {currentQuestion < questions[userType].length - 1 ? 'Next Question' : 'Complete'}
                  </Button>
                  <Button variant="outline" onClick={handleSkip}>
                    Skip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {state === 'summary' && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Emergency Medical Summary</span>
                <Badge variant="secondary" className="bg-accent/20 text-accent-dark">
                  Report Generated
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-generated medical summary based on the questionnaire responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Content */}
                <div className="bg-gradient-card p-6 rounded-lg border border-border">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                    {summary}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleAction('translate')}
                  >
                    <Languages className="w-4 h-4" />
                    <span>Translate</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleAction('speak')}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Read Aloud</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleAction('whatsapp')}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleAction('sms')}
                  >
                    <Phone className="w-4 h-4" />
                    <span>SMS</span>
                  </Button>
                </div>

                {/* Reset Button */}
                <div className="pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={resetQuestionnaire}
                    className="w-full"
                  >
                    Start New Emergency Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}