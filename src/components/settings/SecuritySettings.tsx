import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';
import { useSystemSecurity } from '@/hooks/useSystemSecurity';
import { useToast } from '@/hooks/use-toast';

export function SecuritySettings() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasExistingPin, setHasExistingPin] = useState(false);

  const { 
    getCashDrawerPin, 
    setCashDrawerPin, 
    validateCashDrawerPin 
  } = useSystemSecurity();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const existingPin = await getCashDrawerPin();
      setHasExistingPin(!!existingPin);
    } catch (error) {
      console.error('Error checking existing PIN:', error);
    }
  };

  const validateForm = () => {
    setError('');

    if (hasExistingPin && !currentPin) {
      setError('Ingrese el PIN actual');
      return false;
    }

    if (hasExistingPin && !validateCashDrawerPin(currentPin)) {
      setError('PIN actual incorrecto');
      return false;
    }

    if (!newPin) {
      setError('Ingrese el nuevo PIN');
      return false;
    }

    if (newPin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return false;
    }

    if (!/^\d+$/.test(newPin)) {
      setError('El PIN solo puede contener números');
      return false;
    }

    if (newPin !== confirmPin) {
      setError('Los PINs no coinciden');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await setCashDrawerPin(newPin);
      
      toast({
        title: 'PIN actualizado',
        description: 'El PIN de seguridad para la gaveta de dinero ha sido actualizado correctamente',
      });

      // Limpiar formulario
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setHasExistingPin(true);
    } catch (error) {
      console.error('Error saving PIN:', error);
      setError('Error al guardar el PIN. Intente nuevamente.');
      
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el PIN de seguridad',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuración de Seguridad
          </CardTitle>
          <CardDescription>
            Configure el PIN de seguridad para abrir la gaveta de dinero
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIN de Gaveta de Dinero */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <h3 className="text-lg font-medium">PIN de Gaveta de Dinero</h3>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {hasExistingPin 
                ? 'Configure un nuevo PIN para abrir la gaveta de dinero. Necesitará el PIN actual para realizar cambios.'
                : 'Configure un PIN de seguridad para abrir la gaveta de dinero. Este PIN será requerido cada vez que se intente abrir la gaveta.'
              }
            </div>

            <div className="grid gap-4 max-w-md">
              {hasExistingPin && (
                <div className="space-y-2">
                  <Label htmlFor="current-pin">PIN Actual</Label>
                  <div className="relative">
                    <Input
                      id="current-pin"
                      type={showCurrentPin ? 'text' : 'password'}
                      placeholder="Ingrese PIN actual"
                      value={currentPin}
                      onChange={(e) => {
                        setCurrentPin(e.target.value);
                        setError('');
                      }}
                      disabled={isLoading}
                      maxLength={10}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      disabled={isLoading}
                    >
                      {showCurrentPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-pin">Nuevo PIN</Label>
                <div className="relative">
                  <Input
                    id="new-pin"
                    type={showNewPin ? 'text' : 'password'}
                    placeholder="Ingrese nuevo PIN (ej: 1234)"
                    value={newPin}
                    onChange={(e) => {
                      setNewPin(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPin(!showNewPin)}
                    disabled={isLoading}
                  >
                    {showNewPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pin">Confirmar PIN</Label>
                <div className="relative">
                  <Input
                    id="confirm-pin"
                    type={showConfirmPin ? 'text' : 'password'}
                    placeholder="Confirme el nuevo PIN"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    disabled={isLoading}
                  >
                    {showConfirmPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={isLoading || !newPin || !confirmPin}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar PIN'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Información de Seguridad */}
          <div className="space-y-2">
            <h4 className="font-medium">Información de Seguridad</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• El PIN debe tener al menos 4 dígitos</p>
              <p>• Solo se permiten números (0-9)</p>
              <p>• Se recomienda usar un PIN que no sea fácil de adivinar</p>
              <p>• El PIN será requerido cada vez que se intente abrir la gaveta</p>
              <p>• Mantenga el PIN en un lugar seguro</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}