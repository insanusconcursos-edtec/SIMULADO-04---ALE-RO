
import { AnswerOption } from './types';

export const DEFAULT_ADMIN_ANSWERS: Record<number, AnswerOption> = {
    1: 'B', 2: 'D', 3: 'A', 4: 'C', 5: 'E', 6: 'B', 7: 'A', 8: 'D', 9: 'C', 10: 'E',
    11: 'A', 12: 'C', 13: 'E', 14: 'B', 15: 'D', 16: 'A', 17: 'E', 18: 'C', 19: 'B', 20: 'D',
    21: 'C', 22: 'A', 23: 'D', 24: 'B', 25: 'E', 26: 'A', 27: 'D', 28: 'B', 29: 'C', 30: 'E',
    31: 'D', 32: 'B', 33: 'E', 34: 'A', 35: 'C', 36: 'D', 37: 'A', 38: 'E', 39: 'B', 40: 'C',
    41: 'E', 42: 'A', 43: 'C', 44: 'D', 45: 'B', 46: 'E', 47: 'D', 48: 'A', 49: 'C', 50: 'B',
    51: 'D', 52: 'C', 53: 'A', 54: 'E', 55: 'B', 56: 'C', 57: 'A', 58: 'D', 59: 'B', 60: 'E',
    61: 'A', 62: 'E', 63: 'B', 64: 'C', 65: 'D', 66: 'B', 67: 'E', 68: 'C', 69: 'A', 70: 'D',
    71: 'C', 72: 'B', 73: 'D', 74: 'A', 75: 'E', 76: 'D', 77: 'B', 78: 'E', 79: 'A', 80: 'C',
};

export const TOTAL_QUESTIONS = 80;
export const QUESTIONS_PER_ROW = 20;

export const SCORING_BREAKPOINT = 40;
export const POINTS_PART_1 = 1;
export const POINTS_PART_2 = 2;

export const MAX_POSSIBLE_SCORE = (SCORING_BREAKPOINT * POINTS_PART_1) + ((TOTAL_QUESTIONS - SCORING_BREAKPOINT) * POINTS_PART_2);

export const ADMIN_USERNAME = 'adm_insano';
export const ADMIN_PASSWORD = 'treinoinsano110921';

export const DISCIPLINES = [
  { name: 'LÍNGUA PORTUGUESA', start: 1, end: 12 },
  { name: 'RACIOCÍNIO LÓGICO', start: 13, end: 18 },
  { name: 'NOÇÕES DE INFORMÁTICA', start: 19, end: 24 },
  { name: 'LEGISLAÇÃO ESPECÍFICA', start: 25, end: 32 },
  { name: 'HISTÓRIA E GEOGRAFIA DE RONDÔNIA', start: 33, end: 40 },
  { name: 'CONHECIMENTOS ESPECÍFICOS', start: 41, end: 80 },
];
