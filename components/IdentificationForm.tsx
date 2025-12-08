import React, { useState, useMemo, useEffect } from 'react';
import { User, Submission } from '../types';
import { formatCPF, validateCPF } from '../services/validationService';

interface IdentificationFormProps {
  onSubmit: (user: User) => void;
  onLogin: (cpf: string) => void;
  submissions: Submission[];
  error: string | null;
}

const IdentificationForm: React.FC<IdentificationFormProps> = ({ onSubmit, onLogin, submissions, error }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [dob, setDob] = useState('');
  
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);

  const [loginCpf, setLoginCpf] = useState('');
  const [loginCpfError, setLoginCpfError] = useState<string | null>(null);

  const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    const exists = submissions.some(sub => sub.user.nickname.toLowerCase() === newNickname.toLowerCase());
    if (exists) {
      setNicknameError('Apelido já existe. Escolha outro.');
    } else {
      setNicknameError(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && !isEmailValid(newEmail)) {
      setEmailError('Formato de e-mail inválido.');
    } else {
      setEmailError(null);
    }
  };
  
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCpf = formatCPF(e.target.value);
    setCpf(formattedCpf);

    if (formattedCpf.length === 14) {
      if (!validateCPF(formattedCpf)) {
        setCpfError('CPF inválido. Verifique os dígitos.');
      } else {
        setCpfError(null);
      }
    } else {
      setCpfError(null);
    }
  };

  const handleCpfBlur = () => {
    if (cpf.length > 0 && cpf.length < 14) {
      setCpfError('Formato incorreto. Use 000.000.000-00.');
    }
  };
  
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    setDob(newDob);
    if (newDob && new Date(newDob) > new Date()) {
      setDobError('A data de nascimento não pode ser no futuro.');
    } else {
      setDobError(null);
    }
  };

  const isFormValid = useMemo(() => {
    return nickname.trim() !== '' &&
           !nicknameError &&
           isEmailValid(email) &&
           validateCPF(cpf) &&
           dob !== '' &&
           !dobError;
  }, [nickname, nicknameError, email, cpf, dob, dobError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit({ nickname, email, cpf: cpf.replace(/\D/g, ''), dob });
    }
  };

  const handleLoginCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCpf = formatCPF(e.target.value);
    setLoginCpf(formattedCpf);
    if (formattedCpf.length === 14 && !validateCPF(formattedCpf)) {
      setLoginCpfError('CPF inválido.');
    } else {
      setLoginCpfError(null);
    }
  };
  
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCPF(loginCpf)) {
      onLogin(loginCpf.replace(/\D/g, ''));
    } else {
      setLoginCpfError('Por favor, insira um CPF válido no formato 000.000.000-00.');
    }
  };
  
  const inputClasses = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition bg-gray-700 text-white placeholder-gray-400 ${
      hasError
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-600 focus:ring-secondary'
    }`;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-secondary mb-6">Identificação</h2>
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-textSecondary mb-1">Apelido</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            className={inputClasses(!!nicknameError)}
            placeholder="Como você quer ser chamado no ranking"
            required
            aria-invalid={!!nicknameError}
            aria-describedby="nickname-error"
          />
          {nicknameError && <p id="nickname-error" className="text-red-600 text-sm mt-1">{nicknameError}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={inputClasses(!!emailError)}
            placeholder="seu@email.com"
            required
            aria-invalid={!!emailError}
            aria-describedby="email-error"
          />
          {emailError && <p id="email-error" className="text-red-600 text-sm mt-1">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-textSecondary mb-1">CPF</label>
          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={handleCpfChange}
            onBlur={handleCpfBlur}
            className={inputClasses(!!cpfError)}
            placeholder="000.000.000-00"
            required
            aria-invalid={!!cpfError}
            aria-describedby="cpf-error"
          />
          {cpfError && <p id="cpf-error" className="text-red-600 text-sm mt-1">{cpfError}</p>}
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-textSecondary mb-1">Data de Nascimento</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={handleDobChange}
            className={inputClasses(!!dobError)}
            required
            aria-invalid={!!dobError}
            aria-describedby="dob-error"
            max={new Date().toISOString().split("T")[0]} // Prevent future dates
          />
          {dobError && <p id="dob-error" className="text-red-600 text-sm mt-1">{dobError}</p>}
        </div>
        
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Iniciar Preenchimento
        </button>
      </form>

      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold text-secondary mb-4">Já preencheu o gabarito?</h3>
        <p className="text-textSecondary mb-4">Acesse seu resultado e o ranking aqui.</p>
        <form onSubmit={handleLoginSubmit} className="max-w-sm mx-auto flex flex-col items-center gap-4 sm:flex-row">
            <div className="w-full">
                <label htmlFor="login-cpf" className="sr-only">CPF</label>
                <input
                    id="login-cpf"
                    type="text"
                    value={loginCpf}
                    onChange={handleLoginCpfChange}
                    className={inputClasses(!!loginCpfError)}
                    placeholder="Digite seu CPF para acessar"
                    required
                />
                {loginCpfError && <p className="text-red-600 text-sm mt-1">{loginCpfError}</p>}
            </div>
            <button
                type="submit"
                disabled={!validateCPF(loginCpf)}
                className="w-full sm:w-auto flex-shrink-0 bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Acessar
            </button>
        </form>
      </div>
    </div>
  );
};

export default IdentificationForm;