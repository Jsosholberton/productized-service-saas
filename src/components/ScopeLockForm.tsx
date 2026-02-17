'use client';

import { useState } from 'react';
import { confirmFeature, confirmScopeLock } from '@/actions/quotation';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Feature } from '@prisma/client';

interface ScopeLockFormProps {
  projectId: string;
  features: Feature[];
  basePrice: number;
  estimatedHours: number;
  onSuccess: () => void;
}

export function ScopeLockForm({
  projectId,
  features,
  basePrice,
  estimatedHours,
  onSuccess,
}: ScopeLockFormProps) {
  const [confirmedFeatures, setConfirmedFeatures] = useState<Set<string>>(new Set());
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allFeaturesConfirmed = confirmedFeatures.size === features.length;

  const handleFeatureToggle = async (featureId: string) => {
    try {
      await confirmFeature(featureId);
      setConfirmedFeatures((prev) => {
        const next = new Set(prev);
        if (next.has(featureId)) {
          next.delete(featureId);
        } else {
          next.add(featureId);
        }
        return next;
      });
    } catch (err) {
      setError('Error confirmando feature');
    }
  };

  const handleConfirmScope = async () => {
    setLoading(true);
    setError('');

    try {
      if (!allFeaturesConfirmed) {
        throw new Error('Por favor confirma todas las features');
      }
      if (!legalAccepted) {
        throw new Error('Debes aceptar los términos legales');
      }

      await confirmScopeLock(projectId);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Features List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Features del proyecto</h3>
        <p className="text-sm text-slate-600">
          Por favor confirma cada feature. Esto es lo que se incluirá en la entrega.
        </p>

        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <input
                type="checkbox"
                id={feature.id}
                className="checkbox mt-1"
                checked={confirmedFeatures.has(feature.id)}
                onChange={() => handleFeatureToggle(feature.id)}
              />
              <div className="flex-1">
                <label htmlFor={feature.id} className="block font-medium text-slate-900 cursor-pointer">
                  {feature.name}
                </label>
                <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-slate-500">~{feature.estimatedHours}h</span>
                </div>
              </div>
              {confirmedFeatures.has(feature.id) && (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 mb-2">
          <span className="font-semibold">Total estimado:</span> ${basePrice.toLocaleString()} USD
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Horas estimadas:</span> ~{estimatedHours}h
        </p>
        <p className="text-xs text-slate-600 mt-2">
          *Impuestos (IVA 19% + Retefuente) se añadirán al momento del pago
        </p>
      </div>

      {/* Legal Checkbox */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <input
            type="checkbox"
            id="legal"
            className="checkbox mt-1"
            checked={legalAccepted}
            onChange={(e) => setLegalAccepted(e.target.checked)}
          />
          <div>
            <label htmlFor="legal" className="text-sm text-slate-900 cursor-pointer font-medium">
              He leído y acepto los términos de scope lock
            </label>
            <p className="text-xs text-slate-600 mt-1">
              Entiendo que este proyecto incluye <strong>1 revisión de diseño</strong>. Cambios futuros
              requerirán una suscripción de mantenimiento. No hay reembolsos después de confirmar el
              pago.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleConfirmScope}
        disabled={!allFeaturesConfirmed || !legalAccepted || loading}
        className="btn btn-primary w-full py-3 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirmar scope...
          </>
        ) : (
          'Confirmar scope y proceder al pago'
        )}
      </button>
    </div>
  );
}
