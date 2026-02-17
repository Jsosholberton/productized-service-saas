import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowRight, Zap, Lock, Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function LandingPage() {
  const { userId } = await auth();
  const t = useTranslations('landing');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">{t('nav.title')}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {userId ? (
              <>
                <Link href="/dashboard" className="btn btn-primary">
                  {t('nav.dashboard')}
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-outline">{t('nav.signin')}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary">{t('nav.signup')}</button>
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
            {t('hero.title')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}{t('hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-body-large text-slate-300 mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="btn btn-primary px-8 py-3 text-lg">
                {t('hero.cta')} <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
            <button className="btn btn-outline px-8 py-3 text-lg text-white border-slate-600 hover:bg-slate-800">
              {t('hero.demo')}
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-20 border-t border-slate-700">
        <h2 className="text-heading-2 text-white mb-16 text-center">{t('howItWorks.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 mb-4">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{t('howItWorks.step1.title')}</h3>
            <p className="text-slate-400">
              {t('howItWorks.step1.description')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-500 mb-4">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{t('howItWorks.step2.title')}</h3>
            <p className="text-slate-400">
              {t('howItWorks.step2.description')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500 mb-4">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{t('howItWorks.step3.title')}</h3>
            <p className="text-slate-400">
              {t('howItWorks.step3.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 border-t border-slate-700">
        <h2 className="text-heading-2 text-white mb-16 text-center">{t('features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <Lock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('features.scopeLock.title')}</h3>
              <p className="text-slate-400">
                {t('features.scopeLock.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Rocket className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('features.fastDelivery.title')}</h3>
              <p className="text-slate-400">
                {t('features.fastDelivery.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('features.maintenance.title')}</h3>
              <p className="text-slate-400">
                {t('features.maintenance.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Lock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('features.transparency.title')}</h3>
              <p className="text-slate-400">
                {t('features.transparency.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 border-t border-slate-700 text-center">
        <h2 className="text-heading-2 text-white mb-4">{t('cta.title')}</h2>
        <p className="text-body-large text-slate-300 mb-8">
          {t('cta.subtitle')}
        </p>
        <SignUpButton mode="modal">
          <button className="btn btn-primary px-8 py-3 text-lg">
            {t('cta.button')} <ArrowRight className="w-5 h-5" />
          </button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="container text-center text-slate-500 text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </main>
  );
}
