'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { validateCarbonOffsetProject } from '@/ai/flows/validate-carbon-offset-projects';
import type { ValidationState } from '@/lib/types';
import { Loader2, AlertTriangle, CheckCircle, Percent, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const MIN_WORDS = 30;

function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AIValidationPage() {
  const [projectDetails, setProjectDetails] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>({
    result: null,
    pending: false,
    error: undefined,
  });

  const wordCount = getWordCount(projectDetails);
  const isTooShort = projectDetails.trim().length > 0 && wordCount < MIN_WORDS;

  const handleValidate = async () => {
    if (!projectDetails.trim() || wordCount < MIN_WORDS) return;

    setValidationState({ result: null, pending: true, error: undefined });

    try {
      const result = await validateCarbonOffsetProject({ projectDetails });
      setValidationState({ result, pending: false, error: undefined });
    } catch (e: any) {
      setValidationState({ result: null, pending: false, error: e.message || 'An unknown error occurred.' });
    }
  };

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Project Validation</CardTitle>
          <CardDescription>
            Enter the details of a carbon offset project below to get an AI-powered legitimacy and impact assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste the full description, methodology, location, certifications, and measurable impact of the carbon offset project here (minimum 30 words)..."
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              className="min-h-[200px]"
              disabled={validationState.pending}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={isTooShort ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {wordCount} / {MIN_WORDS} words minimum
              </span>
              {isTooShort && (
                <span className="text-destructive text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Please provide more detail for a meaningful assessment
                </span>
              )}
            </div>
          </div>
          <div>
            <Button onClick={handleValidate} disabled={validationState.pending || !projectDetails.trim() || isTooShort}>
              {validationState.pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Validate Project'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {validationState.error && (
        <Card className="mt-6 border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle />
                    Analysis Failed
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{validationState.error}</p>
            </CardContent>
        </Card>
      )}

      {validationState.result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Validation Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Legitimacy Score */}
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center"><Percent className="mr-2 h-5 w-5"/>Legitimacy Score</CardTitle>
              <div className="flex items-center gap-4">
                  <Progress value={validationState.result.legitimacyScore} className="w-full" />
                  <span className="font-bold text-xl">{validationState.result.legitimacyScore}%</span>
              </div>
              <CardDescription>
                A score indicating the likelihood of the project being legitimate and credible based on the provided data.
              </CardDescription>
            </div>

            {/* Environmental Impact */}
            <div className="space-y-2">
               <CardTitle className="text-lg flex items-center"><CheckCircle className="mr-2 h-5 w-5"/>Environmental Impact Assessment</CardTitle>
               <p className="text-muted-foreground">{validationState.result.environmentalImpactAssessment}</p>
            </div>

            {/* Red Flags */}
            {validationState.result.redFlags.length > 0 && (
                <div className="space-y-2">
                    <CardTitle className="text-lg flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5"/>Potential Red Flags</CardTitle>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {validationState.result.redFlags.map((flag, index) => (
                            <li key={index}>{flag}</li>
                        ))}
                    </ul>
                </div>
            )}
            {validationState.result.redFlags.length === 0 && (
                 <div className="space-y-2">
                    <CardTitle className="text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5"/>Potential Red Flags</CardTitle>
                    <p className="text-muted-foreground">No significant red flags were identified during the analysis.</p>
                </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
