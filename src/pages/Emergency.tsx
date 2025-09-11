import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Phone, Users, UserCheck, Share2, Languages, Volume2 } from 'lucide-react';

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
  const [status, setStatus] = useState<'idle'|'asking'|'listening'|'processing'|'done'>('idle');

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
                      {manualAnswer || transcript || (status === 'listening' ? '…' : 'No response yet')}
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