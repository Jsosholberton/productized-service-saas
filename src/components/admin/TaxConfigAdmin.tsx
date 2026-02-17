'use client';

import { useState } from 'react';
import { getActiveTaxConfig, listAvailableTaxRegimes } from '@/lib/config/tax-config';

/**
 * Admin panel for managing tax regime configuration
 * Only accessible to admin users
 */
export function TaxConfigAdmin() {
  const [, setActiveRegime] = useState<string>('PERSONA_NATURAL');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nit: '',
    rut: '',
    dianResolution: '',
    resolutionExpiry: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentConfig = getActiveTaxConfig();
  const allRegimes = listAvailableTaxRegimes();

  const handleRegimeSwitch = async (newRegime: string) => {
    try {
      // Aqui normalmente harías una llamada a API
      // await switchTaxRegime(newRegime);
      setActiveRegime(newRegime);
      setSuccessMessage(`Régimen cambiado a ${newRegime}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error al cambiar régimen');
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aqui normalmente harías una llamada a API
      // await updateTaxConfig(formData);
      setSuccessMessage('Configuración actualizada');
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error al actualizar configuración');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración Tributaria</h1>
        <p className="text-gray-600 mt-2">
          Administra régimen tributario, impuestos y obligaciones ante DIAN
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✓ {successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">✗ {errorMessage}</p>
        </div>
      )}

      {/* Current Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Régimen Actual</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Régimen</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {currentConfig.regime === 'PERSONA_NATURAL' ? '💼 Persona Natural' : '🏢 Empresa'}
            </p>
            <p className="text-sm text-gray-500 mt-2">{currentConfig.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Estado de Impuestos</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">IVA</span>
                <span className="font-mono font-semibold">{(currentConfig.charges.ivaRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Retefuente</span>
                <span className="font-mono font-semibold">{
                  (currentConfig.charges.reteFuenteRate * 100).toFixed(0)
                }%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Details */}
        {currentConfig.regime === 'PERSONA_JURIDICA' && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Información Legal</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">NIT</p>
                <p className="font-mono mt-1">900123456-7</p>
              </div>
              <div>
                <p className="text-gray-600">RUT</p>
                <p className="font-mono mt-1">RUT-2024-001234</p>
              </div>
              <div>
                <p className="text-gray-600">Resolución DIAN</p>
                <p className="font-mono mt-1">{currentConfig.invoicing.resolutionNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Vencimiento</p>
                <p className="font-mono mt-1">2026-02-17</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Regimes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Régimenes Disponibles</h2>

        <div className="space-y-3">
          {allRegimes.map((regime) => (
            <div
              key={regime.regime}
              className={`p-4 rounded-lg border-2 transition ${
                regime.isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{regime.regime}</h3>
                    {regime.isActive && (
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-200 text-blue-900 rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{regime.description}</p>
                </div>

                {!regime.isActive && (
                  <button
                    onClick={() => handleRegimeSwitch(regime.regime)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            Cambiar de régimen afectará cómo se calculan los precios para nuevos proyectos
          </p>
          <p className="text-xs text-yellow-800 mt-2">
            Los presupuestos existentes no serán afectados. Consulta con contador antes de hacer cambios.
          </p>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Actualizar Información Legal
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showForm ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleUpdateConfig} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                NIT
              </label>
              <input
                type="text"
                placeholder="900123456-7"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                RUT
              </label>
              <input
                type="text"
                placeholder="RUT-2024-001234"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Resolución DIAN
              </label>
              <input
                type="text"
                placeholder="DIAN-RES-2024-00123456"
                value={formData.dianResolution}
                onChange={(e) => setFormData({ ...formData, dianResolution: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.resolutionExpiry}
                onChange={(e) => setFormData({ ...formData, resolutionExpiry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Guardar Cambios
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">NIT</p>
              <p className="font-mono mt-1 text-gray-900">900123456-7</p>
            </div>
            <div>
              <p className="text-gray-600">RUT</p>
              <p className="font-mono mt-1 text-gray-900">RUT-2024-001234</p>
            </div>
            <div>
              <p className="text-gray-600">Resolución DIAN</p>
              <p className="font-mono mt-1 text-gray-900">{currentConfig.invoicing.resolutionNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Vencimiento</p>
              <p className="font-mono mt-1 text-gray-900">2026-02-17</p>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial Reciente</h2>

        <div className="space-y-3">
          {[
            {
              date: '2026-02-17 14:30',
              action: 'Régimen cambiado a PERSONA_JURIDICA',
              user: 'jonatan@ejemplo.com',
              type: 'regime_change',
            },
            {
              date: '2026-02-15 10:15',
              action: 'NIT y RUT actualizados',
              user: 'jonatan@ejemplo.com',
              type: 'config_update',
            },
            {
              date: '2026-01-20 09:00',
              action: 'Sistema inicializado con PERSONA_NATURAL',
              user: 'system',
              type: 'system',
            },
          ].map((log, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="text-xs text-gray-500 font-mono">{log.date}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.action}</p>
                <p className="text-xs text-gray-500">por {log.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
