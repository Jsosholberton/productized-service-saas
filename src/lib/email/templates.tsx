import React from 'react';

interface DeliveryEmailProps {
  clientName: string;
  projectTitle: string;
  downloadLink: string;
  videoLink: string;
  invoiceLink?: string;
}

/**
 * Email sent to client when project is delivered
 */
export function DeliveryEmailTemplate({
  clientName,
  projectTitle,
  downloadLink,
  videoLink,
  invoiceLink,
}: DeliveryEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <h1>¡Tu proyecto está listo! 🎉</h1>
        <p>Hola {clientName},</p>
        <p>
          Nos complace informarte que tu proyecto <strong>"{projectTitle}"</strong> ha
          sido completado y está listo para descargar.
        </p>

        <h2>📦 Descarga tu proyecto:</h2>
        <p>
          <a
            href={downloadLink}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            Descargar archivo
          </a>
        </p>

        <h2>🎥 Video explicativo:</h2>
        <p>
          Hemos preparado un video walkthrough de tu proyecto:
        </p>
        <p>
          <a
            href={videoLink}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            Ver video
          </a>
        </p>

        {invoiceLink && (
          <>
            <h2>📄 Factura:</h2>
            <p>
              <a href={invoiceLink} style={{ color: '#007bff' }}>
                Descargar factura
              </a>
            </p>
          </>
        )}

        <h2>📋 Pasos siguientes:</h2>
        <ol>
          <li>Descarga los archivos del proyecto</li>
          <li>Revisa el video explicativo para entender el funcionamiento</li>
          <li>Si contrataste mantenimiento, no te preocupes por actualizaciones 🛠️</li>
          <li>Contactanos si necesitas ayuda</li>
        </ol>

        <p>
          Gracias por confiar en nosotros. Si tienes alguna pregunta, no dudes
          en contactarnos.
        </p>

        <hr style={{ borderColor: '#ddd' }} />
        <p style={{ fontSize: '12px', color: '#666' }}>
          © 2024 Agencia de Servicios Producto. Todos los derechos reservados.
        </p>
      </body>
    </html>
  );
}

interface AdminNotificationProps {
  projectTitle: string;
  clientName: string;
  totalPrice: number;
  features: Array<{ name: string; estimatedHours: number }>;
  blueprintLink: string;
}

/**
 * Email sent to admin when payment is received
 */
export function AdminNotificationTemplate({
  projectTitle,
  clientName,
  totalPrice,
  features,
  blueprintLink,
}: AdminNotificationProps) {
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <h1>✅ Nuevo proyecto pagado</h1>
        <p>
          Un cliente ha completado el pago y un nuevo proyecto está listo para comenzar.
        </p>

        <h2>📊 Detalles del proyecto:</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              <strong>Cliente:</strong>
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              {clientName}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              <strong>Proyecto:</strong>
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              {projectTitle}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              <strong>Monto:</strong>
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              ${(totalPrice / 100).toFixed(2)} COP
            </td>
          </tr>
        </table>

        <h2>🎯 Features a desarrollar:</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature.name}>
              {feature.name} (~{feature.estimatedHours}h)
            </li>
          ))}
        </ul>

        <h2>📋 Plano técnico:</h2>
        <p>
          <a href={blueprintLink} style={{ color: '#007bff' }}>
            Ver/descargar especificaciones técnicas
          </a>
        </p>

        <hr style={{ borderColor: '#ddd' }} />
        <p style={{ fontSize: '12px', color: '#666' }}>
          Accede al dashboard para más detalles y comenzar el desarrollo.
        </p>
      </body>
    </html>
  );
}

interface PaymentConfirmationProps {
  clientName: string;
  projectTitle: string;
  totalAmount: number;
  reference: string;
  estimatedDelivery: string;
}

/**
 * Email sent to client after successful payment
 */
export function PaymentConfirmationTemplate({
  clientName,
  projectTitle,
  totalAmount,
  reference,
  estimatedDelivery,
}: PaymentConfirmationProps) {
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <h1>💳 Pago confirmado</h1>
        <p>Hola {clientName},</p>
        <p>
          Confirmamos que hemos recibido tu pago correctamente. Tu proyecto
          <strong>"{projectTitle}"</strong> comienza ahora a ser desarrollado.
        </p>

        <h2>📝 Detalles de la transacción:</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              <strong>Monto:</strong>
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              ${(totalAmount / 100).toFixed(2)} COP
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              <strong>Referencia:</strong>
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              {reference}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              <strong>Entrega estimada:</strong>
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              {estimatedDelivery}
            </td>
          </tr>
        </table>

        <h2>✨ ¿Qué sigue?</h2>
        <ol>
          <li>Nuestro equipo de desarrollo comenzará a trabajar en tu proyecto</li>
          <li>Recibirás actualizaciones periódicas del progreso</li>
          <li>Tu proyecto será entregado en la fecha estimada</li>
          <li>Podrás descargarlo junto con un video explicativo</li>
        </ol>

        <p>
          Si tienes preguntas durante el desarrollo, contáctanos sin dudarlo.
        </p>

        <hr style={{ borderColor: '#ddd' }} />
        <p style={{ fontSize: '12px', color: '#666' }}>
          © 2024 Agencia de Servicios Producto. Todos los derechos reservados.
        </p>
      </body>
    </html>
  );
}
