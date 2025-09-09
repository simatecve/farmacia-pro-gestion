// Servicio para manejo de lectores de código de barras
export interface BarcodeEvent {
  code: string;
  timestamp: number;
  source: 'keyboard' | 'usb' | 'camera';
}

class BarcodeService {
  private listeners: Array<(event: BarcodeEvent) => void> = [];
  private buffer = '';
  private lastKeyTime = 0;
  private readonly BARCODE_TIMEOUT = 100; // ms entre caracteres de código de barras
  private readonly MIN_BARCODE_LENGTH = 3;
  private isListening = false;

  constructor() {
    this.initializeKeyboardListener();
  }

  // Inicializar listener de teclado para códigos de barras
  private initializeKeyboardListener() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  // Manejar presión de tecla
  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isListening) return;

    const currentTime = Date.now();
    
    // Si ha pasado mucho tiempo desde la última tecla, reiniciar buffer
    if (currentTime - this.lastKeyTime > this.BARCODE_TIMEOUT) {
      this.buffer = '';
    }

    // Detectar Enter (fin de código de barras)
    if (event.key === 'Enter') {
      if (this.buffer.length >= this.MIN_BARCODE_LENGTH && this.isValidBarcode(this.buffer)) {
        this.emitBarcodeEvent({
          code: this.buffer,
          timestamp: currentTime,
          source: 'keyboard'
        });
        event.preventDefault();
        event.stopPropagation();
      }
      this.buffer = '';
      return;
    }

    // Agregar carácter al buffer (solo caracteres válidos)
    if (this.isValidBarcodeCharacter(event.key)) {
      this.buffer += event.key;
      this.lastKeyTime = currentTime;
      
      // Prevenir comportamiento por defecto para lectores rápidos
      if (this.buffer.length === 1) {
        event.preventDefault();
      }
    }
  }

  // Manejar liberación de tecla
  private handleKeyUp(event: KeyboardEvent) {
    // Implementar si es necesario
  }

  // Verificar si un carácter es válido para código de barras
  private isValidBarcodeCharacter(key: string): boolean {
    return /^[0-9a-zA-Z\-_.]$/.test(key);
  }

  // Verificar si un código es válido
  private isValidBarcode(code: string): boolean {
    // Validaciones básicas
    if (code.length < this.MIN_BARCODE_LENGTH) return false;
    
    // Verificar patrones comunes de código de barras
    const patterns = [
      /^\d{8}$/, // EAN-8
      /^\d{12}$/, // UPC-A
      /^\d{13}$/, // EAN-13
      /^[0-9A-Z\-_.]+$/, // Code 128
    ];

    return patterns.some(pattern => pattern.test(code));
  }

  // Emitir evento de código de barras detectado
  private emitBarcodeEvent(event: BarcodeEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  // Suscribirse a eventos de código de barras
  subscribe(listener: (event: BarcodeEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Iniciar escucha de códigos de barras
  startListening() {
    this.isListening = true;
    this.buffer = '';
  }

  // Detener escucha de códigos de barras
  stopListening() {
    this.isListening = false;
    this.buffer = '';
  }

  // Verificar si está escuchando
  isActivelyListening(): boolean {
    return this.isListening;
  }

  // Simular lectura de código (para testing)
  simulateBarcode(code: string) {
    this.emitBarcodeEvent({
      code,
      timestamp: Date.now(),
      source: 'usb'
    });
  }

  // Procesar código de barras desde cámara (usando QuaggaJS o similar)
  async scanFromCamera(): Promise<string | null> {
    try {
      // Esta función requiere una librería de escaneo de cámara
      // Por ahora retornamos null
      console.log('Escaneando desde cámara...');
      return null;
    } catch (error) {
      console.error('Error escaneando desde cámara:', error);
      return null;
    }
  }
}

// Instancia singleton del servicio
export const barcodeService = new BarcodeService();