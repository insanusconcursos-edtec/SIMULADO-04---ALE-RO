import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  error: string | null;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-secondary mb-6">Acesso Restrito</h2>
      <p className="text-center text-textSecondary mb-8">Por favor, insira suas credenciais de administrador para continuar.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="admin-user" className="block text-sm font-medium text-textSecondary mb-1">Usuário Admin</label>
          <input
            id="admin-user"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-secondary"
            required
            autoFocus
            placeholder="Digite o usuário"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-textSecondary mb-1">Senha</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-secondary"
            required
            placeholder="Digite a senha"
          />
        </div>
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p>{error}</p>
            </div>
        )}
        <button
          type="submit"
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary transition-colors duration-300"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;