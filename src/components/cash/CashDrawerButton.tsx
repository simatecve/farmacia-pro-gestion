import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, DollarSign, Printer } from 'lucide-react';
import { useSystemSecurity } from '@/hooks/useSystemSecurity';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';

interface CashDrawerButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function CashDrawerButton({ 
  variant = 'outline', 
  size = 'default', 
  className = '',
  showText = true 
}: CashDrawerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState('');
  
  const { validateCashDrawerPin } = useSystemSecurity();
  const { deviceSettings } = useSettings();
  const { toast } = useToast();

  // Función para enviar comando de apertura a la impresora
  const sendCashDrawerCommand = async () => {
    try {
      // Buscar impresora configurada
      const printer = deviceSettings.find(device => 
        device.device_type === 'printer' && device.active
      );

      if (!printer) {
        throw new Error('No hay impresora configurada para abrir la gaveta');
      }

      // Comando ESC/POS para abrir gaveta de dinero
      // ESC p m t1 t2 (0x1B 0x70 0x00 0x19 0x19)
      const openDrawerCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0x19]);
      
      // Si es una impresora USB, intentar enviar comando directo
      if (printer.connection_type === 'usb') {
        // Para impresoras USB, necesitamos usar la Web USB API
        if ('usb' in navigator) {
          try {
            const devices = await navigator.usb.getDevices();
            const usbPrinter = devices.find(device => 
              device.vendorId === printer.connection_config?.vendorId &&
              device.productId === printer.connection_config?.productId
            );

            if (usbPrinter) {
              await usbPrinter.open();
              await usbPrinter.selectConfiguration(1);
              await usbPrinter.claimInterface(0);
              await usbPrinter.transferOut(1, openDrawerCommand);
              await usbPrinter.close();
            } else {
              throw new Error('Impresora USB no encontrada');
            }
          } catch (usbError) {
            console.error('Error USB:', usbError);
            // Fallback: intentar imprimir comando a través del navegador
            await printDrawerCommand();
          }
        } else {
          // Fallback para navegadores sin soporte USB
          await printDrawerCommand();
        }
      } else if (printer.connection_type === 'network') {
        // Para impresoras de red, enviar comando via fetch
        const printerIP = printer.connection_config?.ip;
        if (printerIP) {
          await fetch(`http://${printerIP}:9100`, {
            method: 'POST',
            body: openDrawerCommand,
            headers: {
              'Content-Type': 'application/octet-stream'
            }
          });
        } else {
          throw new Error('IP de impresora no configurada');
        }
      } else {
        // Para otros tipos de conexión, usar método de impresión
        await printDrawerCommand();
      }

      return true;
    } catch (error) {
      console.error('Error opening cash drawer:', error);
      throw error;
    }
  };

  // Método alternativo: imprimir comando a través del navegador
  const printDrawerCommand = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Crear un elemento invisible para imprimir
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          reject(new Error('No se pudo abrir ventana de impresión'));
          return;
        }

        printWindow.document.write(`
          <html>
            <head>
              <title>Abrir Gaveta</title>
              <style>
                body { margin: 0; padding: 0; }
                .drawer-command { 
                  font-family: monospace; 
                  font-size: 1px; 
                  color: transparent;
                }
              </style>
            </head>
            <body>
              <div class="drawer-command">\x1B\x70\x00\x19\x19</div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 1000);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Resolver después de un breve delay
        setTimeout(() => resolve(), 2000);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleOpenDrawer = async () => {
    if (!pin) {
      setError('Ingrese el PIN de seguridad');
      return;
    }

    if (!validateCashDrawerPin(pin)) {
      setError('PIN incorrecto');
      return;
    }

    setIsOpening(true);
    setError('');

    try {
      await sendCashDrawerCommand();
      
      toast({
        title: 'Gaveta abierta',
        description: 'La gaveta de dinero se ha abierto correctamente',
      });
      
      setIsOpen(false);
      setPin('');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al abrir la gaveta');
      
      toast({
        title: 'Error',
        description: 'No se pudo abrir la gaveta de dinero',
        variant: 'destructive',
      });
    } finally {
      setIsOpening(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPin('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`flex items-center gap-2 ${className}`}
        >
          <DollarSign className="h-4 w-4" />
          {showText && 'Abrir Caja'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Abrir Gaveta de Dinero
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Ingrese el PIN de seguridad para abrir la gaveta de dinero.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pin">PIN de Seguridad</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Ingrese PIN (ej: 1234)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOpenDrawer();
                }
              }}
              disabled={isOpening}
              maxLength={10}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isOpening}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleOpenDrawer}
              disabled={isOpening || !pin}
              className="flex items-center gap-2"
            >
              {isOpening ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Abriendo...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Abrir Gaveta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}