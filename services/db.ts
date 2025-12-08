
import { Submission, AnswerOption, Appeal, QuestionMetadata } from '../types';
import { DEFAULT_ADMIN_ANSWERS } from '../constants';
import { db } from './firebase';

export interface DBState {
  submissions: Submission[];
  adminAnswers: Record<number, AnswerOption>;
  appeals: Appeal[];
  appealDeadline: string;
  formTitle: string;
  // New Fields
  editalTopics: Record<string, string[]>; // Key is Discipline Name, Value is list of topics
  questionMetadata: Record<number, QuestionMetadata>;
}

const docRef = db.collection("appState").doc("singleton");

export const defaultState: DBState = {
  submissions: [],
  adminAnswers: DEFAULT_ADMIN_ANSWERS,
  appeals: [],
  appealDeadline: '',
  formTitle: 'SIMULADO 04 - ALE RO - (RANKING)', // Atualizado para Simulado 04
  editalTopics: {},
  questionMetadata: {},
};

export const getData = async (): Promise<DBState> => {
  try {
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Merge with default state to handle schema changes gracefully
      const data = docSnap.data() as DBState;
      return { 
          ...defaultState, 
          ...data,
          // Ensure new fields exist if merging from old DB version
          editalTopics: data.editalTopics || {},
          questionMetadata: data.questionMetadata || {}
      };
    } else {
      // Document doesn't exist, so initialize it with the default state
      console.log("No document found in Firestore. Initializing with default state.");
      // We attempt to set data. If the DB doesn't exist, this might fail, 
      // catching the error below which provides the instruction.
      try {
        await setData(defaultState);
      } catch (innerError) {
         console.warn("Could not initialize default state on server (likely due to missing DB). Continuing with local default state.");
      }
      return defaultState;
    }
  } catch (error: any) {
    // Check for specific "database not found" error to help the developer
    if (error?.code === 'not-found' || (error?.message && error.message.includes('database (default) does not exist'))) {
        console.error("%c ERRO CRÍTICO: O banco de dados Firestore não foi criado.", "background: red; color: white; font-size: 16px; padding: 4px;");
        // Atualizado para orientar sobre o projeto correto
        console.error("AÇÃO NECESSÁRIA: Acesse https://console.firebase.google.com, selecione o projeto 'simulado-04-ale-ro', vá em 'Firestore Database' e clique em 'Criar Banco de Dados'.");
    } else {
        console.error("Failed to read from Firestore, using default state.", error);
    }
    
    // Provide default state on error to prevent app crash
    return { ...defaultState };
  }
};

export const setData = async (data: DBState): Promise<void> => {
  try {
    await docRef.set(data);
  } catch (error) {
    console.error("Failed to write to Firestore.", error);
    // Re-throw the error so the UI can notify the user
    throw error;
  }
};
