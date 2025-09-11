import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, ExternalLink, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserInviteInstructionsProps {
  onClose?: () => void;
}

export function UserInviteInstructions({ onClose }: UserInviteInstructionsProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <CardTitle>Invitación de Usuarios</CardTitle>
        </div>
        <CardDescription>
          Instrucciones para invitar nuevos usuarios al sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Proceso de Invitación</AlertTitle>
          <AlertDescription>
            Debido a las políticas de seguridad, la invitación de usuarios debe realizarse 
            a través del panel de administración de Supabase Auth.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pasos para invitar un usuario:
          </h4>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Accede al panel de administración de Supabase
              <Badge variant="outline" className="ml-2">Admin</Badge>
            </li>
            <li>
              Ve a la sección <strong>Authentication → Users</strong>
            </li>
            <li>
              Haz clic en <strong>"Invite a user"</strong>
            </li>
            <li>
              Ingresa el email del usuario que deseas invitar
            </li>
            <li>
              El usuario recibirá un email de invitación
            </li>
            <li>
              Una vez que el usuario se registre, podrás asignarle roles desde esta sección
            </li>
          </ol>
        </div>

        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Asignación de Roles</AlertTitle>
          <AlertDescription>
            Después de que el usuario se registre, aparecerá automáticamente en la lista 
            de usuarios con el rol "Visualizador" por defecto. Podrás editar sus roles 
            desde el botón de edición.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir Panel de Supabase
          </Button>
          
          {onClose && (
            <Button onClick={onClose}>
              Entendido
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}