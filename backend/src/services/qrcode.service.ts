import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const qrCodeService = {
  async generateVerificationQr(receiptNumber: string, documentHash: string): Promise<string> {
    const dir = path.join(UPLOAD_ROOT, 'qrcodes');
    ensureDir(dir);

    const filename = `${receiptNumber}.png`;
    const absolutePath = path.join(dir, filename);
    const verifyUrl = `${env.clientUrl}/verify/${documentHash}`;

    await QRCode.toFile(absolutePath, verifyUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#111827', light: '#FFFFFF' },
    });

    return `/uploads/qrcodes/${filename}`;
  },
};
