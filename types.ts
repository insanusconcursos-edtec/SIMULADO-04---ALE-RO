
export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E' | 'X';

export interface User {
  nickname: string;
  email: string;
  cpf: string;
  dob: string; // Date of Birth
}

export type UserAnswers = Record<number, AnswerOption>;

export type ApprovalStatus = 'APROVADO' | 'REPROVADO';

// New types for Self Diagnosis
export type DiagnosisReason = 
  | 'DOMINIO' 
  | 'CHUTE_CONSCIENTE' 
  | 'CHUTE_SORTE' 
  | 'FALTA_CONTEUDO' 
  | 'FALTA_ATENCAO';

export interface QuestionMetadata {
  theme: string; // Free text entered by admin
  topics: string[]; // Selected from Edital Topics
}

export interface Submission {
  user: User;
  score: number;
  answers: UserAnswers;
  status: ApprovalStatus;
  reprovalReasons?: string[];
  age: number;
  module1Score: number;
  module2Score: number;
  selfDiagnosis?: Record<number, DiagnosisReason>; // New field
}

// Types for the new Appeal feature
export type AppealRequestType = 'CHANGE_ANSWER' | 'ANNUL_QUESTION';
export type AppealStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'ALREADY_APPROVED';
export type AppealDecision = 'CHANGE_ANSWER' | 'ANNUL_QUESTION';

export interface Appeal {
  id: string;
  userCpf: string;
  userNickname: string;
  questionNumber: number;
  argument: string;
  requestType: AppealRequestType;
  status: AppealStatus;
  createdAt: string; // ISO date string
  
  // Admin fields
  adminDecision?: AppealDecision;
  newAnswer?: AnswerOption; // Only if adminDecision is CHANGE_ANSWER
  adminJustification?: string;
  resolvedAt?: string; // ISO date string
}
