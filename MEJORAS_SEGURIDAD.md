# Análisis de Seguridad y Mejores Prácticas

## 🔒 Problemas de Seguridad Identificados

### 1. **CRÍTICO: Claves API Expuestas en el Código**

#### Problema:
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://zdyalryknksszfdjhdta.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

#### Riesgo:
- Las claves están hardcodeadas en el código fuente
- Cualquier persona con acceso al código puede ver las credenciales
- Riesgo de exposición en repositorios públicos

#### Solución Inmediata:
```typescript
// .env.local
VITE_SUPABASE_URL=https://zdyalryknksszfdjhdta.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}
```

### 2. **Validación de Entrada Insuficiente**

#### Problema:
- No hay validación de entrada en formularios
- Campos numéricos pueden recibir valores negativos
- Falta sanitización de datos de usuario

#### Solución:
```typescript
// Implementar Zod para validación
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255),
  price: z.number().positive('Precio debe ser positivo'),
  barcode: z.string().regex(/^[0-9]+$/, 'Código de barras inválido').optional(),
  email: z.string().email('Email inválido').optional()
});

// En componentes
const validateProduct = (data: unknown) => {
  try {
    return ProductSchema.parse(data);
  } catch (error) {
    throw new Error('Datos inválidos');
  }
};
```

### 3. **Manejo Inseguro de Errores**

#### Problema:
```typescript
// Expone información sensible
catch (error) {
  console.error('Error:', error); // Logs completos en producción
  toast({ description: error.message }); // Muestra errores internos al usuario
}
```

#### Solución:
```typescript
// Manejo seguro de errores
const handleError = (error: unknown, userMessage: string) => {
  // Log detallado solo en desarrollo
  if (import.meta.env.DEV) {
    console.error('Detailed error:', error);
  }
  
  // Log básico para producción
  console.error('Error occurred:', userMessage);
  
  // Mensaje genérico al usuario
  toast({
    title: 'Error',
    description: userMessage,
    variant: 'destructive'
  });
};
```

### 4. **Falta de Rate Limiting**

#### Problema:
- No hay límites en las consultas a la API
- Posible abuso de endpoints
- Riesgo de ataques de fuerza bruta

#### Solución:
```typescript
// Implementar debouncing y throttling
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (term: string) => {
  await searchProducts(term);
}, 300);

// Rate limiting en Supabase (configurar en dashboard)
// O implementar en middleware personalizado
```

## 🛡️ Mejoras de Seguridad Recomendadas

### 1. **Implementar Content Security Policy (CSP)**

```html
<!-- En index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://zdyalryknksszfdjhdta.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://zdyalryknksszfdjhdta.supabase.co;
  font-src 'self';
">
```

### 2. **Configurar Headers de Seguridad**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
});
```

### 3. **Mejorar Autenticación**

```typescript
// Implementar 2FA
const enable2FA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
  });
  
  if (error) throw error;
  return data;
};

// Timeout de sesión
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

const checkSessionTimeout = () => {
  const lastActivity = localStorage.getItem('lastActivity');
  if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
    supabase.auth.signOut();
  }
};
```

### 4. **Sanitización de Datos**

```typescript
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

const sanitizeNumericInput = (input: string): number => {
  const num = parseFloat(input.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : Math.max(0, num);
};
```

## 🔐 Mejoras en Row Level Security (RLS)

### Problema Actual:
```sql
-- Muy permisivo
CREATE POLICY "Products are viewable by authenticated users" 
ON public.products FOR SELECT 
USING (auth.uid() IS NOT NULL);
```

### Mejora Recomendada:
```sql
-- Basado en roles específicos
CREATE POLICY "Products are viewable by authorized users" 
ON public.products FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'cashier')
  )
);

-- Políticas más restrictivas para operaciones críticas
CREATE POLICY "Products are deletable by admin only" 
ON public.products FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));
```

## 📊 Auditoría y Monitoreo

### 1. **Logging de Seguridad**

```typescript
const securityLogger = {
  logFailedLogin: (email: string, ip: string) => {
    console.warn(`Failed login attempt: ${email} from ${ip}`);
    // Enviar a servicio de monitoreo
  },
  
  logSensitiveAction: (action: string, userId: string) => {
    console.info(`Sensitive action: ${action} by user ${userId}`);
    // Registrar en audit_logs
  }
};
```

### 2. **Detección de Anomalías**

```typescript
const detectAnomalies = {
  checkUnusualActivity: (userId: string, action: string) => {
    // Verificar patrones inusuales
    const recentActions = getRecentActions(userId);
    if (recentActions.length > 100) { // Threshold
      alertSecurity(`Unusual activity detected for user ${userId}`);
    }
  }
};
```

## 🔧 Configuración de Producción

### 1. **Variables de Entorno Seguras**

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=production
VITE_ENABLE_LOGGING=false
```

### 2. **Build Seguro**

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  build: {
    sourcemap: false, // No exponer source maps en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.logs
        drop_debugger: true
      }
    }
  }
});
```

## 🚨 Plan de Acción Inmediato

### Prioridad CRÍTICA (Implementar AHORA):
1. ✅ Mover claves API a variables de entorno
2. ✅ Implementar validación de entrada con Zod
3. ✅ Configurar manejo seguro de errores
4. ✅ Agregar headers de seguridad

### Prioridad ALTA (1-2 semanas):
1. ✅ Implementar CSP
2. ✅ Mejorar políticas RLS
3. ✅ Agregar logging de seguridad
4. ✅ Implementar rate limiting

### Prioridad MEDIA (2-4 semanas):
1. ✅ Configurar 2FA
2. ✅ Implementar detección de anomalías
3. ✅ Auditoría completa de permisos
4. ✅ Configuración de monitoreo

## 📋 Checklist de Seguridad

- [ ] Variables de entorno configuradas
- [ ] Validación de entrada implementada
- [ ] Headers de seguridad configurados
- [ ] CSP implementado
- [ ] RLS policies revisadas
- [ ] Logging de seguridad activo
- [ ] Rate limiting configurado
- [ ] Manejo de errores seguro
- [ ] Build de producción optimizado
- [ ] Monitoreo de seguridad activo

## 🔍 Herramientas de Seguridad Recomendadas

1. **OWASP ZAP** - Análisis de vulnerabilidades
2. **Snyk** - Análisis de dependencias
3. **ESLint Security Plugin** - Análisis estático
4. **Helmet.js** - Headers de seguridad
5. **Rate Limiter Flexible** - Control de tasa

---

**⚠️ IMPORTANTE**: Estas mejoras de seguridad son críticas para un sistema de farmacia que maneja datos sensibles de clientes y transacciones financieras. Se recomienda implementar las mejoras de prioridad CRÍTICA inmediatamente.