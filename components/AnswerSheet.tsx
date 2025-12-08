import React, { useState } from 'react';
import { UserAnswers, AnswerOption } from '../types';
import { TOTAL_QUESTIONS } from '../constants';

const options: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

interface QuestionItemProps {
  number: number;
  selectedAnswer: AnswerOption | undefined;
  onAnswerChange: (question: number, answer: AnswerOption) => void;
  isMissing: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = React.memo(({ number, selectedAnswer, onAnswerChange, isMissing }) => {
  return (
    <div className={`flex items-center space-x-2 bg-gray-50 p-2 rounded-lg transition-all duration-300 ${isMissing ? 'ring-2 ring-red-400' : ''}`}>
      <span className="font-bold text-sm text-gray-700 w-8 text-center">{number}.</span>
      <div className="flex space-x-1">
        {options.map(option => (
          <label key={option} className={`
            cursor-pointer rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold transition-colors
            ${selectedAnswer === option ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
          `}>
            <input
              type="radio"
              name={`question-${number}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswerChange(number, option)}
              className="opacity-0 w-0 h-0"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
});


interface AnswerSheetProps {
  answers: UserAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<UserAnswers>>;
  onSubmit: () => void;
  userNickname: string;
}

const AnswerSheet: React.FC<AnswerSheetProps> = ({ answers, setAnswers, onSubmit, userNickname }) => {
  const [missingQuestions, setMissingQuestions] = useState<Set<number>>(new Set());
  
  const questionNumbers = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1);

  const handleAnswerChange = (question: number, answer: AnswerOption) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
    if (missingQuestions.has(question)) {
      setMissingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(question);
        return newSet;
      });
    }
  };

  const handleSubmit = () => {
    const unanswered = questionNumbers.filter(q => !answers[q]);
    if (unanswered.length > 0) {
      setMissingQuestions(new Set(unanswered));
    } else {
      setMissingQuestions(new Set());
      // Directly submit without confirmation
      onSubmit();
    }
  };
  
  const answeredCount = Object.keys(answers).length;
  
  const module1Questions = questionNumbers.slice(0, 40);
  const module2Questions = questionNumbers.slice(40, 80);

  const module1Columns = [module1Questions.slice(0, 20), module1Questions.slice(20, 40)];
  const module2Columns = [module2Questions.slice(0, 20), module2Questions.slice(20, 40)];
  
  return (
    <div className="animate-fade-in relative">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-secondary">Gabarito de Respostas</h2>
        <p className="text-textSecondary">Olá, {userNickname}! Selecione uma alternativa para cada questão.</p>
        <div className="mt-4">
            <span className={`text-lg font-semibold ${answeredCount === TOTAL_QUESTIONS ? 'text-green-600' : 'text-amber-600'}`}>
                {answeredCount} / {TOTAL_QUESTIONS} respondidas
            </span>
        </div>
      </div>
      
      {missingQuestions.size > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
            <p className="font-bold">Questões Pendentes</p>
            {/* FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. */}
            <p>Por favor, preencha as seguintes questões para continuar: {Array.from(missingQuestions).sort((a, b) => Number(a) - Number(b)).join(', ')}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Module I */}
        <div>
          <h3 className="text-xl font-bold text-center text-gray-800 mb-4 border-b-2 border-primary pb-2">MÓDULO I</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {module1Columns.map((column, colIndex) => (
              <div key={`m1-col-${colIndex}`} className="flex flex-col space-y-2">
                {column.map(qNumber => (
                  <QuestionItem
                    key={qNumber}
                    number={qNumber}
                    selectedAnswer={answers[qNumber]}
                    onAnswerChange={handleAnswerChange}
                    isMissing={missingQuestions.has(qNumber)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Module II */}
        <div>
          <h3 className="text-xl font-bold text-center text-gray-800 mb-4 border-b-2 border-primary pb-2">MÓDULO II</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {module2Columns.map((column, colIndex) => (
              <div key={`m2-col-${colIndex}`} className="flex flex-col space-y-2">
                {column.map(qNumber => (
                  <QuestionItem
                    key={qNumber}
                    number={qNumber}
                    selectedAnswer={answers[qNumber]}
                    onAnswerChange={handleAnswerChange}
                    isMissing={missingQuestions.has(qNumber)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-accent text-primary font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
        >
          Enviar Gabarito
        </button>
      </div>
    </div>
  );
};

export default AnswerSheet;