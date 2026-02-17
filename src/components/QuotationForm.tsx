'use client';

import { useState } from 'react';
import { generateQuotation } from '@/actions/quotation';
import { Loader2, AlertCircle } from 'lucide-react';

interface QuotationFormProps {
  onSuccess: (projectId: string) => void;
}

export function QuotationForm({ onSuccess }: QuotationFormProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!description.trim()) {
        throw new Error('Por favor describe tu proyecto');
      }

      const result = await generateQuotation({
        description,
        clientName: 'Cliente', // Obtenido de Clerk
        clientEmail: 'client@example.com', // Obtenido de Clerk
      });

      onSuccess(result.projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la cotización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Describe tu proyecto
        </label>
        <textarea
          className="textarea text-base placeholder:text-slate-400"
          placeholder="Ej: Necesito un app de tareas con autenticación, lista de tareas, notificaciones por email..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          disabled={loading}
        />
        <p className="text-xs text-slate-500 mt-2">
          Cuanto más detallado, mejor la cotización
        </p>
      </div>

      {error && (
        <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="btn btn-primary w-full py-3 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando cotización...
          </>
        ) : (
          'Obtener cotización instantánea'
        )}
      </button>
    </form>
  );
}
