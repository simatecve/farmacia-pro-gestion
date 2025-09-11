-- Función para que el admin pueda crear usuarios completos
CREATE OR REPLACE FUNCTION create_user_by_admin(
  user_email TEXT,
  user_password TEXT,
  full_name TEXT,
  user_roles TEXT[] DEFAULT ARRAY['viewer']
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el usuario actual es admin
  SELECT get_current_user_role() INTO current_user_role;
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear usuarios';
  END IF;

  -- Validar email
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'El email es requerido';
  END IF;

  -- Validar contraseña
  IF user_password IS NULL OR LENGTH(user_password) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres';
  END IF;

  -- Crear usuario en auth.users usando la extensión auth
  BEGIN
    -- Insertar en auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', full_name),
      false,
      'authenticated'
    ) RETURNING id INTO new_user_id;

    -- Crear perfil
    INSERT INTO profiles (id, full_name, email)
    VALUES (new_user_id, full_name, user_email);

    -- Asignar roles
    INSERT INTO user_roles (user_id, role)
    SELECT new_user_id, unnest(user_roles);

    result := json_build_object(
      'success', true,
      'user_id', new_user_id,
      'message', 'Usuario creado exitosamente'
    );

  EXCEPTION WHEN OTHERS THEN
    -- Si hay error, intentar crear solo el perfil (usuario ya existe en auth)
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
    
    IF new_user_id IS NOT NULL THEN
      -- Actualizar o crear perfil
      INSERT INTO profiles (id, full_name, email)
      VALUES (new_user_id, full_name, user_email)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

      -- Limpiar roles existentes y asignar nuevos
      DELETE FROM user_roles WHERE user_id = new_user_id;
      INSERT INTO user_roles (user_id, role)
      SELECT new_user_id, unnest(user_roles);

      result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'message', 'Usuario actualizado exitosamente'
      );
    ELSE
      RAISE EXCEPTION 'Error al crear usuario: %', SQLERRM;
    END IF;
  END;

  RETURN result;
END;
$$;

-- Función simplificada para crear usuarios (sin contraseña, solo perfil)
CREATE OR REPLACE FUNCTION create_user_profile_by_admin(
  user_email TEXT,
  full_name TEXT,
  user_roles TEXT[] DEFAULT ARRAY['viewer']
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  target_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el usuario actual es admin
  SELECT get_current_user_role() INTO current_user_role;
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear usuarios';
  END IF;

  -- Validar email
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'El email es requerido';
  END IF;

  -- Buscar si el usuario ya existe en auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    -- Generar un ID temporal para el perfil
    target_user_id := gen_random_uuid();
  END IF;

  -- Crear o actualizar perfil
  INSERT INTO profiles (id, full_name, email)
  VALUES (target_user_id, full_name, user_email)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  -- Limpiar roles existentes y asignar nuevos
  DELETE FROM user_roles WHERE user_id = target_user_id;
  INSERT INTO user_roles (user_id, role)
  SELECT target_user_id, unnest(user_roles);

  result := json_build_object(
    'success', true,
    'user_id', target_user_id,
    'message', 'Perfil de usuario creado exitosamente. El usuario podrá registrarse con este email.',
    'requires_signup', target_user_id NOT IN (SELECT id FROM auth.users)
  );

  RETURN result;
END;
$$;