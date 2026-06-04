type PdfOrientation = 'portrait' | 'landscape';

function sanitizeCanvasColors(root: HTMLElement) {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];

  for (const element of elements) {
    element.style.color = '#0f172a';
    element.style.borderColor = '#cbd5e1';
    element.style.outlineColor = '#cbd5e1';
    element.style.textDecorationColor = '#0f172a';
    element.style.boxShadow = 'none';

    if (element === root) {
      element.style.backgroundColor = '#ffffff';
    } else if (element.classList.contains('bg-slate-100')) {
      element.style.backgroundColor = '#f1f5f9';
    } else if (element.classList.contains('bg-white')) {
      element.style.backgroundColor = '#ffffff';
    } else {
      element.style.backgroundColor = 'transparent';
    }
  }
}

export async function saveElementAsPdf(element: HTMLElement, filename: string, orientation: PdfOrientation = 'landscape') {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    onclone: (_document, clonedElement) => {
      sanitizeCanvasColors(clonedElement as HTMLElement);
    },
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
