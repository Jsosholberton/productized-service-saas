import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ChevronRight, Zap } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      projects: {
        include: { features: true, transaction: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return (
      <div className="container py-8">
        <p className="text-slate-600">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Bienvenido, {user.email ? user.email.split('@')[0] : 'Usuario'}</p>
        </div>

        {/* New Quotation CTA */}
        <div className="mb-12 p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
          <h2 className="text-2xl font-bold mb-2">Solicitar nueva cotización</h2>
          <p className="mb-4 text-blue-100">
            Describe tu proyecto y obtén un precio instantáneo impulsado por IA
          </p>
          <Link href="/quotation">
            <button className="btn btn-primary bg-white text-blue-600 hover:bg-blue-50">
              Ir al cotizador <Zap className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Tus Proyectos</h2>

          {user.projects.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-600 mb-4">Aún no tienes proyectos</p>
              <Link href="/quotation">
                <button className="btn btn-primary">
                  Crear tu primer proyecto
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <div className="card card-hover group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`badge text-xs ${
                        project.status === 'PAID'
                          ? 'badge-success'
                          : project.status === 'IN_DEVELOPMENT'
                            ? 'badge-warning'
                            : project.status === 'DELIVERED'
                              ? 'badge-success'
                              : 'badge-primary'
                      }`}>
                        {project.status === 'PENDING' && 'Pendiente pago'}
                        {project.status === 'PAID' && 'En cola'}
                        {project.status === 'IN_DEVELOPMENT' && 'En desarrollo'}
                        {project.status === 'DELIVERED' && 'Entregado'}
                        {project.status === 'REVIEW' && 'En revisión'}
                        {project.status === 'CANCELLED' && 'Cancelado'}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        ${project.basePrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      {project.features.length} features • ~{project.features.reduce((sum, f) => sum + f.estimatedHours, 0)}h
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
