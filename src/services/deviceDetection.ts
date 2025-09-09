/// <reference path="../types/webusb.d.ts" />

// Servicio para detección automática de dispositivos USB y periféricos
export interface DetectedDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  deviceType: 'printer' | 'cash_drawer' | 'barcode_reader' | 'scale' | 'unknown';
  connectionType: 'usb' | 'network' | 'bluetooth' | 'serial';
  isConnected: boolean;
}

// Mapeo de vendors conocidos para identificar dispositivos
const KNOWN_VENDORS: Record<number, { name: string; deviceTypes: string[] }> = {
  0x04b4: { name: 'Epson', deviceTypes: ['printer'] },
  0x04f9: { name: 'Brother', deviceTypes: ['printer'] },
  0x03f0: { name: 'HP', deviceTypes: ['printer'] },
  0x067b: { name: 'Prolific', deviceTypes: ['barcode_reader'] },
  0x0483: { name: 'STMicroelectronics', deviceTypes: ['cash_drawer'] },
  0x1a86: { name: 'QinHeng Electronics', deviceTypes: ['cash_drawer', 'scale'] },
  0x0403: { name: 'FTDI', deviceTypes: ['barcode_reader', 'scale'] },
  // Lectores de código de barras comunes
  0x05e0: { name: 'Symbol Technologies', deviceTypes: ['barcode_reader'] },
  0x1234: { name: 'Honeywell', deviceTypes: ['barcode_reader'] },
  0x0c2e: { name: 'Metrologic/Honeywell', deviceTypes: ['barcode_reader'] },
  // Impresoras térmicas POS
  0x0456: { name: 'Thermal Printer', deviceTypes: ['printer'] },
  0x0416: { name: 'Winbond', deviceTypes: ['printer'] },
};

class DeviceDetectionService {
  private detectedDevices: DetectedDevice[] = [];
  private listeners: Array<(devices: DetectedDevice[]) => void> = [];

  constructor() {
    this.initializeDeviceDetection();
  }

  // Inicializar detección de dispositivos
  private async initializeDeviceDetection() {
    try {
      // Verificar soporte de Web USB API
      if ('usb' in navigator && (navigator as any).usb) {
        (navigator as any).usb.addEventListener('connect', this.handleDeviceConnect.bind(this));
        (navigator as any).usb.addEventListener('disconnect', this.handleDeviceDisconnect.bind(this));
        
        // Cargar dispositivos ya conectados
        await this.scanConnectedDevices();
      }
    } catch (error) {
      console.warn('Web USB API no soportada:', error);
    }
  }

  // Escanear dispositivos USB conectados
  async scanConnectedDevices(): Promise<DetectedDevice[]> {
    try {
      if ('usb' in navigator && (navigator as any).usb) {
        const devices = await (navigator as any).usb.getDevices();
        this.detectedDevices = devices.map(device => this.mapUSBDevice(device));
        this.notifyListeners();
        return this.detectedDevices;
      }
    } catch (error) {
      console.error('Error escaneando dispositivos:', error);
    }
    return [];
  }

  // Solicitar permiso para acceder a dispositivos USB
  async requestUSBAccess(): Promise<DetectedDevice[]> {
    try {
      if ('usb' in navigator && (navigator as any).usb) {
        // Filtros para dispositivos POS comunes
        const filters = [
          { vendorId: 0x04b4 }, // Epson
          { vendorId: 0x04f9 }, // Brother
          { vendorId: 0x03f0 }, // HP
          { vendorId: 0x067b }, // Prolific (común en lectores)
          { vendorId: 0x0483 }, // STM (gavetas)
          { vendorId: 0x1a86 }, // QinHeng (dispositivos USB-Serial)
          { vendorId: 0x0403 }, // FTDI (adaptadores serie)
          { vendorId: 0x05e0 }, // Symbol
          { vendorId: 0x1234 }, // Honeywell
          { vendorId: 0x0c2e }, // Metrologic
          { classCode: 7 },     // Impresoras
          { classCode: 3 },     // HID (lectores de códigos)
        ];

        const device = await (navigator as any).usb.requestDevice({ filters });
        const mappedDevice = this.mapUSBDevice(device);
        
        if (!this.detectedDevices.find(d => d.vendorId === mappedDevice.vendorId && d.productId === mappedDevice.productId)) {
          this.detectedDevices.push(mappedDevice);
          this.notifyListeners();
        }
        
        return this.detectedDevices;
      }
    } catch (error) {
      console.error('Error solicitando acceso USB:', error);
    }
    return [];
  }

  // Mapear dispositivo USB a nuestro formato
  private mapUSBDevice(device: any): DetectedDevice {
    const vendor = KNOWN_VENDORS[device.vendorId];
    let deviceType: DetectedDevice['deviceType'] = 'unknown';

    // Intentar identificar el tipo de dispositivo
    if (vendor) {
      if (vendor.deviceTypes.includes('printer')) deviceType = 'printer';
      else if (vendor.deviceTypes.includes('barcode_reader')) deviceType = 'barcode_reader';
      else if (vendor.deviceTypes.includes('cash_drawer')) deviceType = 'cash_drawer';
      else if (vendor.deviceTypes.includes('scale')) deviceType = 'scale';
    } else {
      // Identificación por clase de dispositivo USB
      if (device.deviceClass === 7) deviceType = 'printer';
      else if (device.deviceClass === 3) deviceType = 'barcode_reader';
    }

    return {
      vendorId: device.vendorId,
      productId: device.productId,
      productName: device.productName || `Dispositivo ${device.productId.toString(16)}`,
      manufacturerName: device.manufacturerName || vendor?.name || 'Desconocido',
      deviceType,
      connectionType: 'usb',
      isConnected: device.opened || true
    };
  }

  // Manejar conexión de dispositivo
  private handleDeviceConnect(event: any) {
    const mappedDevice = this.mapUSBDevice(event.device);
    
    if (!this.detectedDevices.find(d => d.vendorId === mappedDevice.vendorId && d.productId === mappedDevice.productId)) {
      this.detectedDevices.push(mappedDevice);
      this.notifyListeners();
    }
  }

  // Manejar desconexión de dispositivo
  private handleDeviceDisconnect(event: any) {
    this.detectedDevices = this.detectedDevices.filter(
      device => !(device.vendorId === event.device.vendorId && device.productId === event.device.productId)
    );
    this.notifyListeners();
  }

  // Suscribirse a cambios de dispositivos
  subscribe(listener: (devices: DetectedDevice[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar a listeners sobre cambios
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.detectedDevices]));
  }

  // Obtener dispositivos detectados
  getDetectedDevices(): DetectedDevice[] {
    return [...this.detectedDevices];
  }

  // Obtener dispositivos por tipo
  getDevicesByType(type: DetectedDevice['deviceType']): DetectedDevice[] {
    return this.detectedDevices.filter(device => device.deviceType === type);
  }

  // Verificar si Web USB está soportado
  isUSBSupported(): boolean {
    return 'usb' in navigator;
  }

  // Detectar dispositivos de red (impresoras IP)
  async scanNetworkDevices(ipRange = '192.168.1'): Promise<DetectedDevice[]> {
    // Esta función requiere implementación del lado del servidor
    // Por ahora retornamos array vacío
    console.log('Escaneando dispositivos de red en rango:', ipRange);
    return [];
  }
}

// Instancia singleton del servicio
export const deviceDetectionService = new DeviceDetectionService();