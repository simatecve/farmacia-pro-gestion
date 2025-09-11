-- Crear tabla para configuraciones de seguridad del sistema
CREATE TABLE IF NOT EXISTS system_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  encrypted BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_system_security_settings_key ON system_security_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_security_settings_created_at ON system_security_settings(created_at);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_system_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_system_security_settings_updated_at
  BEFORE UPDATE ON system_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_security_settings_updated_at();

-- Insertar configuración inicial para el PIN de la gaveta de dinero
INSERT INTO system_security_settings (setting_key, setting_value, encrypted, description)
VALUES (
  'cash_drawer_pin',
  NULL,
  true,
  'PIN de seguridad para abrir la gaveta de dinero'
) ON CONFLICT (setting_key) DO NOTHING;

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE system_security_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Users can read system security settings" ON system_security_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Users can insert system security settings" ON system_security_settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Users can update system security settings" ON system_security_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados (opcional)
CREATE POLICY "Users can delete system security settings" ON system_security_settings
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Comentarios para documentar la tabla
COMMENT ON TABLE system_security_settings IS 'Tabla para almacenar configuraciones de seguridad del sistema';
COMMENT ON COLUMN system_security_settings.id IS 'Identificador único de la configuración';
COMMENT ON COLUMN system_security_settings.setting_key IS 'Clave única de la configuración';
COMMENT ON COLUMN system_security_settings.setting_value IS 'Valor de la configuración (puede estar encriptado)';
COMMENT ON COLUMN system_security_settings.encrypted IS 'Indica si el valor está encriptado';
COMMENT ON COLUMN system_security_settings.description IS 'Descripción de la configuración';
COMMENT ON COLUMN system_security_settings.created_at IS 'Fecha y hora de creación';
COMMENT ON COLUMN system_security_settings.updated_at IS 'Fecha y hora de última actualización';
COMMENT ON COLUMN system_security_settings.created_by IS 'Usuario que creó la configuración';
COMMENT ON COLUMN system_security_settings.updated_by IS 'Usuario que actualizó la configuración por última vez';