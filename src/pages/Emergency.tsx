import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Users, UserCheck, Share2, Languages, Volume2, AlertTriangle, VolumeX } from 'lucide-react';
import AmbulanceTracker from '@/components/ui/AmbulanceTracker';
import ShareButton from '@/components/ui/ShareButton';
import { toast } from '@/hooks/use-toast';

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
  const [summary, setSummary] = useState('');
  const [flowActive, setFlowActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const [transcript, setTranscript] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const manualAnswerRef = useRef<string>('');
  const transcriptRef = useRef<string>('');
  const [textInput, setTextInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isReadingPaused, setIsReadingPaused] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [status, setStatus] = useState<'idle'|'asking'|'listening'|'processing'|'done'>('idle');
  const [emergencyContacts] = useState([
    { name: 'John Smith', phone: '+91 9876543210', relation: 'Family' },
    { name: 'Sarah Johnson', phone: '+91 9876543211', relation: 'Friend' },
    { name: 'Dr. Michael Brown', phone: '+91 9876543212', relation: 'Doctor' }
  ]);

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

  // Automatic voice flow utilities
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
    try { window.speechSynthesis.cancel(); } catch {}
    return new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 1;
      u.pitch = 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  };

  const startRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { recognitionRef.current = null; return null; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    setTranscript('');
    transcriptRef.current = '';
    rec.onresult = (e: any) => {
      let collected = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        collected += e.results[i][0].transcript + ' ';
      }
      collected = collected.trim();
      setTranscript(collected);
      transcriptRef.current = collected;
      if (/\bskip\b/i.test(collected)) {
        try { rec.stop(); } catch {}
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        setTranscript('Skipped');
        transcriptRef.current = 'Skipped';
        speak('Okay, skipping…').then(() => {
          goNext('Skipped');
        });
      }
    };
    rec.onerror = () => {};
    try { rec.start(); } catch {}
    recognitionRef.current = rec;
    return rec;
  };

  const stopRecognition = () => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.onresult = null; rec.onerror = null; rec.stop(); } catch {}
    }
    recognitionRef.current = null;
  };

  const goNext = (answer: string) => {
    stopRecognition();
    setManualAnswer('');
    manualAnswerRef.current = '';
    setStatus('processing');
    setResponses((prev) => {
      const normalized = /\bskip\b/i.test(answer) ? 'Skipped' : (answer ? answer : 'No response');
      const newRes = [...prev, normalized];
      const total = userType ? questions[userType].length : 0;
      if (newRes.length >= total) {
        try { window.speechSynthesis?.cancel(); } catch {}
        generateSummary(newRes);
        setState('summary');
        setFlowActive(false);
        setStatus('done');
      } else {
        setCurrentQuestion((q) => q + 1);
      }
      return newRes;
    });
  };

  const askAndWait = async () => {
    if (!userType) return;
    setStatus('asking');
    setTranscript('');
    transcriptRef.current = '';
    await speak(questions[userType][currentQuestion]);
    setStatus('listening');
    startRecognition();
    if (timerRef.current) { clearTimeout(timerRef.current); }
    timerRef.current = window.setTimeout(() => {
      const manual = manualAnswerRef.current?.trim();
      const voice = transcriptRef.current?.trim();
      if (manual && /\bskip\b/i.test(manual)) {
        speak('Okay, skipping…').then(() => goNext('Skipped'));
        return;
      }
      if (voice && /\bskip\b/i.test(voice)) {
        speak('Okay, skipping…').then(() => goNext('Skipped'));
        return;
      }
      const answer = manual || voice || 'No response';
      goNext(answer);
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      stopRecognition();
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  // Drive the flow automatically
  useEffect(() => {
    if (state === 'questions' && userType) {
      if (!flowActive) {
        setFlowActive(true);
        askAndWait();
      } else {
        askAndWait();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userType, currentQuestion]);

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
    setTranscript('');
    transcriptRef.current = '';
    setManualAnswer('');
    manualAnswerRef.current = '';
    setFlowActive(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    stopRecognition();
    try { window.speechSynthesis?.cancel(); } catch {}
    setStatus('idle');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl">
                <Phone className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Emergency Report Transmitter</h1>
                <p className="text-muted-foreground">Voice-driven emergency questionnaire system</p>
              </div>
            </div>
          </div>
          
          {/* Life Alert Button */}
          <div className="mb-6">
            <Button 
              variant="destructive" 
              size="lg"
              onClick={() => {
                // Send emergency alert to contacts
                emergencyContacts.forEach(contact => {
                  console.log(`Sending emergency alert to ${contact.name} at ${contact.phone}`);
                });
                toast({
                  title: "Emergency Alert Sent!",
                  description: `Alert sent to ${emergencyContacts.length} emergency contacts`,
                  variant: "destructive"
                });
              }}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>LIFE ALERT - Send Emergency Message</span>
            </Button>
          </div>
        </div>

        {/* Ambulance Tracker - Enhanced Layout */}
        {(state === 'questions' || state === 'summary') && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>🚑 Ambulance Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Available - En Route
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <span className="text-blue-600">📍</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Location</p>
                        <p className="font-semibold text-foreground">Downtown Medical Center</p>
                        <p className="text-xs text-muted-foreground">Lat: 17.3850, Lng: 78.4867</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <span className="text-red-600">🎯</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Destination</p>
                        <p className="font-semibold text-foreground">City General Hospital</p>
                        <p className="text-xs text-muted-foreground">Emergency Department</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <span className="text-orange-600">⏱️</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Estimated Arrival Time</p>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-2xl font-bold text-primary">8 mins</p>
                          <p className="text-sm text-muted-foreground">4.2 km remaining</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Progress: 75% complete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🗺️ Live Map Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                    {/* Mock Map Interface */}
                    <div className="relative w-full h-48 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg border overflow-hidden">
                      {/* Roads */}
                      <div className="absolute inset-0">
                        <div className="absolute top-8 left-0 w-full h-1 bg-gray-400"></div>
                        <div className="absolute top-16 left-0 w-full h-1 bg-gray-400"></div>
                        <div className="absolute top-24 left-0 w-full h-1 bg-gray-400"></div>
                        <div className="absolute left-8 top-0 w-1 h-full bg-gray-400"></div>
                        <div className="absolute left-16 top-0 w-1 h-full bg-gray-400"></div>
                        <div className="absolute left-24 top-0 w-1 h-full bg-gray-400"></div>
                      </div>
                      
                      {/* Ambulance Icon */}
                      <div className="absolute top-6 left-12 animate-pulse">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🚑</span>
                        </div>
                      </div>
                      
                      {/* Hospital Icon */}
                      <div className="absolute bottom-6 right-8">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🏥</span>
                        </div>
                      </div>
                      
                      {/* Route Line */}
                      <svg className="absolute inset-0 w-full h-full">
                        <path
                          d="M 50 40 Q 100 60 150 160"
                          stroke="#ef4444"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      </svg>
                    </div>
                    
                    {/* Map Legend */}
                    <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Ambulance</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Hospital</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-1 bg-red-400 border-dashed"></div>
                        <span>Route</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

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
                  
                  {/* Text Input Option */}
                  <div className="mb-4">
                    <Input
                      placeholder="Type your answer here (optional)"
                      value={textInput}
                      onChange={(e) => {
                        setTextInput(e.target.value);
                        setManualAnswer(e.target.value);
                        manualAnswerRef.current = e.target.value;
                      }}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can type your answer or speak. The system will automatically move to the next question in 3 seconds.
                    </p>
                  </div>
                  
                  {/* Voice Controls */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => {}}
                      className="flex items-center space-x-2"
                    >
                      
                      <span>Listening…</span>
                    </Button>
                    
                    <div className="flex items-center space-x-2 text-secondary">
                      <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-secondary animate-pulse' : status === 'asking' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                      <span className="text-sm text-muted-foreground">
                        {status === 'asking' && 'Asking…'}
                        {status === 'listening' && 'Listening (3s)…'}
                        {status === 'processing' && 'Processing…'}
                        {status === 'idle' && 'Idle'}
                        {status === 'done' && 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Mock Response Display */}
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Detected Response:</p>
                    <p className="text-foreground font-medium">
                      {textInput || transcript || (status === 'listening' ? '…' : 'No response yet')}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">Will move to next question automatically.</div>
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
                {/* Language Selection & Translation */}
                {isTranslating && (
                  <div className="mb-4">
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="ml">Malayalam</SelectItem>
                        <SelectItem value="kn">Kannada</SelectItem>
                        <SelectItem value="bn">Bengali</SelectItem>
                        <SelectItem value="raj">Rajasthani</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Summary Content */}
                <div className="bg-gradient-card p-6 rounded-lg border border-border">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                    {translatedSummary || summary}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => setIsTranslating(!isTranslating)}
                  >
                    <Languages className="w-4 h-4" />
                    <span>Translate</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {
                      if (!isReading) {
                        setIsReading(true);
                        const utterance = new SpeechSynthesisUtterance(summary);
                        speechRef.current = utterance;
                        speechSynthesis.speak(utterance);
                        utterance.onend = () => setIsReading(false);
                      }
                    }}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Read Aloud</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {
                      if (isReading) {
                        if (isReadingPaused) {
                          speechSynthesis.resume();
                          setIsReadingPaused(false);
                        } else {
                          speechSynthesis.pause();
                          setIsReadingPaused(true);
                        }
                      }
                    }}
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>{isReadingPaused ? 'Continue' : 'Stop Reading'}</span>
                  </Button>
                  
                  <ShareButton
                    title="Emergency Medical Report"
                    text={summary}
                    variant="outline"
                  />
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