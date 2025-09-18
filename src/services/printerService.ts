// Servicio para control de impresoras y gavetas de dinero
export interface PrintJob {
  id: string;
  content: string;
  deviceId?: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  timestamp: number;
}

export interface CashDrawerEvent {
  deviceId?: string;
  action: 'open' | 'close';
  timestamp: number;
  success: boolean;
}

class PrinterService {
  private printQueue: PrintJob[] = [];
  private listeners: Array<(event: PrintJob | CashDrawerEvent) => void> = [];

  // Imprimir ticket/recibo
  async printReceipt(content: string, deviceId?: string): Promise<boolean> {
    const job: PrintJob = {
      id: `print_${Date.now()}`,
      content,
      deviceId,
      status: 'pending',
      timestamp: Date.now()
    };

    this.printQueue.push(job);
    this.notifyListeners(job);

    try {
      job.status = 'printing';
      this.notifyListeners(job);

      // Intentar imprimir usando diferentes métodos
      const success = await this.executePrint(content, deviceId);
      
      job.status = success ? 'completed' : 'failed';
      this.notifyListeners(job);

      return success;
    } catch (error) {
      console.error('Error al imprimir:', error);
      job.status = 'failed';
      this.notifyListeners(job);
      return false;
    }
  }

  // Ejecutar impresión
  private async executePrint(content: string, deviceId?: string): Promise<boolean> {
    try {
      // Método 1: Usar Web USB (si está disponible y hay dispositivo configurado)
      if (deviceId && 'usb' in navigator) {
        const success = await this.printViaUSB(content, deviceId);
        if (success) return true;
      }

      // Método 2: Usar window.print() con formato personalizado
      return await this.printViaBrowser(content);
    } catch (error) {
      console.error('Error ejecutando impresión:', error);
      return false;
    }
  }

  // Imprimir vía USB (requiere permiso de dispositivo)
  private async printViaUSB(content: string, deviceId: string): Promise<boolean> {
    try {
      // Esta implementación requiere conocer los comandos específicos de la impresora
      // Por ahora retornamos false para usar el método del navegador
      console.log('Intentando imprimir vía USB:', deviceId);
      return false;
    } catch (error) {
      console.error('Error imprimiendo vía USB:', error);
      return false;
    }
  }

  // Imprimir vía navegador
  private async printViaBrowser(content: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Crear ventana de impresión oculta
        const printWindow = window.open('', '_blank', 'width=1,height=1,left=-1000,top=-1000');
        if (!printWindow) {
          resolve(false);
          return;
        }

        // Crear contenido HTML para impresión
        const printContent = this.formatForPrint(content);
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                @page { margin: 0; size: auto; }
                @media print {
                  body { 
                    margin: 0; 
                    padding: 5px; 
                    font-family: 'Courier New', 'Consolas', monospace; 
                    font-size: 11px; 
                    line-height: 1.2;
                    color: #000;
                    background: #fff;
                  }
                  .ticket-width-58 { width: 58mm; max-width: 58mm; }
                  .ticket-width-80 { width: 80mm; max-width: 80mm; }
                  .ticket-width-112 { width: 112mm; max-width: 112mm; }
                  .center { text-align: center; }
                  .right { text-align: right; }
                  .bold { font-weight: bold; }
                  .line { 
                    border-bottom: 1px dashed #000; 
                    margin: 3px 0; 
                    height: 0;
                  }
                  img { 
                    max-width: 100%; 
                    height: auto; 
                    display: block; 
                    margin: 0 auto;
                  }
                }
                body { 
                  margin: 0; 
                  padding: 5px; 
                  font-family: 'Courier New', 'Consolas', monospace; 
                  font-size: 11px; 
                  line-height: 1.2;
                  color: #000;
                  background: #fff;
                }
                .ticket-width-58 { width: 58mm; max-width: 58mm; }
                .ticket-width-80 { width: 80mm; max-width: 80mm; }
                .ticket-width-112 { width: 112mm; max-width: 112mm; }
                .center { text-align: center; }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .line { 
                  border-bottom: 1px dashed #000; 
                  margin: 3px 0; 
                  height: 0;
                }
                img { 
                  max-width: 100%; 
                  height: auto; 
                  display: block; 
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);

        printWindow.document.close();
        
        // Esperar a que cargue y luego imprimir automáticamente
        printWindow.onload = () => {
          setTimeout(() => {
            // Imprimir directamente sin mostrar el diálogo
            printWindow.print();
            // Cerrar la ventana después de un breve delay
            setTimeout(() => {
              printWindow.close();
            }, 1000);
            resolve(true);
          }, 100);
        };
      } catch (error) {
        console.error('Error creando ventana de impresión:', error);
        resolve(false);
      }
    });
  }

  // Formatear contenido para impresión
  private formatForPrint(content: string): string {
    try {
      const data = JSON.parse(content);
      const paperWidth = data.paperWidth || 80;
      const includeImage = data.includeLogo;
      
      let html = `<div class="ticket-width-${paperWidth}">`;

      // Logo de empresa si está habilitado
      if (includeImage) {
        html += `
          <div class="center">
            <img src="/src/assets/logo-talpharma.png.png" alt="Logo" style="max-width: 120px; height: auto; margin-bottom: 8px;" />
          </div>
        `;
      }

      html += `
          <div class="center bold">${data.companyName || 'DAALEF FARMA'}</div>
          <div class="center bold">www.daalef.com</div>
          <div class="center">RUC: ${data.companyRuc || ''}</div>
          <div class="center">Dirección: ${data.address || ''}</div>
          <div class="center">Teléfono: ${data.phone || ''}</div>
          <div class="center">Email: ${data.email || ''}</div>
          <div class="line"></div>
          <div class="center bold">FACTURA DE VENTA</div>
          <div class="center">N°: ${data.ticketNumber || ''}</div>
          <div class="line"></div>
          <div>Fecha y Hora: ${data.date || new Date().toLocaleString()}</div>
          <div>Cajero: ${data.cashier || ''}</div>
          <div>Cliente: ${data.client || 'CONSUMIDOR FINAL'}</div>
      `;

      // Información adicional del cliente si existe
      if (data.clientId) {
        html += `<div>Cédula: ${data.clientId}</div>`;
      }
      if (data.clientPhone) {
        html += `<div>Teléfono: ${data.clientPhone}</div>`;
      }
      if (data.clientAddress) {
        html += `<div>Dirección: ${data.clientAddress}</div>`;
      }

      html += `<div class="line"></div>`;
      
      // Productos
      if (data.items && Array.isArray(data.items)) {
        html += `
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; font-weight: bold; margin: 8px 0; padding: 4px; background: #f0f0f0;">
            <div>CANT</div>
            <div>PRODUCTO</div>
            <div style="text-align: right;">PRECIO</div>
            <div style="text-align: right;">TOTAL</div>
          </div>
        `;
        
        data.items.forEach((item: any) => {
          const name = (item.name || '').substring(0, 15);
          const qty = item.quantity || 0;
          const price = item.price || 0;
          const total = item.total || 0;
          
          html += `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; margin: 2px 0; padding: 2px; border-bottom: 1px solid #eee;">
              <div style="font-weight: bold;">${qty}</div>
              <div style="font-size: 10px;">${name}</div>
              <div style="text-align: right;">$${price.toFixed(2)}</div>
              <div style="text-align: right; font-weight: bold;">$${total.toFixed(2)}</div>
            </div>
          `;
        });
      }

      html += `
          <div class="line"></div>
          <div style="padding: 8px; background: #f9f9f9; margin: 4px 0;">
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>Subtotal sin IVA:</span>
              <span>$${(data.subtotal || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>IVA (15%):</span>
              <span>$${(data.tax || 0).toFixed(2)}</span>
            </div>
      `;

      if (data.discount > 0) {
        html += `
              <div style="display: flex; justify-content: space-between; color: green; margin: 2px 0;">
                <span>Descuento:</span>
                <span>-$${data.discount.toFixed(2)}</span>
              </div>
        `;
      }

      html += `
            <div class="line"></div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
              <span>TOTAL:</span>
              <span>$${(data.total || 0).toFixed(2)}</span>
            </div>
          </div>
          <div class="line"></div>
          <div style="padding: 8px; background: #e3f2fd; margin: 4px 0;">
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span style="font-weight: bold;">Forma de Pago:</span>
              <span style="font-weight: bold;">${data.paymentMethod || ''}</span>
            </div>
      `;

      if (data.paymentMethod === 'EFECTIVO') {
        html += `
              <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                <span style="font-weight: bold;">Efectivo Recibido:</span>
                <span style="font-weight: bold;">$${(data.cashReceived || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                <span style="font-weight: bold;">Cambio:</span>
                <span style="font-weight: bold; color: green;">$${(data.change || 0).toFixed(2)}</span>
              </div>
        `;
      }

      html += `
          </div>
          <div class="line"></div>
          <div class="center">
            <div style="font-size: 14px; font-weight: bold; color: green; margin: 8px 0;">
              ¡Gracias por su compra!
            </div>
            <div style="font-size: 12px; margin: 4px 0;">Vuelva pronto</div>
            
            <div style="margin: 12px 0; padding: 8px; background: #1976d2; color: white;">
              <div style="font-weight: bold; font-size: 14px;">DAALEF FARMA</div>
              <div style="font-size: 12px;">www.daalef.com</div>
            </div>
            
            <div style="font-size: 10px; color: #666; margin-top: 8px;">
      `;

      if (data.footerText) {
        html += data.footerText.replace(/\n/g, '<br>');
      } else {
        html += `
              Su comprobante electrónico ha sido generado correctamente.<br>
              Recuerde también puede consultar su comprobante en el portal del SRI.<br><br>
              Sistema de Gestión Farmacéutica<br>
              © 2024 - Todos los derechos reservados
        `;
      }

      html += `
            </div>
          </div>
        </div>
      `;

      return html;
    } catch (error) {
      // Si no es JSON válido, retornar como texto plano
      return `<pre>${content}</pre>`;
    }
  }

  // Abrir gaveta de dinero
  async openCashDrawer(deviceId?: string): Promise<boolean> {
    const event: CashDrawerEvent = {
      deviceId,
      action: 'open',
      timestamp: Date.now(),
      success: false
    };

    try {
      // Método 1: Comando a través de impresora (común en POS)
      if (deviceId) {
        const success = await this.sendCashDrawerCommand(deviceId);
        event.success = success;
        this.notifyListeners(event);
        return success;
      }

      // Método 2: Comando genérico (ESC/POS)
      const success = await this.sendGenericCashDrawerCommand();
      event.success = success;
      this.notifyListeners(event);
      return success;
    } catch (error) {
      console.error('Error abriendo gaveta:', error);
      this.notifyListeners(event);
      return false;
    }
  }

  // Enviar comando específico de gaveta
  private async sendCashDrawerCommand(deviceId: string): Promise<boolean> {
    try {
      // Comandos ESC/POS para abrir gaveta
      // const command = new Uint8Array([27, 112, 0, 25, 250]); // ESC p 0 25 250
      console.log('Enviando comando de gaveta a dispositivo:', deviceId);
      return false; // Por ahora retornamos false hasta implementar USB
    } catch (error) {
      console.error('Error enviando comando de gaveta:', error);
      return false;
    }
  }

  // Enviar comando genérico de gaveta
  private async sendGenericCashDrawerCommand(): Promise<boolean> {
    try {
      // Intentar imprimir comando de gaveta como "impresión"
      await this.printViaBrowser('\x1B\x70\x00\x19\xFA'); // Comando ESC/POS
      return true;
    } catch (error) {
      console.error('Error enviando comando genérico de gaveta:', error);
      return false;
    }
  }

  // Suscribirse a eventos
  subscribe(listener: (event: PrintJob | CashDrawerEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar listeners
  private notifyListeners(event: PrintJob | CashDrawerEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  // Obtener cola de impresión
  getPrintQueue(): PrintJob[] {
    return [...this.printQueue];
  }

  // Limpiar cola de impresión
  clearPrintQueue() {
    this.printQueue = [];
  }
}

// Instancia singleton del servicio
export const printerService = new PrinterService();