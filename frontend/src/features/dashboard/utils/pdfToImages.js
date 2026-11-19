import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configuración del worker de PDF.js para Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Convierte un ArrayBuffer o Data URL de PDF a un arreglo de imágenes (Data URLs de JPEG)
 * para que cualquier PDF subido pueda renderizarse directamente como imagen en pantalla e impresiones,
 * evitando el bloqueo de iframes o páginas blancas en navegadores modernos.
 * 
 * @param {ArrayBuffer|Uint8Array|string} pdfSource - Datos del PDF (ArrayBuffer o data: URL)
 * @param {number} maxPages - Límite de páginas a previsualizar (default: 6)
 * @param {number} scale - Escala de nitidez (default: 1.5)
 * @returns {Promise<string[]>} Lista de Data URLs en formato image/jpeg
 */
export async function convertPdfToImages(pdfSource, maxPages = 6, scale = 1.5) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [];
  }
  try {
    let loadingTask;
    if (typeof pdfSource === 'string' && pdfSource.startsWith('data:')) {
      const parts = pdfSource.split(',');
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      loadingTask = pdfjsLib.getDocument({ data: u8arr });
    } else if (pdfSource instanceof ArrayBuffer || pdfSource instanceof Uint8Array) {
      loadingTask = pdfjsLib.getDocument({ data: pdfSource });
    } else {
      loadingTask = pdfjsLib.getDocument(pdfSource);
    }

    const pdfDoc = await loadingTask.promise;
    const numPages = Math.min(pdfDoc.numPages, maxPages);
    const images = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await page.render(renderContext).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      images.push(dataUrl);
    }

    return images;
  } catch (err) {
    console.warn('Error al procesar PDF con PDF.js:', err);
    return [];
  }
}
