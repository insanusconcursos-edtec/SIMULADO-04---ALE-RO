import React, { useMemo, useState } from 'react';
import { Submission, AnswerOption } from '../types';
import ResultsDisplay from './ResultsDisplay';
import { MAX_POSSIBLE_SCORE } from '../constants';

interface UserResultsReportProps {
  submissions: Submission[];
  adminAnswers: Record<number, AnswerOption>;
}

const ResultsModal: React.FC<{
    submission: Submission;
    rank: number;
    onClose: () => void;
    adminAnswers: Record<number, AnswerOption>;
}> = ({ submission, rank, onClose, adminAnswers }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] animate-pop-in flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-secondary">Relatório de {submission.user.nickname}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </header>
                <div className="p-6 overflow-y-auto">
                   <ResultsDisplay
                        score={submission.score}
                        totalPoints={MAX_POSSIBLE_SCORE}
                        rank={rank}
                        userAnswers={submission.answers}
                        adminAnswers={adminAnswers}
                        status={submission.status}
                        reprovalReasons={submission.reprovalReasons}
                    />
                </div>
            </div>
        </div>
    );
};

const UserResultsReport: React.FC<UserResultsReportProps> = ({ submissions, adminAnswers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const sortLogic = (a: Submission, b: Submission) => {
        if (b.score !== a.score) return b.score - a.score;
        const aIsSenior = a.age >= 60;
        const bIsSenior = b.age >= 60;
        if (aIsSenior && !bIsSenior) return -1;
        if (!aIsSenior && bIsSenior) return 1;
        if (aIsSenior && bIsSenior) {
            if (b.age !== a.age) return b.age - a.age;
        }
        if (b.module2Score !== a.module2Score) return b.module2Score - a.module2Score;
        if (b.module1Score !== a.module1Score) return b.module1Score - a.module1Score;
        return b.age - a.age;
    };

    const sortedSubmissions = useMemo(() => {
        return [...submissions].sort(sortLogic);
    }, [submissions]);

    const filteredSubmissions = useMemo(() => {
        if (!searchTerm) return sortedSubmissions;
        const lowercasedTerm = searchTerm.toLowerCase();
        return sortedSubmissions.filter(sub =>
            sub.user.nickname.toLowerCase().includes(lowercasedTerm) ||
            sub.user.email.toLowerCase().includes(lowercasedTerm) ||
            sub.user.cpf.includes(lowercasedTerm)
        );
    }, [sortedSubmissions, searchTerm]);
    
    const getRank = (submission: Submission) => {
        return sortedSubmissions.findIndex(s => s.user.cpf === submission.user.cpf) + 1;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-secondary">Relatório de Resultados</h2>
                 <input
                    type="text"
                    placeholder="Buscar por apelido, e-mail ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Rank</th>
                            <th scope="col" className="px-6 py-3">Apelido</th>
                            <th scope="col" className="px-6 py-3">CPF</th>
                            <th scope="col" className="px-6 py-3">E-mail</th>
                            <th scope="col" className="px-6 py-3">Pontuação</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.length > 0 ? (
                            filteredSubmissions.map((sub) => (
                                <tr 
                                    key={sub.user.cpf} 
                                    className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedSubmission(sub)}
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900">{getRank(sub)}º</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{sub.user.nickname}</td>
                                    <td className="px-6 py-4">{sub.user.cpf}</td>
                                    <td className="px-6 py-4">{sub.user.email}</td>
                                    <td className="px-6 py-4 font-bold">{sub.score}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            sub.status === 'APROVADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    {searchTerm ? 'Nenhum resultado encontrado.' : 'Não há envios para exibir.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedSubmission && (
                <ResultsModal
                    submission={selectedSubmission}
                    rank={getRank(selectedSubmission)}
                    onClose={() => setSelectedSubmission(null)}
                    adminAnswers={adminAnswers}
                />
            )}
        </div>
    );
};

export default UserResultsReport;