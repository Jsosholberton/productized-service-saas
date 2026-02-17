# 🚀 Setup Completo: Agencia de Servicios Producto

## Tabla de Contenidos

1. [Instalación Local](#instalación-local)
2. [Configurar Servicios Externos](#configurar-servicios-externos)
3. [Base de Datos](#base-de-datos)
4. [Ejecución en Desarrollo](#ejecución-en-desarrollo)
5. [Deploy a Producción](#deploy-a-producción)
6. [Testing](#testing)

---

## Instalación Local

### Requisitos Previos

- **Node.js** 18.17+ (preferible 20 LTS)
- **Git**
- **npm** o **yarn** (incluido con Node.js)
- **PostgreSQL** 14+ (local o cloud: Neon/Supabase)
- **Cuentas en** (gratis):
  - Clerk (auth)
  - OpenAI (API key)
  - Wompi (pagos)
  - Resend (emails)

### Paso 1: Clonar Repositorio

```bash
git clone https://github.com/Jsosholberton/productized-service-saas.git
cd productized-service-saas
```

### Paso 2: Instalar Dependencias

```bash
npm install
# o con yarn
yarn install
```

### Paso 3: Copiar Variables de Entorno

```bash
cp .env.example .env.local
```

Ahora edita `.env.local` (ver siguiente sección).

---

## Configurar Servicios Externos

### 1. 🔐 Clerk (Autenticación)

#### Crear Aplicación

1. Ve a [dashboard.clerk.com](https://dashboard.clerk.com)
2. Haz clic en **"Create Organization"**
3. Elige un nombre (ej: "Agencia-Dev")
4. Selecciona **Next.js** como framework

#### Obtener Keys

1. En el dashboard, ve a **"API Keys"**
2. Copia:
   - `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret Key` → `CLERK_SECRET_KEY`

#### Configurar Prod URLs

1. Ve a **"Deployment Settings"**
2. Set:
   - **Development URL**: `http://localhost:3000`
   - **Production URL**: `https://tudominio.com`
3. Haz clic en **"Primary Production Instance"** si tienes instancia de prod

#### Agregar a `.env.local`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. 🤖 OpenAI (Motor IA)

#### Obtener API Key

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Haz clic en tu avatar → **"API keys"**
3. Haz clic en **"Create new secret key"**
4. Copia y pega en `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

#### Verificar Acceso a GPT-4o

```bash
# En terminal
curl https://api.openai.com/v1/models/gpt-4o \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Organization: org-..."
```

Deberías recibir metadata del modelo (no error 404).

### 3. 💳 Wompi (Pagos)

#### Crear Cuenta

1. Ve a [wompi.co](https://wompi.co)
2. Haz clic en **"Ingresa aquí"** (crear cuenta)
3. Completa el formulario con:
   - Email
   - Contraseña
   - Número de cédula/RUT
   - Razón social

#### Obtener Keys

1. Login en tu cuenta
2. Ve a tu avatar → **"Mi cuenta"**
3. Baja a la sección **"Integración"**
4. Copia:
   - **Public Key** → `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`
   - **Private Key** → `WOMPI_PRIVATE_KEY`
   - **Integrity Key** → `WOMPI_INTEGRITY_KEY`

```env
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_...
WOMPI_PRIVATE_KEY=prv_...
WOMPI_INTEGRITY_KEY=integrity_...
```

#### Configurar Webhook

1. En la misma sección, busca **"Notifica via Webhook"**
2. Pega la URL:
   - **Dev**: `http://localhost:3000/api/webhooks/wompi` (usa ngrok si es necesario)
   - **Prod**: `https://tudominio.com/api/webhooks/wompi`
3. Haz clic en **"Guardar"**

### 4. 📧 Resend (Emails)

#### Crear Cuenta

1. Ve a [resend.com](https://resend.com)
2. Haz clic en **"Get Started"**
3. Usa GitHub para login (más rápido)

#### Obtener API Key

1. En dashboard, ve a **"API Keys"**
2. Haz clic en **"Create API Key"**
3. Selecciona **Production**
4. Copia en `.env.local`:

```env
RESEND_API_KEY=re_...
```

#### Verificar Dominio (Producción)

1. Ve a **"Domains"**
2. Agrega tu dominio (ej: `mail.agencia.co`)
3. Sigue las instrucciones DNS
4. Espera a que se verifique (5-10 min)

### 5. 🗄️ PostgreSQL (Base de Datos)

#### Opción A: Local (PostgreSQL)

```bash
# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Descarga el instalador: https://www.postgresql.org/download/windows/
```

Crea base de datos:

```bash
psql -U postgres
CREATE DATABASE productized_service;
\q
```

#### Opción B: Cloud (Recomendado)

**Neon** (Serverless PostgreSQL)

1. Ve a [neon.tech](https://neon.tech)
2. Haz clic en **"Sign up"** (GitHub)
3. Crea un proyecto
4. Copia la **Connection String**:

```env
DATABASE_URL="postgresql://user:password@host:5432/db"
```

**Supabase** (PostgreSQL + API)

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. En **"Settings"** → **"Database"**, copia URL:

```env
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
```

---

## Base de Datos

### Crear Schema (Migraciones)

```bash
# Aplicar migraciones y generar Prisma Client
npx prisma migrate dev --name init
```

Esto:
- Ejecutará migrations en `prisma/migrations/`
- Creará las tablas en PostgreSQL
- Generará `@prisma/client`

### Ver Base de Datos (Opcional)

```bash
# Abrir Prisma Studio (UI visual)
npx prisma studio
```

Accede a `http://localhost:5555`

### Seed Base de Datos (Opcional)

Crea usuario admin de test:

```bash
node prisma/seed.js
```

(El archivo `prisma/seed.js` debe crear usuarios de test)

---

## Ejecución en Desarrollo

### Iniciar Servidor

```bash
npm run dev
```

Deberás ver:

```
> productized-service-saas@1.0.0 dev
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
```

Abre [http://localhost:3000](http://localhost:3000)

### Testing de Flujos

#### 1. Landing Page
- Visita `http://localhost:3000`
- Verifica que se cargen los componentes (hero, "cómo funciona", CTA)
- Haz clic en "Registrarse"

#### 2. Signup con Clerk
- Crea cuenta con email (test@example.com) y contraseña
- Verifica que redirige a `/dashboard`

#### 3. Cotizador IA
- En dashboard, haz clic en **"Ir al cotizador"**
- Describe un proyecto:
  ```
  Quiero un app de tareas con autenticación de usuarios, lista de tareas, 
  notificaciones por email y dashboard de estadísticas
  ```
- Haz clic en **"Obtener cotización instantánea"**
- Espera a que OpenAI genere features (~3-5 segundos)

#### 4. Scope Lock
- Verifica que se muestren las features generadas
- Marca todos los checkboxes
- Acepta el término legal
- Haz clic en **"Confirmar scope y proceder al pago"**

#### 5. Checkout
- Ve el resumen del proyecto
- Puedes "Agregar Maintenance Plan" si quieres testear upselling
- Haz clic en **"Proceder al pago"** (redirige a Wompi)

#### 6. Test de Pago (Wompi)

Usa credenciales de test:

```
Cédula: 1234567890
Teléfono: 3005551234
Email: test@example.com
```

En el checkout de Wompi:
- Elige PSE
- Haz clic en **"Continuar al pago"**
- Verifica que redirige a `/payment/success` (o `/payment/failure`)

#### 7. Webhook de Wompi

Para testear el webhook localmente:

```bash
# Terminal 1: Ejecutar dev server
npm run dev

# Terminal 2: Iniciar ngrok
ngrok http 3000

# Terminal 3: Test webhook manual
curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -H "X-Wompi-Signature: test-sig" \
  -d '{
    "event": "transaction.updated",
    "data": {
      "transaction": {
        "id": "test-123",
        "reference": "PRJ-...",
        "amount_in_cents": 190000,
        "status": "APPROVED"
      }
    }
  }'
```

Verifica en Prisma Studio que `Transaction.wompiStatus = APPROVED`

---

## Deploy a Producción

### Opción 1: Vercel (Recomendado)

#### 1. Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"New Project"**
3. Importa este repositorio de GitHub
4. Vercel detectará Next.js automáticamente

#### 2. Configurar Environment Variables

1. En el formulario de deployment, ve a **"Environment Variables"**
2. Agrega todas las variables de `.env.local` (excepto `NEXT_PUBLIC_APP_URL`)
3. Para cada una:
   - Key: (nombre de variable)
   - Value: (valor)
4. Haz clic en **"Deploy"**

#### 3. Configurar NEXT_PUBLIC_APP_URL

Después del deploy:

1. Ve a **"Settings"** → **"Environment Variables"**
2. Agrega:
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: Tu URL de Vercel (ej: `https://agencia-saas.vercel.app`)
3. Haz clic en **"Save"**
4. Ve a **"Deployments"** → redeploy el último commit

#### 4. Configurar Dominio Custom

1. Ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio (ej: `agencia.co`)
3. Sigue las instrucciones DNS de Vercel
4. Espera propagación DNS (5-48 horas)

#### 5. Actualizar URLs en Servicios Externos

**Clerk:**
- Dashboard → **"Deployment Settings"**
- Production URL: `https://tudominio.com`

**Wompi:**
- Mi Cuenta → **"Webhook"**
- URL: `https://tudominio.com/api/webhooks/wompi`

**Resend:**
- Domains → Verifica tu dominio
- Usa dominio verificado en templates

### Opción 2: Self-Hosted (VPS)

#### 1. Preparar Servidor

```bash
# SSH a tu servidor
ssh root@IP_SERVIDOR

# Actualizar sistema
apt-get update && apt-get upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt-get install -y nginx
```

#### 2. Clonar y Setup

```bash
cd /var/www
git clone https://github.com/Jsosholberton/productized-service-saas.git
cd productized-service-saas

# Instalar dependencias
npm install --omit=dev

# Crear .env
cp .env.example .env
# Edita .env con valores de producción
```

#### 3. Compilar Aplicación

```bash
npm run build
```

#### 4. Iniciar con PM2

```bash
pm2 start npm --name "agencia-saas" -- start
pm2 save
pm2 startup
```

#### 5. Configurar Nginx (Reverse Proxy)

```bash
# Crear archivo de config
sudo nano /etc/nginx/sites-available/agencia-saas
```

Agrega:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Guarda (Ctrl+X → Y → Enter)

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/agencia-saas /etc/nginx/sites-enabled/

# Probar config
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 6. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Auto-renew
sudo systemctl enable certbot.timer
```

---

## Testing

### Unit Tests (TypeScript)

```bash
# Crear archivo de test
npm install --save-dev jest @types/jest ts-jest

# Crear jest.config.js
# (Ver documentación de Jest)
```

### E2E Tests (Playwright)

```bash
npm install --save-dev @playwright/test

# Crear tests en e2e/
# Ejecutar
npx playwright test
```

### Test Manual de Flujo Completo

1. ✅ Crear cuenta
2. ✅ Ir a cotizador
3. ✅ Describir proyecto
4. ✅ Revisar features generadas
5. ✅ Confirmar scope
6. ✅ Ver resumen de pago
7. ✅ Pagar con Wompi (test)
8. ✅ Recibir webhook
9. ✅ Ver proyecto en cola en admin
10. ✅ Admin sube entrega (.zip + video)
11. ✅ Cliente recibe email con descarga

---

## ✨ ¡Listo!

Tu plataforma SaaS está lista. Comienza a vender servicios productizados.

Para preguntas o soporte, abre un issue en el repositorio.
