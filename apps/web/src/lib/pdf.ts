import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPdf(opts: {
  element: HTMLElement;
  filename: string;
  marginMm?: number;
}) {
  const marginMm = opts.marginMm ?? 10;
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const canvas = await html2canvas(opts.element, {
    scale: Math.max(2, window.devicePixelRatio || 2),
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginMm * 2;
  const usableHeight = pageHeight - marginMm * 2;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let remainingHeight = imgHeight;
  let y = marginMm;
  let page = 0;

  while (remainingHeight > 0) {
    if (page > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', marginMm, y - page * usableHeight, imgWidth, imgHeight);
    remainingHeight -= usableHeight;
    page++;
  }

  pdf.save(opts.filename);
}

