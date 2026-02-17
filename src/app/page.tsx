import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowRight, Zap, Lock, Rocket } from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">Agencia Productizada</span>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Link href="/dashboard" className="btn btn-primary">
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-outline">Iniciar sesión</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary">Registrarse</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container pt-32 pb-20 text-center">
        <div className="max-w-2xl mx-auto fade-in">
          <h1 className="text-heading-1 text-white mb-6 leading-tight">
            Software personalizado en
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}minutos
            </span>
          </h1>
          <p className="text-body-large text-slate-300 mb-8">
            Describe tu idea, recibe una cotización instantánea impulsada por IA, y
            comienza el desarrollo. Sin sorpresas, sin cambios de alcance.
          </p>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="btn btn-primary px-8 py-3 text-lg">
                Obtener cotización <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
            <button className="btn btn-outline px-8 py-3 text-lg text-white border-slate-600 hover:bg-slate-800">
              Ver demo
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-20 border-t border-slate-700">
        <h2 className="text-heading-2 text-white mb-16 text-center">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 mb-4">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Describe tu idea</h3>
            <p className="text-slate-400">
              Cuéntanos qué deseas construir en lenguaje natural. Nuestro formulario es simple e
              intuitivo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-500 mb-4">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Cotización instantánea</h3>
            <p className="text-slate-400">
              Nuestro motor de IA analiza tu proyecto, desglos en features y genera un precio justo
              en segundos.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500 mb-4">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Paga y recibe</h3>
            <p className="text-slate-400">
              Confirma el scope, paga vía Wompi y entra a la cola de desarrollo. Tu proyecto
              inicia pronto.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 border-t border-slate-700">
        <h2 className="text-heading-2 text-white mb-16 text-center">Por qué elegirnos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <Lock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Scope Lock Garantizado</h3>
              <p className="text-slate-400">
                Confirmas exactamente qué se incluye antes de pagar. El diseño recibe 1 revisión
                incluida.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Rocket className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Entrega rápida</h3>
              <p className="text-slate-400">
                Proyectos productizados con timeline predecible. Recibirás un video walkthrough
                explicativo.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Mantenimiento incluido</h3>
              <p className="text-slate-400">
                Añade un plan mensual: hosting, correcciones y 1 cambio menor incluidos.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Lock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparencia total</h3>
              <p className="text-slate-400">
                Precios desglosados, impuestos claros (IVA/Retefuente). Sin sorpresas al final.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 border-t border-slate-700 text-center">
        <h2 className="text-heading-2 text-white mb-4">Listo para comenzar?</h2>
        <p className="text-body-large text-slate-300 mb-8">
          Obtén tu cotización gratuita en menos de 2 minutos.
        </p>
        <SignUpButton mode="modal">
          <button className="btn btn-primary px-8 py-3 text-lg">
            Solicitar cotización <ArrowRight className="w-5 h-5" />
          </button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="container text-center text-slate-500 text-sm">
          <p>© 2026 Agencia Productizada. Todos los derechos reservados. | Cali, Colombia</p>
        </div>
      </footer>
    </main>
  );
}
