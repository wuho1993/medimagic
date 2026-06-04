type PdfOrientation = 'portrait' | 'landscape';

export async function saveElementAsPdf(element: HTMLElement, filename: string, orientation: PdfOrientation = 'landscape') {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const renderWidth = pageWidth - (margin * 2);
  const renderHeight = (canvas.height * renderWidth) / canvas.width;
  const pageContentHeight = pageHeight - (margin * 2);
  const image = canvas.toDataURL('image/png');

  let remainingHeight = renderHeight;
  let offsetY = 0;

  pdf.addImage(image, 'PNG', margin, offsetY + margin, renderWidth, renderHeight, undefined, 'FAST');
  remainingHeight -= pageContentHeight;

  while (remainingHeight > 0) {
    offsetY -= pageContentHeight;
    pdf.addPage();
    pdf.addImage(image, 'PNG', margin, offsetY + margin, renderWidth, renderHeight, undefined, 'FAST');
    remainingHeight -= pageContentHeight;
  }

  pdf.save(filename);
}
