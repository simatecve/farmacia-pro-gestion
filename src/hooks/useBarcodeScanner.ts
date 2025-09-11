import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BarcodeResult {
  code: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    price: number;
    category?: {
      id: string;
      name: string;
    };
  };
  found: boolean;
}

export interface BarcodeScannerOptions {
  onScan?: (result: BarcodeResult) => void;
  onError?: (error: string) => void;
  minLength?: number;
  maxLength?: number;
  timeout?: number;
}

export function useBarcodeScanner(options: BarcodeScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [buffer, setBuffer] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const {
    onScan,
    onError,
    minLength = 8,
    maxLength = 20,
    timeout = 100
  } = options;

  // Buscar producto por código de barras
  const searchProductByBarcode = useCallback(async (barcode: string): Promise<BarcodeResult> => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          barcode,
          price,
          categories (
            id,
            name
          )
        `)
        .or(`barcode.eq.${barcode},sku.eq.${barcode}`);

      if (error) {
        throw error;
      }

      const product = products?.[0];
      
      return {
        code: barcode,
        product: product ? {
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          price: product.price,
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name
          } : undefined
        } : undefined,
        found: !!product
      };
    } catch (error) {
      console.error('Error searching product by barcode:', error);
      return {
        code: barcode,
        found: false
      };
    }
  }, []);

  // Procesar código escaneado
  const processScannedCode = useCallback(async (code: string) => {
    if (code.length < minLength || code.length > maxLength) {
      onError?.('Código de barras inválido');
      return;
    }

    setIsScanning(true);
    setLastScannedCode(code);

    try {
      const result = await searchProductByBarcode(code);
      onScan?.(result);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error al procesar código');
    } finally {
      setIsScanning(false);
    }
  }, [minLength, maxLength, onScan, onError, searchProductByBarcode]);

  // Manejar entrada de teclado para detectar códigos de barras
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Ignorar si hay un input activo
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    )) {
      return;
    }

    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Si es Enter, procesar el buffer
    if (event.key === 'Enter') {
      if (buffer.trim()) {
        processScannedCode(buffer.trim());
        setBuffer('');
      }
      return;
    }

    // Si es un carácter válido, agregarlo al buffer
    if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      const newBuffer = buffer + event.key;
      setBuffer(newBuffer);

      // Configurar timeout para limpiar buffer
      const newTimeoutId = setTimeout(() => {
        setBuffer('');
      }, timeout);
      setTimeoutId(newTimeoutId);
    }
  }, [buffer, timeoutId, timeout, processScannedCode]);

  // Configurar listeners de teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleKeyPress, timeoutId]);

  // Función manual para escanear código
  const scanBarcode = useCallback(async (code: string) => {
    await processScannedCode(code);
  }, [processScannedCode]);

  // Limpiar buffer manualmente
  const clearBuffer = useCallback(() => {
    setBuffer('');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  return {
    isScanning,
    lastScannedCode,
    buffer,
    scanBarcode,
    clearBuffer,
    searchProductByBarcode
  };
}