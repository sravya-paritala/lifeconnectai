import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Upload, Camera, Download, Share2, Volume2, Languages } from 'lucide-react';

const supportedFormats = ['PDF', 'JPG', 'PNG', 'DOCX'];

export default function ReportSummariser() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        setSummary(`
**Patient Report Summary**

**Patient Information:** John Doe, 45 years old, Male

**Key Findings:**
• Blood pressure: 140/90 mmHg (elevated)
• Heart rate: 82 bpm (normal)
• Blood glucose: 180 mg/dL (high)
• Cholesterol: 245 mg/dL (borderline high)

**Diagnosis:** Hypertension with diabetes mellitus type 2

**Recommendations:**
• Start antihypertensive medication
• Begin diabetes management protocol
• Lifestyle modifications recommended
• Follow-up in 2 weeks

**Priority Level:** Medium - requires ongoing monitoring and treatment adjustments.
        `);
        setIsProcessing(false);
      }, 3000);
    }
  };

  const handleAction = (action: string) => {
    console.log(`Performing action: ${action}`);
    // In real implementation, these would call respective APIs
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Report Summariser</h1>
              <p className="text-muted-foreground">AI-powered medical report analysis and summarization</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-primary" />
              <span>Upload Medical Report</span>
            </CardTitle>
            <CardDescription>
              Upload your medical report for AI-powered analysis and summarization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Supported Formats */}
              <div>
                <h4 className="font-medium mb-3">Supported Formats:</h4>
                <div className="flex flex-wrap gap-2">
                  {supportedFormats.map((format) => (
                    <Badge key={format} variant="outline" className="bg-accent/10 text-accent-dark">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gradient-primary rounded-full">
                      <Upload className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Click to upload your medical report
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Or drag and drop your file here
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Alternative Upload Methods */}
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Scan Document</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {uploadedFile && (
          <Card className="mb-8 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {isProcessing ? (
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {isProcessing ? 'Processing your report...' : 'Report processed successfully'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    File: {uploadedFile.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Results */}
        {summary && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI-Generated Summary</span>
                <Badge variant="secondary" className="bg-accent/20 text-accent-dark">
                  Ready to Share
                </Badge>
              </CardTitle>
              <CardDescription>
                Your medical report has been analyzed and summarized
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
                    onClick={() => handleAction('share')}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => handleAction('download')}
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </Button>
                  
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
                </div>

                {/* Translation Options */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Available languages:</span>
                  {['English', 'Telugu', 'Hindi'].map((lang) => (
                    <Badge key={lang} variant="outline" className="cursor-pointer hover:bg-accent/10">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}