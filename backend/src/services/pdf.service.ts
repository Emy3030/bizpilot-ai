import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

export interface SaleDocumentData {
  documentNumber: string;
  documentType: 'INVOICE' | 'RECEIPT';
  businessName: string;
  customerName: string;
  items: { name: string; quantity: number; unitPrice: number; subtotal: number }[];
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
  currency: string;
  createdAt: Date;
  documentHash?: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function money(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

export const pdfService = {
  async generate(data: SaleDocumentData): Promise<{ relativePath: string; absolutePath: string }> {
    const folder = data.documentType === 'INVOICE' ? 'invoices' : 'receipts';
    const dir = path.join(UPLOAD_ROOT, folder);
    ensureDir(dir);

    const filename = `${data.documentNumber}.pdf`;
    const absolutePath = path.join(dir, filename);
    const relativePath = `/uploads/${folder}/${filename}`;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(absolutePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).fillColor('#4F46E5').text(data.businessName, { continued: false });
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor('#111827').text(data.documentType === 'INVOICE' ? 'INVOICE' : 'RECEIPT');
    doc.fontSize(10).fillColor('#6B7280').text(`No: ${data.documentNumber}`);
    doc.text(`Date: ${data.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.moveDown();

    doc.fontSize(11).fillColor('#111827').text(`Bill to: ${data.customerName}`);
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).fillColor('#6B7280');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Unit price', 360, tableTop);
    doc.text('Subtotal', 460, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#E5E7EB').stroke();

    let y = tableTop + 25;
    doc.fillColor('#111827');
    for (const item of data.items) {
      doc.text(item.name, 50, y, { width: 240 });
      doc.text(String(item.quantity), 300, y);
      doc.text(money(item.unitPrice, data.currency), 360, y);
      doc.text(money(item.subtotal, data.currency), 460, y);
      y += 20;
    }

    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#E5E7EB').stroke();
    y += 20;

    doc.fontSize(11).fillColor('#111827');
    doc.text(`Total: ${money(data.totalAmount, data.currency)}`, 360, y, { width: 185, align: 'left' });
    y += 18;
    doc.fontSize(10).fillColor('#6B7280');
    doc.text(`Amount paid: ${money(data.amountPaid, data.currency)}`, 360, y);
    y += 15;
    doc.text(`Payment status: ${data.paymentStatus} \u00b7 ${data.paymentMethod}`, 360, y);

    if (data.documentHash) {
      y += 35;
      doc.fontSize(8).fillColor('#9CA3AF');
      doc.text('Tamper-proof record hash (anchored on Base Sepolia):', 50, y);
      doc.text(data.documentHash, 50, y + 12, { width: 495 });
    }

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    return { relativePath, absolutePath };
  },
};
