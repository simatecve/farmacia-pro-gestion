import { useState, useEffect } from 'react';
import { deviceDetectionService, DetectedDevice } from '@/services/deviceDetection';
import { barcodeService, BarcodeEvent } from '@/services/barcodeService';
import { printerService, PrintJob, CashDrawerEvent } from '@/services/printerService';

export function useDeviceDetection() {
  const [detectedDevices, setDetectedDevices] = useState<DetectedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastBarcodeEvent, setLastBarcodeEvent] = useState<BarcodeEvent | null>(null);
  const [isUSBSupported, setIsUSBSupported] = useState(false);

  useEffect(() => {
    // Verificar soporte USB
    setIsUSBSupported(deviceDetectionService.isUSBSupported());

    // Suscribirse a cambios de dispositivos
    const unsubscribeDevices = deviceDetectionService.subscribe(setDetectedDevices);

    // Suscribirse a eventos de código de barras
    const unsubscribeBarcode = barcodeService.subscribe(setLastBarcodeEvent);

    // Cargar dispositivos iniciales
    deviceDetectionService.scanConnectedDevices();

    return () => {
      unsubscribeDevices();
      unsubscribeBarcode();
    };
  }, []);

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      await deviceDetectionService.scanConnectedDevices();
    } finally {
      setIsScanning(false);
    }
  };

  const requestUSBAccess = async () => {
    setIsScanning(true);
    try {
      return await deviceDetectionService.requestUSBAccess();
    } finally {
      setIsScanning(false);
    }
  };

  const getDevicesByType = (type: DetectedDevice['deviceType']) => {
    return detectedDevices.filter(device => device.deviceType === type);
  };

  const startBarcodeListening = () => {
    barcodeService.startListening();
  };

  const stopBarcodeListening = () => {
    barcodeService.stopListening();
  };

  const printReceipt = async (content: string, deviceId?: string) => {
    return await printerService.printReceipt(content, deviceId);
  };

  const openCashDrawer = async (deviceId?: string) => {
    return await printerService.openCashDrawer(deviceId);
  };

  return {
    detectedDevices,
    isScanning,
    isUSBSupported,
    lastBarcodeEvent,
    scanDevices,
    requestUSBAccess,
    getDevicesByType,
    startBarcodeListening,
    stopBarcodeListening,
    printReceipt,
    openCashDrawer,
    isBarcodeListening: barcodeService.isActivelyListening(),
  };
}