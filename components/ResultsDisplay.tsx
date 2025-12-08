
import React, { useState } from 'react';
import { UserAnswers, AnswerOption, ApprovalStatus, Submission, QuestionMetadata, DiagnosisReason } from '../types';
import { SCORING_BREAKPOINT, POINTS_PART_1, POINTS_PART_2 } from '../constants';
import SelfDiagnosis from './SelfDiagnosis';

interface ResultsDisplayProps {
  score: number;
  totalPoints: number;
  rank: number;
  userAnswers: UserAnswers;
  adminAnswers: Record<number, AnswerOption>;
  status: ApprovalStatus;
  reprovalReasons?: string[];
  // New props for integration
  fullSubmission?: Submission;
  questionMetadata?: Record<number, QuestionMetadata>;
  editalTopics?: Record<string, string[]>;
  onSaveDiagnosis?: (diagnosis: Record<number, DiagnosisReason>) => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    score, totalPoints, rank, userAnswers, adminAnswers, status, reprovalReasons,
    fullSubmission, questionMetadata, editalTopics, onSaveDiagnosis
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnosis'>('overview');

  const questionNumbers = Object.keys(adminAnswers).map(n => parseInt(n, 10)).sort((a,b) => a - b);
  const lostPoints = totalPoints - score;
  
  const module1Questions = questionNumbers.filter(q => q <= SCORING_BREAKPOINT);
  const module2Questions = questionNumbers.filter(q => q > SCORING_BREAKPOINT);
  
  const isApproved = status === 'APROVADO';

  const renderFeedbackItem = (qNumber: number) => {
    const userAnswer = userAnswers[qNumber];
    const correctAnswer = adminAnswers[qNumber];
    const isAnnulled = correctAnswer === 'X';
    const userAnswered = !!userAnswer;
    const isCorrect = (isAnnulled && userAnswered) || userAnswer === correctAnswer;
    const points = qNumber <= SCORING_BREAKPOINT ? POINTS_PART_1 : POINTS_PART_2;
    const pointText = points === 1 ? 'ponto' : 'pontos';

    let containerClasses = 'p-3 rounded-lg text-sm ';
    let statusIcon = null;
    let pointPill = null;

    if (isAnnulled) {
        if (userAnswered) {
            containerClasses += 'bg-orange-100 text-orange-800'; // Annulled, points awarded
            statusIcon = <span className="ml-2 text-xs font-bold uppercase">(ANULADA)</span>;
            pointPill = (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">
                    +{points} {pointText}
                </span>
            );
        } else {
            containerClasses += 'bg-gray-100 text-gray-700'; // Annulled, no answer
            statusIcon = <span className="ml-2 text-xs font-bold uppercase">(ANULADA)</span>;
            pointPill = (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                    0 / {points} {pointText}
                </span>
            );
        }
    } else if (isCorrect) {
        containerClasses += 'bg-green-100 text-green-800'; // Correct
        statusIcon = <CheckIcon className="w-4 h-4 ml-2 text-green-600 animate-pop-in" />;
        pointPill = (
             <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800">
                +{points} {pointText}
            </span>
        );
    } else {
        containerClasses += 'bg-red-100 text-red-800'; // Incorrect
        statusIcon = <XIcon className="w-4 h-4 ml-2 text-red-600 animate-pop-in" />;
        pointPill = (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-200 text-red-800">
                0 / {points} {pointText}
            </span>
        );
    }

    return (
        <div key={qNumber} className={containerClasses}>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                    <p className="font-bold">Questão {qNumber}</p>
                    {statusIcon}
                </div>
                {pointPill}
            </div>
            <p>Sua resposta: <span className="font-semibold">{userAnswer || 'N/A'}</span></p>
            {!isCorrect && !isAnnulled && <p>Correta: <span className="font-semibold">{correctAnswer}</span></p>}
        </div>
    );
  }

  return (
    <div className="text-center animate-fade-in-up flex flex-col items-center w-full">
      {/* Tab Switching */}
      {fullSubmission && onSaveDiagnosis && (
        <div className="flex space-x-4 mb-6">
            <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
                Visão Geral
            </button>
            <button
                onClick={() => setActiveTab('diagnosis')}
                className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'diagnosis' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
                Autodiagnóstico
            </button>
        </div>
      )}

      {activeTab === 'diagnosis' && fullSubmission && questionMetadata && editalTopics && onSaveDiagnosis ? (
         <div className="w-full text-left">
            <SelfDiagnosis 
                submission={fullSubmission}
                adminAnswers={adminAnswers}
                questionMetadata={questionMetadata}
                editalTopics={editalTopics}
                onSaveDiagnosis={onSaveDiagnosis}
            />
         </div>
      ) : (
        <>
            <svg className="w-24 h-24 text-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-3xl font-bold text-secondary mb-2">Gabarito Enviado!</h2>
            <p className="text-lg text-textSecondary mb-6">Confira seu desempenho abaixo.</p>
            
            <div className={`w-full max-w-md p-4 mb-6 rounded-lg text-white shadow-lg text-center ${isApproved ? 'bg-green-600' : 'bg-red-600'}`}>
                <h3 className="text-2xl font-bold">{status}</h3>
                {!isApproved && reprovalReasons && (
                <div className="mt-2 text-sm text-left">
                    <p className="font-semibold">Motivos da Reprovação:</p>
                    <ul className="list-disc list-inside ml-2">
                    {reprovalReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                    ))}
                    </ul>
                </div>
                )}
            </div>

            <div className="bg-primary text-white rounded-xl p-6 mb-4 shadow-lg flex items-center justify-around w-full max-w-md">
                <div>
                <p className="text-lg mb-1">Sua pontuação:</p>
                <p className="text-5xl font-bold">
                    {score} <span className="text-2xl font-normal">/ {totalPoints}</span>
                </p>
                </div>
                <div className="border-l-2 border-blue-300 h-16 mx-4"></div>
                <div>
                <p className="text-lg mb-1">Seu ranking:</p>
                <p className="text-5xl font-bold">{rank}º</p>
                </div>
            </div>

            <div className="bg-red-100 text-red-800 rounded-xl p-4 mb-8 shadow-md w-full max-w-md">
                <p className="font-semibold">Total de pontos perdidos:</p>
                <p className="text-3xl font-bold">{lostPoints}</p>
            </div>

            <div className="w-full mt-4">
                <h3 className="text-2xl font-bold text-secondary mb-4">Feedback Detalhado</h3>
                <div className="max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-left">
                        <h4 className="col-span-full text-lg font-bold text-secondary mt-2 mb-2 border-b">MÓDULO I</h4>
                        {module1Questions.map(renderFeedbackItem)}
                        
                        <h4 className="col-span-full text-lg font-bold text-secondary mt-4 mb-2 border-b">MÓDULO II</h4>
                        {module2Questions.map(renderFeedbackItem)}
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default ResultsDisplay;
