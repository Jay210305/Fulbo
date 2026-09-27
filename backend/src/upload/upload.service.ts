import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(config: ConfigService) {
    this.cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    this.apiKey = config.get<string>('CLOUDINARY_API_KEY');
    this.apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    if (this.cloudName && this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
      });
    }
  }

  private readonly cloudName?: string;
  private readonly apiKey?: string;
  private readonly apiSecret?: string;

  private assertConfigured() {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new ServiceUnavailableException(
        'Image uploads are not configured (missing Cloudinary credentials)',
      );
    }
  }

  async uploadImage(file: Express.Multer.File, folder?: string) {
    this.assertConfigured();
    const result = await this.uploadBuffer(file.buffer, folder);
    return { url: result.secure_url };
  }

  async uploadImages(files: Express.Multer.File[], folder?: string) {
    this.assertConfigured();
    const results = await Promise.all(files.map((f) => this.uploadBuffer(f.buffer, folder)));
    return { urls: results.map((r) => r.secure_url) };
  }

  async deleteImage(dto: { url: string }) {
    this.assertConfigured();
    const publicId = this.publicIdFromUrl(dto.url);
    if (!publicId) {
      throw new ServiceUnavailableException('Invalid image url');
    }
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (err: unknown) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private uploadBuffer(buffer: Buffer, folder?: string) {
    return new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: folder || 'fulbo' },
        (err: unknown, res: { secure_url: string } | undefined) => {
          if (err || !res) reject(err ?? new Error('Cloudinary upload failed'));
          else resolve(res);
        },
      );
      stream.end(buffer);
    });
  }

  private publicIdFromUrl(url: string): string | null {
    // https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<id>.<ext>
    const marker = '/upload/';
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return null;
    const path = url.slice(markerIndex + marker.length);
    const withoutVersion = path.replace(/^v\d+\//, '');
    const withoutExt = withoutVersion.replace(/\.[^.]+$/, '');
    return withoutExt || null;
  }
}
