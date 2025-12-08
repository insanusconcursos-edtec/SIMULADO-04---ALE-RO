import React, { useState } from 'react';

const EmbedCode: React.FC = () => {
    const [copied, setCopied] = useState(false);
    
    // In a real application, this would be the actual URL.
    const embedUrl = window.location.href;
    const embedCode = `<iframe src="${embedUrl}" style="width: 100%; height: 700px; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" title="Formulário de Gabarito"></iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-lg font-semibold text-secondary mb-2">Incorpore este formulário em seu site</h3>
            <p className="text-sm text-textSecondary mb-4">Copie e cole este código no HTML da sua página para exibir o formulário.</p>
            <div className="relative bg-gray-100 rounded-md p-4 font-mono text-sm text-gray-800">
                <pre className="overflow-x-auto"><code>{embedCode}</code></pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 bg-primary text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-secondary transition-colors"
                >
                    {copied ? 'Copiado!' : 'Copiar'}
                </button>
            </div>
        </div>
    );
}

export default EmbedCode;