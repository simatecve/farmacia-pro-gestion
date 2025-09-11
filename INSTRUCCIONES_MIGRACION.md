# Instrucciones para Migración de Base de Datos

## Configuración de la Tabla de Seguridad del Sistema

Para completar la implementación del sistema de apertura de gaveta de dinero, necesitas ejecutar la migración SQL en tu base de datos de Supabase.

### Pasos a seguir:

1. **Accede al Panel de Supabase**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Inicia sesión con tu cuenta
   - Selecciona tu proyecto: `zdyalryknksszfdjhdta`

2. **Ejecutar la Migración SQL**
   - Ve a la sección **SQL Editor** en el panel lateral
   - Crea una nueva consulta
   - Copia y pega el contenido del archivo: `supabase/migrations/20241217000000_create_system_security_settings.sql`
   - Ejecuta la consulta

3. **Verificar la Instalación**
   - Ve a **Table Editor**
   - Verifica que la tabla `system_security_settings` se haya creado correctamente
   - La tabla debe tener las siguientes columnas:
     - `id` (UUID, Primary Key)
     - `setting_key` (VARCHAR)
     - `setting_value` (TEXT)
     - `encrypted` (BOOLEAN)
     - `description` (TEXT)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)
     - `created_by` (UUID)
     - `updated_by` (UUID)

### Funcionalidades Implementadas:

✅ **Hook useSystemSecurity** - Manejo de configuraciones de seguridad
✅ **Componente CashDrawerButton** - Botón con validación de PIN
✅ **Configuración de Seguridad** - Panel para configurar el PIN en Configuración > Seguridad
✅ **Integración en Dashboard** - Botón disponible en las acciones rápidas
✅ **Lógica de Impresión** - Comandos ESC/POS para abrir gaveta
✅ **Migración SQL** - Script para crear la tabla en la base de datos

### Uso del Sistema:

1. **Configurar PIN**:
   - Ve a **Configuración > Seguridad**
   - Establece un PIN de 4 dígitos (ej: 1234)
   - Guarda la configuración

2. **Abrir Gaveta**:
   - En el Dashboard, haz clic en **"Abrir Caja"**
   - Ingresa el PIN configurado
   - El sistema enviará el comando a la impresora para abrir la gaveta

### Notas Técnicas:

- El sistema soporta impresoras USB, de red y por navegador
- Utiliza comandos ESC/POS estándar (0x1B 0x70 0x00 0x19 0x19)
- El PIN se almacena de forma segura en la base de datos
- Incluye políticas RLS (Row Level Security) para proteger los datos

### Solución de Problemas:

- **Error de impresora no encontrada**: Verifica la configuración en Dispositivos
- **PIN incorrecto**: Asegúrate de haber configurado el PIN en Seguridad
- **Gaveta no abre**: Verifica que la impresora soporte comandos de apertura de gaveta

---

**¡La implementación está completa!** Una vez ejecutada la migración SQL, el sistema estará listo para usar.