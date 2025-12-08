
import React, { useState } from 'react';
import { AnswerOption, Appeal, AppealStatus, AppealDecision, AppealRequestType, Submission, QuestionMetadata } from '../types';
import { TOTAL_QUESTIONS, SCORING_BREAKPOINT, DISCIPLINES } from '../constants';
import EmbedCode from './EmbedCode';
import UserResultsReport from './UserResultsReport';
import Ranking from './Ranking';

const adminOptions: AnswerOption[] = ['A', 'B', 'C', 'D', 'E', 'X'];

interface AdminViewProps {
  initialAnswers: Record<number, AnswerOption>;
  onSave: (newAnswers: Record<number, AnswerOption>) => void;
  appeals: Appeal[];
  onProcessAppeal: (updatedAppeal: Appeal) => void;
  deadline: string;
  onSetDeadline: (deadline: string) => void;
  onResetAllData: () => void;
  formTitle: string;
  onSetFormTitle: (title: string) => void;
  submissions: Submission[];
  // New props
  editalTopics: Record<string, string[]>;
  questionMetadata: Record<number, QuestionMetadata>;
  onSaveMetadata: (topics: Record<string, string[]>, meta: Record<number, QuestionMetadata>) => void;
}

type AdminTab = 'gabarito' | 'recursos' | 'resultados' | 'ranking' | 'mapeamento' | 'configuracoes';
type HistoryTab = 'DEFERIDOS' | 'INDEFERIDOS' | 'JÁ APROVADOS';

const AlertIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ResetConfirmationModal: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
}> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-pop-in text-center">
                <AlertIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Você tem certeza?</h3>
                <p className="text-textSecondary mb-6 text-sm">
                    Esta ação apagará permanentemente todos os envios de usuários, pontuações, rankings e recursos.
                    O gabarito oficial será restaurado para o padrão.
                    <br/><br/>
                    <strong>ATENÇÃO:</strong> Os tópicos do edital e o mapeamento das questões <strong>NÃO</strong> serão apagados.
                </p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="bg-gray-300 text-textSecondary font-bold py-2 px-6 rounded-lg hover:bg-gray-400">
                        Voltar
                    </button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">
                        Sim, Resetar Dados
                    </button>
                </div>
            </div>
        </div>
    );
};


// Modal component for processing appeals
const ProcessAppealModal: React.FC<{
    appeal: Appeal;
    onClose: () => void;
    onProcess: (updatedAppeal: Appeal) => void;
}> = ({ appeal, onClose, onProcess }) => {
    const [decision, setDecision] = useState<AppealStatus | null>(null);
    const [justification, setJustification] = useState('');
    const [changeType, setChangeType] = useState<AppealDecision | null>(null);
    const [newAnswer, setNewAnswer] = useState<AnswerOption | null>(null);

    const handleSubmit = () => {
        if (!decision) {
            alert('Por favor, selecione uma decisão.');
            return;
        }

        const updatedAppeal: Appeal = {
            ...appeal,
            status: decision,
            adminJustification: justification,
            resolvedAt: new Date().toISOString()
        };

        if (decision === 'APPROVED') {
            if (!changeType) {
                alert('Por favor, selecione o tipo de alteração.');
                return;
            }
            if (changeType === 'CHANGE_ANSWER' && !newAnswer) {
                alert('Por favor, selecione a nova resposta correta.');
                return;
            }
            updatedAppeal.adminDecision = changeType;
            if (changeType === 'CHANGE_ANSWER') {
                updatedAppeal.newAnswer = newAnswer as AnswerOption;
            }
        }
        
        onProcess(updatedAppeal);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-pop-in">
                <h3 className="text-xl font-bold text-secondary mb-4">Processar Recurso</h3>
                <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm">
                    <p><strong>Usuário:</strong> {appeal.userNickname} (CPF: ...{appeal.userCpf.slice(-4)})</p>
                    <p><strong>Questão:</strong> {appeal.questionNumber}</p>
                    <p><strong>Solicitação:</strong> {appeal.requestType === 'ANNUL_QUESTION' ? 'Anulação' : 'Alteração de Gabarito'}</p>
                    <p className="mt-2"><strong>Argumento:</strong></p>
                    <p className="italic">{appeal.argument}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="font-semibold">Decisão:</label>
                        <div className="flex space-x-4 mt-2">
                            <button onClick={() => setDecision('APPROVED')} className={`px-3 py-1 rounded ${decision === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Deferir</button>
                            <button onClick={() => setDecision('DENIED')} className={`px-3 py-1 rounded ${decision === 'DENIED' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Indeferir</button>
                            <button onClick={() => setDecision('ALREADY_APPROVED')} className={`px-3 py-1 rounded ${decision === 'ALREADY_APPROVED' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Já Aprovado</button>
                        </div>
                    </div>

                    {decision === 'APPROVED' && (
                        <div className="p-3 bg-green-50 rounded-md border border-green-200 space-y-2">
                            <label className="font-semibold">Tipo de Deferimento:</label>
                             <div className="flex space-x-4">
                                <label><input type="radio" name="changeType" value="ANNUL_QUESTION" onChange={() => setChangeType('ANNUL_QUESTION')} /> Anular Questão</label>
                                <label><input type="radio" name="changeType" value="CHANGE_ANSWER" onChange={() => setChangeType('CHANGE_ANSWER')} /> Alterar Gabarito</label>
                            </div>
                            {changeType === 'CHANGE_ANSWER' && (
                                <div>
                                    <label className="font-semibold">Nova Resposta:</label>
                                    <div className="flex space-x-2 mt-1">
                                        {['A','B','C','D','E'].map(opt => (
                                            <button key={opt} onClick={() => setNewAnswer(opt as AnswerOption)} className={`h-8 w-8 rounded-full font-bold ${newAnswer === opt ? 'bg-accent text-primary' : 'bg-gray-300'}`}>{opt}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="justification" className="font-semibold">Justificativa (opcional):</label>
                        <textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} className="w-full mt-1 p-2 border rounded-md h-24 bg-gray-50"></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="bg-gray-300 text-textSecondary font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button onClick={handleSubmit} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Confirmar Decisão</button>
                </div>
            </div>
        </div>
    );
};

const getStatusStyles = (status: AppealStatus) => {
    switch (status) {
      case 'APPROVED': return { borderColor: 'border-green-500', chipBg: 'bg-green-200', chipText: 'text-green-800', label: 'DEFERIDO' };
      case 'DENIED': return { borderColor: 'border-red-500', chipBg: 'bg-red-200', chipText: 'text-red-800', label: 'INDEFERIDO' };
      case 'ALREADY_APPROVED': return { borderColor: 'border-blue-500', chipBg: 'bg-blue-200', chipText: 'text-blue-800', label: 'JÁ APROVADO' };
      default: return { borderColor: 'border-gray-500', chipBg: 'bg-gray-200', chipText: 'text-gray-800', label: status };
    }
};

const ResolvedAppealItem: React.FC<{appeal: Appeal}> = ({ appeal }) => {
    if (!appeal.status || appeal.status === 'PENDING' || !appeal.resolvedAt) return null;

    const styles = getStatusStyles(appeal.status);

    return (
        <div className={`p-4 bg-white border-l-4 ${styles.borderColor} rounded-r-lg shadow-sm`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">
                        Q{appeal.questionNumber} - {appeal.userNickname} 
                        <span className="text-xs font-normal text-gray-500"> (...{appeal.userCpf.slice(-4)})</span>
                    </p>
                    <p className="text-sm text-gray-500">Resolvido em: {new Date(appeal.resolvedAt).toLocaleString('pt-BR')}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles.chipBg} ${styles.chipText}`}>{styles.label}</span>
            </div>
            <p className="mt-3 text-sm text-gray-600"><strong className="text-gray-700">Argumento do Usuário:</strong> {appeal.argument}</p>
            
            {appeal.adminDecision && (
                <div className="mt-2 text-sm text-gray-800">
                    <strong>Decisão: </strong>
                    {appeal.adminDecision === 'ANNUL_QUESTION' 
                        ? 'Anular a questão.' 
                        : `Alterar gabarito para "${appeal.newAnswer}".`}
                </div>
            )}

            {appeal.adminJustification && (
                <div className="mt-3 pt-3 border-t text-sm bg-gray-50 p-3 rounded-md">
                    <p className="font-semibold text-secondary">Justificativa do Administrador:</p>
                    <p className="italic text-gray-600">{appeal.adminJustification}</p>
                </div>
            )}
        </div>
    );
}

const MappingEditor: React.FC<{
    editalTopics: Record<string, string[]>;
    questionMetadata: Record<number, QuestionMetadata>;
    onSave: (topics: Record<string, string[]>, meta: Record<number, QuestionMetadata>) => void;
}> = ({ editalTopics, questionMetadata, onSave }) => {
    const [localTopics, setLocalTopics] = useState(editalTopics);
    const [localMeta, setLocalMeta] = useState(questionMetadata);
    const [activeDiscipline, setActiveDiscipline] = useState(DISCIPLINES[0]);
    const [newTopicInput, setNewTopicInput] = useState('');

    const handleAddTopic = () => {
        if (!newTopicInput.trim()) return;
        const currentTopics = localTopics[activeDiscipline.name] || [];
        setLocalTopics({
            ...localTopics,
            [activeDiscipline.name]: [...currentTopics, newTopicInput.trim()]
        });
        setNewTopicInput('');
    };

    const handleRemoveTopic = (topicToRemove: string) => {
         const currentTopics = localTopics[activeDiscipline.name] || [];
         setLocalTopics({
             ...localTopics,
             [activeDiscipline.name]: currentTopics.filter(t => t !== topicToRemove)
         });
    };

    const handleThemeChange = (qNumber: number, val: string) => {
        setLocalMeta(prev => ({
            ...prev,
            [qNumber]: { ...(prev[qNumber] || { topics: [] }), theme: val }
        }));
    };

    const handleTopicSelection = (qNumber: number, topic: string) => {
        const current = localMeta[qNumber] || { theme: '', topics: [] };
        const exists = current.topics.includes(topic);
        const newTopics = exists 
            ? current.topics.filter(t => t !== topic)
            : [...current.topics, topic];
        
        setLocalMeta(prev => ({
            ...prev,
            [qNumber]: { ...current, topics: newTopics }
        }));
    };

    const questions = Array.from({ length: activeDiscipline.end - activeDiscipline.start + 1 }, (_, i) => activeDiscipline.start + i);
    const availableTopics = localTopics[activeDiscipline.name] || [];

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold text-secondary mb-4">1. Configurar Tópicos do Edital</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {DISCIPLINES.map(d => (
                        <button 
                            key={d.name} 
                            onClick={() => setActiveDiscipline(d)}
                            className={`px-3 py-1 rounded-full text-sm ${activeDiscipline.name === d.name ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            {d.name}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newTopicInput} 
                        onChange={e => setNewTopicInput(e.target.value)} 
                        placeholder={`Novo tópico para ${activeDiscipline.name}`}
                        className="flex-1 border rounded px-3 py-2"
                    />
                    <button onClick={handleAddTopic} className="bg-green-600 text-white px-4 rounded font-bold">Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableTopics.map(t => (
                        <span key={t} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                            {t}
                            <button onClick={() => handleRemoveTopic(t)} className="ml-2 text-blue-500 font-bold hover:text-red-500">&times;</button>
                        </span>
                    ))}
                    {availableTopics.length === 0 && <span className="text-gray-500 text-sm">Nenhum tópico cadastrado para esta disciplina.</span>}
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold text-secondary mb-4">2. Mapear Questões: {activeDiscipline.name}</h3>
                <div className="space-y-6">
                    {questions.map(q => (
                        <div key={q} className="p-4 bg-gray-50 rounded border">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold bg-gray-200 px-2 py-1 rounded">Questão {q}</span>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-bold text-gray-500 mb-1">TEMA / ASSUNTO (Texto Livre)</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded px-2 py-1"
                                    value={localMeta[q]?.theme || ''}
                                    onChange={e => handleThemeChange(q, e.target.value)}
                                    placeholder="Ex: Crase, Regra de Três, Hardware..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">TÓPICOS DO EDITAL</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableTopics.length > 0 ? availableTopics.map(t => (
                                        <label key={t} className={`cursor-pointer px-2 py-1 rounded text-xs border ${localMeta[q]?.topics?.includes(t) ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-300'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={localMeta[q]?.topics?.includes(t) || false}
                                                onChange={() => handleTopicSelection(q, t)}
                                            />
                                            {t}
                                        </label>
                                    )) : <span className="text-xs text-red-400">Cadastre tópicos acima para selecionar.</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="sticky bottom-4 bg-white p-4 border-t shadow-lg flex justify-end">
                <button onClick={() => onSave(localTopics, localMeta)} className="bg-primary text-white font-bold py-3 px-8 rounded shadow-lg hover:bg-blue-800">
                    Salvar Todo o Mapeamento
                </button>
            </div>
        </div>
    );
};

const AdminView: React.FC<AdminViewProps> = ({ 
    initialAnswers, onSave, appeals, onProcessAppeal, deadline, onSetDeadline, 
    onResetAllData, formTitle, onSetFormTitle, submissions,
    editalTopics, questionMetadata, onSaveMetadata
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('gabarito');
  const [isEditingAnswers, setIsEditingAnswers] = useState(false);
  const [answers, setAnswers] = useState(initialAnswers);
  const [currentDeadline, setCurrentDeadline] = useState(deadline);
  const [currentTitle, setCurrentTitle] = useState(formTitle);
  const [processingAppeal, setProcessingAppeal] = useState<Appeal | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTab>('DEFERIDOS');

  const questionNumbers = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1);

  const handleSaveAnswers = () => {
    onSave(answers);
    setIsEditingAnswers(false);
  };

  const handleCancelAnswers = () => {
    setAnswers(initialAnswers);
    setIsEditingAnswers(false);
  };
  
  const handleAnswerChange = (question: number, answer: AnswerOption) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleDeadlineSave = () => {
    onSetDeadline(currentDeadline);
    alert('Prazo para recursos foi salvo!');
  };

  const handleTitleSave = () => {
    onSetFormTitle(currentTitle);
    alert('Título do formulário foi salvo!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
        case 'gabarito':
            return <GabaritoEditor 
                        isEditing={isEditingAnswers}
                        setIsEditing={setIsEditingAnswers}
                        answers={answers}
                        initialAnswers={initialAnswers}
                        onAnswerChange={handleAnswerChange}
                        onSave={handleSaveAnswers}
                        onCancel={handleCancelAnswers}
                        questionNumbers={questionNumbers}
                    />;
        case 'recursos':
            const pendingAppeals = appeals.filter(a => a.status === 'PENDING');
            const approvedAppeals = appeals.filter(a => a.status === 'APPROVED');
            const deniedAppeals = appeals.filter(a => a.status === 'DENIED');
            const alreadyApprovedAppeals = appeals.filter(a => a.status === 'ALREADY_APPROVED');

            const HistoryTabButton: React.FC<{
                label: string; count: number; isActive: boolean; onClick: () => void;
            }> = ({ label, count, isActive, onClick }) => (
                <button onClick={onClick} className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm flex items-center ${isActive ? 'bg-primary text-white' : 'bg-gray-200 text-textSecondary hover:bg-gray-300'}`}>
                    {label} <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-300'}`}>{count}</span>
                </button>
            );

            const renderHistoryList = (list: Appeal[], emptyMessage: string) => {
                if (list.length === 0) {
                    return <p className="text-textSecondary text-center py-8">{emptyMessage}</p>;
                }
                return (
                    <div className="space-y-4">
                        {list.map(appeal => <ResolvedAppealItem key={appeal.id} appeal={appeal} />)}
                    </div>
                );
            }

            return (
                <div>
                    <h3 className="text-xl font-bold mb-4">Recursos Pendentes ({pendingAppeals.length})</h3>
                    {pendingAppeals.length > 0 ? (
                        <div className="space-y-3">
                            {pendingAppeals.map(appeal => (
                                <div key={appeal.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Q{appeal.questionNumber} - {appeal.userNickname}</p>
                                        <p className="text-sm text-gray-600 truncate max-w-md">{appeal.argument}</p>
                                    </div>
                                    <button onClick={() => setProcessingAppeal(appeal)} className="bg-secondary text-white font-bold py-1 px-3 rounded-md">Processar</button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-textSecondary">Não há recursos pendentes.</p>}
                    
                    <h3 className="text-xl font-bold mt-8 mb-4">Histórico de Recursos Processados</h3>
                    <div className="flex space-x-2 mb-4">
                        <HistoryTabButton label="Deferidos" count={approvedAppeals.length} isActive={activeHistoryTab === 'DEFERIDOS'} onClick={() => setActiveHistoryTab('DEFERIDOS')} />
                        <HistoryTabButton label="Indeferidos" count={deniedAppeals.length} isActive={activeHistoryTab === 'INDEFERIDOS'} onClick={() => setActiveHistoryTab('INDEFERIDOS')} />
                        <HistoryTabButton label="Já Aprovados" count={alreadyApprovedAppeals.length} isActive={activeHistoryTab === 'JÁ APROVADOS'} onClick={() => setActiveHistoryTab('JÁ APROVADOS')} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-inner min-h-[200px]">
                        {activeHistoryTab === 'DEFERIDOS' && renderHistoryList(approvedAppeals, "Nenhum recurso foi deferido.")}
                        {activeHistoryTab === 'INDEFERIDOS' && renderHistoryList(deniedAppeals, "Nenhum recurso foi indeferido.")}
                        {activeHistoryTab === 'JÁ APROVADOS' && renderHistoryList(alreadyApprovedAppeals, "Nenhum recurso foi marcado como 'Já Aprovado'.")}
                    </div>
                </div>
            );
        case 'mapeamento':
            return <MappingEditor 
                        editalTopics={editalTopics} 
                        questionMetadata={questionMetadata} 
                        onSave={(t, m) => {
                            onSaveMetadata(t, m);
                            alert("Mapeamento salvo com sucesso!");
                        }}
                    />;
        case 'resultados':
            return <UserResultsReport submissions={submissions} adminAnswers={initialAnswers} />;
        case 'ranking':
            return <Ranking submissions={submissions} />;
        case 'configuracoes':
            return (
                <div>
                    <h3 className="text-xl font-bold mb-4">Configurações Gerais</h3>
                    <div className="space-y-6 max-w-md">
                        <div>
                            <label htmlFor="formTitle" className="block text-sm font-medium text-textSecondary mb-1">Título do Formulário</label>
                            <input
                                id="formTitle"
                                type="text"
                                value={currentTitle}
                                onChange={e => setCurrentTitle(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
                            />
                        </div>
                        <button onClick={handleTitleSave} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Salvar Título</button>
                        
                        <div className="pt-6 border-t">
                            <label htmlFor="deadline" className="block text-sm font-medium text-textSecondary mb-1">Prazo Final para Recursos</label>
                            <input
                                id="deadline"
                                type="datetime-local"
                                value={currentDeadline}
                                onChange={e => setCurrentDeadline(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
                            />
                        </div>
                        <button onClick={handleDeadlineSave} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Salvar Prazo</button>
                    </div>
                     <div className="mt-12 border-t pt-8">
                        <EmbedCode />
                    </div>
                    <div className="mt-12 pt-8 border-t border-dashed border-red-300">
                        <h4 className="text-lg font-bold text-red-600 mb-2">Zona de Perigo</h4>
                        <p className="text-sm text-textSecondary mb-4">Esta ação é irreversível. Todos os dados de usuários, pontuações e recursos serão apagados permanentemente.</p>
                        <button 
                            onClick={() => setIsResetModalOpen(true)} 
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                            <AlertIcon />
                            Restaurar Dados (Manter Mapeamento)
                        </button>
                    </div>
                </div>
            );
    }
  };

  const TabButton: React.FC<{tab: AdminTab, label: string}> = ({tab, label}) => (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === tab ? 'bg-white border-b-0 border-t-2 border-x-2 border-primary text-primary' : 'bg-gray-100 text-textSecondary'}`}
      >
        {label}
      </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="border-b border-gray-300 mb-6 flex space-x-2 overflow-x-auto no-scrollbar">
          <TabButton tab="gabarito" label="Gabarito" />
          <TabButton tab="mapeamento" label="Mapeamento" />
          <TabButton tab="recursos" label={`Recursos (${appeals.filter(a => a.status === 'PENDING').length})`} />
          <TabButton tab="resultados" label="Resultados" />
          <TabButton tab="ranking" label="Ranking" />
          <TabButton tab="configuracoes" label="Configurações" />
      </div>

      {renderTabContent()}

      {processingAppeal && <ProcessAppealModal appeal={processingAppeal} onClose={() => setProcessingAppeal(null)} onProcess={onProcessAppeal} />}
      {isResetModalOpen && (
        <ResetConfirmationModal
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={() => {
                onResetAllData();
                setIsResetModalOpen(false);
            }}
        />
      )}
    </div>
  );
};

const GabaritoEditor: React.FC<{
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    answers: Record<number, AnswerOption>;
    initialAnswers: Record<number, AnswerOption>;
    onAnswerChange: (q: number, a: AnswerOption) => void;
    onSave: () => void;
    onCancel: () => void;
    questionNumbers: number[];
}> = ({ isEditing, setIsEditing, answers, initialAnswers, onAnswerChange, onSave, onCancel, questionNumbers }) => {
    const module1Questions = questionNumbers.filter(q => q <= SCORING_BREAKPOINT);
    const module2Questions = questionNumbers.filter(q => q > SCORING_BREAKPOINT);
  
    const module1Columns = [module1Questions.slice(0, 20), module1Questions.slice(20, 40)];
    const module2Columns = [module2Questions.slice(0, 20), module2Questions.slice(20, 40)];

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-secondary mb-6">Gabarito Oficial</h2>
            {isEditing ? (
                 <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-4 border-b-2 border-primary pb-2">MÓDULO I</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {module1Columns.map((column, colIndex) => (
                            <div key={`m1-col-${colIndex}`} className="flex flex-col space-y-2">
                                {column.map(qNumber => (
                                <AdminQuestionItemEditor key={qNumber} number={qNumber} currentAnswer={answers[qNumber]} onAnswerChange={onAnswerChange}/>
                                ))}
                            </div>
                            ))}
                        </div>
                        </div>
                        <div>
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-4 border-b-2 border-primary pb-2">MÓDULO II</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {module2Columns.map((column, colIndex) => (
                            <div key={`m2-col-${colIndex}`} className="flex flex-col space-y-2">
                                {column.map(qNumber => (
                                <AdminQuestionItemEditor key={qNumber} number={qNumber} currentAnswer={answers[qNumber]} onAnswerChange={onAnswerChange}/>
                                ))}
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                    <div className="flex justify-center space-x-4 mt-8">
                        <button onClick={onSave} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors">Salvar</button>
                        <button onClick={onCancel} className="bg-gray-200 text-textSecondary font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
                        <h4 className="col-span-full text-lg font-bold text-secondary mt-2 mb-2 border-b">MÓDULO I</h4>
                        {module1Questions.map(qNumber => (
                        <div key={qNumber} className={`p-3 rounded-lg ${initialAnswers[qNumber] === 'X' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                            <span className="font-bold text-gray-700">{qNumber}.</span>
                            <span className={`ml-2 font-mono text-lg ${initialAnswers[qNumber] === 'X' ? 'text-orange-700 font-extrabold' : 'text-primary'}`}>{initialAnswers[qNumber]}</span>
                        </div>
                        ))}
                        <h4 className="col-span-full text-lg font-bold text-secondary mt-4 mb-2 border-b">MÓDULO II</h4>
                        {module2Questions.map(qNumber => (
                        <div key={qNumber} className={`p-3 rounded-lg ${initialAnswers[qNumber] === 'X' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                            <span className="font-bold text-gray-700">{qNumber}.</span>
                            <span className={`ml-2 font-mono text-lg ${initialAnswers[qNumber] === 'X' ? 'text-orange-700 font-extrabold' : 'text-primary'}`}>{initialAnswers[qNumber]}</span>
                        </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => setIsEditing(true)} className="bg-accent text-primary font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105">
                        Editar Gabarito
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const AdminQuestionItemEditor: React.FC<{
  number: number;
  currentAnswer: AnswerOption;
  onAnswerChange: (question: number, answer: AnswerOption) => void;
}> = ({ number, currentAnswer, onAnswerChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
      <span className="font-bold text-sm text-gray-700 w-8 text-center">{number}.</span>
      <div className="flex space-x-1">
        {adminOptions.map(option => (
          <label key={option} className={`
            cursor-pointer rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold transition-colors
            ${currentAnswer === option ? 'bg-accent text-primary' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
          `}>
            <input
              type="radio"
              name={`admin-question-${number}`}
              value={option}
              checked={currentAnswer === option}
              onChange={() => onAnswerChange(number, option)}
              className="opacity-0 w-0 h-0"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdminView;
