'use client';

import { formatPrice } from '@/lib/wompi/pricing';
import { getActiveTaxConfig } from '@/lib/config/tax-config';

interface TaxBreakdownProps {
  basePrice: number; // in cents
  lineItems: Array<{
    label: string;
    amount: number;
    percentage?: number;
  }>;
  totalPrice: number; // in cents
  taxRegime: string;
  showDetails?: boolean;
}

/**
 * Display tax breakdown in a clear, transparent way
 * Helps clients understand exactly what they're paying
 */
export function TaxBreakdown({
  basePrice,
  lineItems,
  totalPrice,
  taxRegime,
  showDetails = true,
}: TaxBreakdownProps) {
  const config = getActiveTaxConfig();

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Desglose de Precio</h3>
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          {config.regime === 'PERSONA_NATURAL'
            ? '💼 Persona Natural'
            : '🏢 Persona Jurídica'}
        </span>
      </div>

      {/* Line Items */}
      <div className="space-y-3 border-b border-gray-300 pb-4">
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">{item.label}</span>
              {item.percentage !== undefined && (
                <span className="text-xs text-gray-500">({item.percentage}%)</span>
              )}
            </div>
            <span
              className={`font-medium ${
                item.amount < 0 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {item.amount < 0 ? '- ' : '+ '}
              {formatPrice(Math.abs(item.amount))}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
        <span className="text-lg font-bold text-gray-900">Total a Pagar</span>
        <span className="text-2xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
      </div>

      {/* Information Box */}
      {showDetails && config.regime === 'PERSONA_NATURAL' && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm">
          <p className="text-green-900 font-medium flex items-center gap-2">
            <span className="text-lg">✓</span>
            Sin IVA ni impuestos adicionales
          </p>
          <p className="text-green-800 text-xs mt-1">
            Como persona natural, el precio mostrado es el que pagarás. No hay impuestos
            adicionales.
          </p>
        </div>
      )}

      {showDetails && config.regime === 'PERSONA_JURIDICA' && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">
          <p className="text-blue-900 font-medium flex items-center gap-2">
            <span className="text-lg">i</span>
            Desglose de impuestos
          </p>
          <ul className="text-blue-800 text-xs mt-2 space-y-1 list-disc list-inside">
            <li>
              <strong>IVA (19%):</strong> Impuesto al Valor Agregado
            </li>
            <li>
              <strong>Retefuente (3%):</strong> Retención en la Fuente (retenido por el
              comprador)
            </li>
            <li>
              <strong>Total final:</strong> Subtotal + IVA - Retefuente
            </li>
          </ul>
        </div>
      )}

      {/* Legal Notice */}
      <div className="mt-4 rounded-lg bg-gray-100 p-3 text-xs text-gray-700">
        <p className="font-semibold mb-1">Nota fiscal:</p>
        <p>
          {config.regime === 'PERSONA_NATURAL'
            ? 'Se emitirá factura simplificada con Cédula de Ciudadanía. No se generará secuencial ante DIAN.'
            : 'Se emitirá factura electrónica conforme a regulaciones DIAN con numeración secuencial.
          Los impuestos serná reportados en declaraciones mensuales.'}
        </p>
      </div>
    </div>
  );
}

/**
 * Minimal version for displaying in lists/tables
 */
export function TaxBreakdownBadge({ taxRegime, total }: { taxRegime: string; total: number }) {
  const config = getActiveTaxConfig();

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-600">
        {config.regime === 'PERSONA_NATURAL' ? '✓ Sin impuestos' : '* Con impuestos'}
      </span>
      <span className="font-bold text-gray-900">{formatPrice(total)}</span>
    </div>
  );
}
