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
        // Crear ventana de impresión
        const printWindow = window.open('', '_blank', 'width=300,height=600');
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
              <title>Ticket</title>
              <style>
                @media print {
                  body { margin: 0; font-family: 'Courier New', monospace; font-size: 12px; }
                  .ticket { width: 80mm; }
                  .center { text-align: center; }
                  .right { text-align: right; }
                  .bold { font-weight: bold; }
                  .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                }
                body { font-family: 'Courier New', monospace; font-size: 12px; }
                .ticket { width: 300px; margin: 0 auto; }
                .center { text-align: center; }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .line { border-bottom: 1px dashed #000; margin: 5px 0; }
              </style>
            </head>
            <body>
              <div class="ticket">
                ${printContent}
              </div>
            </body>
          </html>
        `);

        printWindow.document.close();
        
        // Esperar a que cargue y luego imprimir
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
            resolve(true);
          }, 500);
        };
      } catch (error) {
        console.error('Error creando ventana de impresión:', error);
        resolve(false);
      }
    });
  }

  // Formatear contenido para impresión
  private formatForPrint(content: string): string {
    // Convertir contenido JSON a HTML formateado
    try {
      const data = JSON.parse(content);
      
      let html = `
        <div class="center bold">${data.companyName || 'FARMACIA PRO'}</div>
        <div class="center">${data.address || ''}</div>
        <div class="center">${data.phone || ''}</div>
        <div class="line"></div>
        <div>Fecha: ${new Date().toLocaleString()}</div>
        <div>Ticket: ${data.ticketNumber || ''}</div>
        <div class="line"></div>
      `;

      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any) => {
          html += `
            <div style="display: flex; justify-content: space-between;">
              <span>${item.name}</span>
              <span>$${item.total?.toFixed(2)}</span>
            </div>
            <div style="font-size: 10px;">
              ${item.quantity}x $${item.price?.toFixed(2)}
            </div>
          `;
        });
      }

      html += `
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between;" class="bold">
          <span>TOTAL:</span>
          <span>$${data.total?.toFixed(2) || '0.00'}</span>
        </div>
        <div class="line"></div>
        <div class="center">¡Gracias por su compra!</div>
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