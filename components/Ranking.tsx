import React, { useMemo, useState } from 'react';
import { Submission } from '../types';

interface RankingProps {
  submissions: Submission[];
  currentUserCpf?: string;
}

const MedalIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.3 2.5a1.5 1.5 0 012.4 1.1l.3 1.9a1.5 1.5 0 001.4 1.1l1.9.3a1.5 1.5 0 011.1 2.4l-1.2 1.6a1.5 1.5 0 000 1.8l1.2 1.6a1.5 1.5 0 01-1.1 2.4l-1.9.3a1.5 1.5 0 00-1.4 1.1l-.3 1.9a1.5 1.5 0 01-2.4 1.1l-1.6-1.2a1.5 1.5 0 00-1.8 0l-1.6 1.2a1.5 1.5 0 01-2.4-1.1l-.3-1.9a1.5 1.5 0 00-1.4-1.1l-1.9-.3a1.5 1.5 0 01-1.1-2.4l1.2-1.6a1.5 1.5 0 000-1.8L.7 8.3a1.5 1.5 0 011.1-2.4l1.9-.3a1.5 1.5 0 001.4-1.1l.3-1.9a1.5 1.5 0 012.4-1.1l1.6 1.2a1.5 1.5 0 001.8 0l1.6-1.2zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const Ranking: React.FC<RankingProps> = ({ submissions, currentUserCpf }) => {
    const [searchTerm, setSearchTerm] = useState('');

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

    const { sortedApproved, sortedDisapproved } = useMemo(() => {
        const approved = submissions.filter(s => s.status === 'APROVADO');
        const disapproved = submissions.filter(s => s.status === 'REPROVADO');
        return {
            sortedApproved: [...approved].sort(sortLogic),
            sortedDisapproved: [...disapproved].sort(sortLogic),
        };
    }, [submissions]);

    const filterSubmissions = (subs: Submission[], term: string) => {
        if (!term) return subs;
        return subs.filter(sub =>
            sub.user.nickname.toLowerCase().includes(term.toLowerCase())
        );
    };

    const filteredApproved = useMemo(() => filterSubmissions(sortedApproved, searchTerm), [sortedApproved, searchTerm]);
    const filteredDisapproved = useMemo(() => filterSubmissions(sortedDisapproved, searchTerm), [sortedDisapproved, searchTerm]);

    const getRankColor = (index: number) => {
        if (index === 0) return 'text-yellow-400'; // Gold
        if (index === 1) return 'text-gray-400';   // Silver
        if (index === 2) return 'text-amber-700'; // Bronze
        return 'text-gray-500';
    };

    const renderRankingList = (list: Submission[], originalSortedList: Submission[], title: string, statusClass: string) => (
        <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-4 border-b-2 pb-2 ${statusClass}`}>{title}</h3>
            <div className="bg-gray-50 rounded-lg shadow-inner overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {list.length > 0 ? (
                        list.map((sub) => {
                            const isCurrentUser = currentUserCpf && sub.user.cpf === currentUserCpf;
                            const rank = originalSortedList.findIndex(s => s.user.cpf === sub.user.cpf) + 1;

                            return (
                                <li key={sub.user.cpf} className={`flex items-center justify-between p-4 transition-colors ${isCurrentUser ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                    <div className="flex items-center">
                                        <span className={`font-bold text-lg w-10 ${getRankColor(rank - 1)}`}>{rank}º</span>
                                        {title === 'Aprovados' && rank <= 3 && <MedalIcon className={`h-6 w-6 mr-3 ${getRankColor(rank - 1)}`} />}
                                        <div>
                                            <span className="font-medium text-textPrimary">{sub.user.nickname} {isCurrentUser && '(Você)'}</span>
                                            <span className="text-xs text-textSecondary block">{sub.age} anos</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg text-primary w-24 text-right">{sub.score} pts</span>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <li className="p-6 text-center text-textSecondary">
                            {searchTerm ? `Nenhum ${title.slice(0,-1).toLowerCase()} encontrado.` : `Não há candidatos na lista de ${title.toLowerCase()}.`}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-3xl font-bold text-secondary">Ranking de Pontuações</h2>
                 <input
                    type="text"
                    placeholder="Buscar por apelido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                />
            </div>

            {renderRankingList(filteredApproved, sortedApproved, 'Aprovados', 'text-green-600 border-green-500')}
            {renderRankingList(filteredDisapproved, sortedDisapproved, 'Reprovados', 'text-red-600 border-red-500')}
            
        </div>
    );
};

export default Ranking;