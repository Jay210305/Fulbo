import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';
import { UploadService } from '../src/upload/upload.service.js';

describe('UploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws ServiceUnavailable when Cloudinary is not configured', async () => {
    const service = new UploadService(new ConfigService());
    const file = { buffer: Buffer.from('x'), originalname: 'x.png' } as Express.Multer.File;

    await expect(service.uploadImage(file)).rejects.toThrow(ServiceUnavailableException);
  });

  it('uploads a buffer and returns the secure url', async () => {
    cloudinary.uploader.upload_stream.mockImplementation(
      (_opts: unknown, cb: (err: unknown, res: { secure_url: string }) => void) => {
        cb(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/fulbo/fields/abc.png' });
        return { end: vi.fn() };
      },
    );
    const service = new UploadService(
      new ConfigService({
        CLOUDINARY_CLOUD_NAME: 'demo',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
      }),
    );
    const file = { buffer: Buffer.from('image'), originalname: 'pic.png' } as Express.Multer.File;

    const result = await service.uploadImage(file, 'fields');

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    expect(result).toEqual({ url: 'https://res.cloudinary.com/demo/image/upload/v1/fulbo/fields/abc.png' });
  });

  it('uploads multiple files and returns urls', async () => {
    cloudinary.uploader.upload_stream.mockImplementation(
      (_opts: unknown, cb: (err: unknown, res: { secure_url: string }) => void) => {
        cb(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/fulbo/fields/x.jpg' });
        return { end: vi.fn() };
      },
    );
    const service = new UploadService(
      new ConfigService({
        CLOUDINARY_CLOUD_NAME: 'demo',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
      }),
    );
    const files = [
      { buffer: Buffer.from('a'), originalname: 'a.jpg' },
      { buffer: Buffer.from('b'), originalname: 'b.jpg' },
    ] as Express.Multer.File[];

    const result = await service.uploadImages(files, 'fields');

    expect(result.urls).toHaveLength(2);
  });

  it('deletes an image by public id derived from the url', async () => {
    cloudinary.uploader.destroy.mockImplementation(
      (_id: string, cb: (err: unknown, res: unknown) => void) => cb(null, { result: 'ok' }),
    );
    const service = new UploadService(
      new ConfigService({
        CLOUDINARY_CLOUD_NAME: 'demo',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
      }),
    );

    await service.deleteImage({ url: 'https://res.cloudinary.com/demo/image/upload/v1712345678/fulbo/fields/abc.png' });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      'fulbo/fields/abc',
      expect.any(Function),
    );
  });
});
