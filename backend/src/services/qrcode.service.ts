import QRCode from 'qrcode';
import { env } from '../config/env';
import { uploadBuffer } from '../config/cloudinary';

export const qrCodeService = {
  async generateVerificationQr(receiptNumber: string, documentHash: string): Promise<string> {
    const verifyUrl = `${env.clientUrl}/verify/${documentHash}`;

    const buffer = await QRCode.toBuffer(verifyUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#111827', light: '#FFFFFF' },
    });

    const { url } = await uploadBuffer(buffer, {
      folder: 'bizpilot/qrcodes',
      public_id: receiptNumber,
      resource_type: 'image',
    });

    return url;
  },
};
