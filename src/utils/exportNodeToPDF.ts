import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportNodeToPDF(node: HTMLElement, fileName: string) {
  
  //To show the html content
  const canvas = await html2canvas(node, { backgroundColor: window.getComputedStyle(node).backgroundColor || '#fff', scale: 2, useCORS: true, logging: false,});
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a3',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;

  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

  let remainingHeight = imgHeight;

  while (remainingHeight > pageHeight) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    remainingHeight -= pageHeight;
  }
  
  pdf.save(fileName);
}
