/**
 * Reusable PDF export utility using html2canvas + jsPDF
 * Reuses the same pattern as invoice PDF generation for financial reports
 */

export interface PDFOptions {
  element: HTMLElement;
  filename: string;
  mode?: 'download' | 'print';
  scale?: number;
  backgroundColor?: string;
}

/**
 * Capture HTML element and export to PDF
 * Uses the same html2canvas + jsPDF pattern as invoice PDFs
 */
export async function exportToPDF(options: PDFOptions): Promise<void> {
  const {
    element,
    filename,
    mode = 'download',
    scale = 2,
    backgroundColor = '#ffffff'
  } = options;

  // Lazy-import heavy libs so they don't bloat the initial bundle
  const [html2canvasModule, jsPDFModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  
  const html2canvas = html2canvasModule.default;
  const jsPDF = jsPDFModule.default;

  const canvas = await html2canvas(element, {
    scale,           // 2× for crisp retina output
    useCORS: true,
    allowTaint: true,
    backgroundColor,
    logging: false,
    // Ensure the full element is captured even if scrolled
    scrollX: 0,
    scrollY: 0,
    windowWidth: 794, // A4 at 96 dpi
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // A4 dimensions in mm
  const A4_W = 210;
  const A4_H = 297;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pxToMm = A4_W / canvas.width;
  const originalImgHeightMm = canvas.height * pxToMm;

  // 1. Fits in one page
  if (originalImgHeightMm <= A4_H) {
    pdf.addImage(imgData, 'PNG', 0, 0, A4_W, originalImgHeightMm);
  } 
  // 2. Minor overflow (up to 25%) -> shrink to fit exactly 1 page
  else if (originalImgHeightMm <= A4_H * 1.25) {
    const scaleFactor = A4_H / originalImgHeightMm; // will be between 0.8 and 1.0
    const newWidth = A4_W * scaleFactor;
    const newHeight = A4_H; // exactly one page height
    const xOffset = (A4_W - newWidth) / 2; // Center horizontally
    
    pdf.addImage(imgData, 'PNG', xOffset, 0, newWidth, newHeight);
  } 
  // 3. Major overflow (> 25%) -> slice across multiple pages
  else {
    let posY = 0;
    let remaining = originalImgHeightMm;

    while (remaining > 0) {
      const sliceH = Math.min(remaining, A4_H);
      pdf.addImage(imgData, 'PNG', 0, posY, A4_W, originalImgHeightMm);
      remaining -= sliceH;
      if (remaining > 0) {
        pdf.addPage();
        posY -= A4_H;
      }
    }
  }

  if (mode === 'download') {
    pdf.save(filename);
  } else {
    // Open in a new tab and trigger the browser print dialog
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => win.print(), { once: true });
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

/**
 * Export a React component ref to PDF
 * Helper function for React components
 */
export async function exportComponentToPDF(
  ref: React.RefObject<HTMLElement>,
  filename: string,
  options?: Omit<PDFOptions, 'element' | 'filename'>
): Promise<void> {
  if (!ref.current) {
    throw new Error('Element ref is null or undefined');
  }

  // Give the element time to paint
  await new Promise(resolve => setTimeout(resolve, 300));

  return exportToPDF({
    element: ref.current,
    filename,
    ...options,
  });
}

/**
 * Generate timestamped filename for exports
 */
export function generateTimestampedFilename(baseName: string, extension: string = 'pdf'): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${baseName}_${timestamp}_${time}.${extension}`;
}
