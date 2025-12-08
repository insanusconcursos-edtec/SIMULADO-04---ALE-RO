import React, { useState, useMemo } from 'react';
import { User, Appeal, AppealRequestType } from '../types';
import { TOTAL_QUESTIONS } from '../constants';

interface UserAppealsProps {
  currentUser: User;
  allAppeals: Appeal[];
  onSubmitAppeal: (appealData: Omit<Appeal, 'id' | 'createdAt' | 'status'>) => void;
  appealDeadline: string;
}

const UserAppeals: React.FC<UserAppealsProps> = ({ currentUser, allAppeals, onSubmitAppeal, appealDeadline }) => {
  const [questionNumber, setQuestionNumber] = useState<number | ''>('');
  const [requestType, setRequestType] = useState<AppealRequestType>('CHANGE_ANSWER');
  const [argument, setArgument] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const myAppeals = useMemo(() => {
    return allAppeals
      .filter(a => a.userCpf === currentUser.cpf)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allAppeals, currentUser.cpf]);

  const approvedAppeals = useMemo(() => {
    return allAppeals
      .filter(a => a.status === 'APPROVED')
      .sort((a, b) => new Date(b.resolvedAt || 0).getTime() - new Date(a.resolvedAt || 0).getTime());
  }, [allAppeals]);

  const appealedQuestions = useMemo(() => new Set(myAppeals.map(a => a.questionNumber)), [myAppeals]);

  const availableQuestions = useMemo(() => {
    return Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1)
      .filter(q => !appealedQuestions.has(q));
  }, [appealedQuestions]);

  const isDeadlinePassed = appealDeadline ? new Date(appealDeadline) < new Date() : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!questionNumber || !argument.trim()) {
      setFormError('Por favor, selecione uma questão e escreva seu argumento.');
      return;
    }
    onSubmitAppeal({
      userCpf: currentUser.cpf,
      userNickname: currentUser.nickname,
      questionNumber: Number(questionNumber),
      argument,
      requestType,
    });
    // Reset form
    setQuestionNumber('');
    setArgument('');
    setRequestType('CHANGE_ANSWER');
  };

  const getStatusChip = (status: Appeal['status']) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pendente</span>;
      case 'APPROVED': return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Deferido</span>;
      case 'DENIED': return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Indeferido</span>;
      case 'ALREADY_APPROVED': return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">Recurso Já Aprovado</span>;
      default: return null;
    }
  };

  const renderDeadlineInfo = () => {
    if (!appealDeadline) {
      return <div className="p-4 mb-6 text-center text-blue-800 bg-blue-100 rounded-lg">A fase de recursos ainda não foi aberta pelo administrador.</div>;
    }
    if (isDeadlinePassed) {
      return <div className="p-4 mb-6 text-center text-red-800 bg-red-100 rounded-lg">O prazo para envio de novos recursos encerrou em {new Date(appealDeadline).toLocaleString('pt-BR')}.</div>;
    }
    return <div className="p-4 mb-6 text-center text-green-800 bg-green-100 rounded-lg">O prazo para envio de recursos termina em <strong>{new Date(appealDeadline).toLocaleString('pt-BR')}</strong>.</div>;
  };

  return (
    <div className="animate-fade-in space-y-12">
      {/* Section to submit a new appeal */}
      <section>
        <h2 className="text-2xl font-bold text-secondary mb-4">Enviar Novo Recurso</h2>
        {renderDeadlineInfo()}
        {!isDeadlinePassed && appealDeadline && (
          <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="questionNumber" className="block text-sm font-medium text-textSecondary mb-1">Questão</label>
                    <select
                        id="questionNumber"
                        value={questionNumber}
                        onChange={e => setQuestionNumber(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
                        required
                    >
                        <option value="">Selecione a questão...</option>
                        {availableQuestions.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Tipo de Solicitação</label>
                    <div className="flex items-center space-x-4 pt-2">
                        <label><input type="radio" name="requestType" value="CHANGE_ANSWER" checked={requestType === 'CHANGE_ANSWER'} onChange={() => setRequestType('CHANGE_ANSWER')} /> Alterar Gabarito</label>
                        <label><input type="radio" name="requestType" value="ANNUL_QUESTION" checked={requestType === 'ANNUL_QUESTION'} onChange={() => setRequestType('ANNUL_QUESTION')} /> Anular Questão</label>
                    </div>
                </div>
            </div>
            <div>
              <label htmlFor="argument" className="block text-sm font-medium text-textSecondary mb-1">Argumento</label>
              <textarea
                id="argument"
                value={argument}
                onChange={e => setArgument(e.target.value)}
                className="w-full p-2 border rounded-md h-28 bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
                placeholder="Justifique o motivo do seu recurso com base em fontes confiáveis."
                required
              />
            </div>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <div className="text-right">
              <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary">Enviar Recurso</button>
            </div>
          </form>
        )}
      </section>

      {/* Section to view my appeals */}
      <section>
        <h2 className="text-2xl font-bold text-secondary mb-4">Meus Recursos</h2>
        <div className="space-y-4">
          {myAppeals.length > 0 ? myAppeals.map(appeal => (
            <div key={appeal.id} className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">Questão {appeal.questionNumber}</p>
                    <p className="text-sm text-gray-500">Enviado em: {new Date(appeal.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  {getStatusChip(appeal.status)}
              </div>
              <p className="mt-2 text-sm text-gray-700">{appeal.argument}</p>
              {appeal.adminJustification && (
                  <div className="mt-3 pt-3 border-t text-sm bg-gray-50 p-3 rounded-md">
                      <p className="font-semibold text-secondary">Resposta do Administrador:</p>
                      <p className="italic text-gray-600">{appeal.adminJustification}</p>
                  </div>
              )}
            </div>
          )) : <p className="text-textSecondary">Você ainda não enviou nenhum recurso.</p>}
        </div>
      </section>

      {/* Section to view approved appeals */}
      <section>
        <h2 className="text-2xl font-bold text-secondary mb-4">Recursos Deferidos (Público)</h2>
        <div className="space-y-4">
           {approvedAppeals.length > 0 ? approvedAppeals.map(appeal => (
            <div key={appeal.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-bold">Questão {appeal.questionNumber}</p>
                <p className="text-sm">
                    <strong>Decisão:</strong>{' '}
                    {appeal.adminDecision === 'ANNUL_QUESTION'
                        ? 'Questão Anulada.'
                        : `Gabarito alterado para ${appeal.newAnswer}.`}
                </p>
                {appeal.adminJustification && <p className="text-sm mt-1"><strong>Justificativa:</strong> {appeal.adminJustification}</p>}
            </div>
          )) : <p className="text-textSecondary">Nenhum recurso foi deferido até o momento.</p>}
        </div>
      </section>
    </div>
  );
};

export default UserAppeals;