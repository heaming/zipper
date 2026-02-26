import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageStorageStrategy } from '../../domain/services/image-storage.strategy';
import { LocalImageStorage } from './local-image-storage';
import { S3ImageStorage } from './s3-image-storage';

/**
 * 이미지 저장소 팩토리
 * 환경변수(IMAGE_STORAGE_TYPE)에 따라 적절한 저장소 전략을 반환
 */
@Injectable()
export class ImageStorageFactory {
  constructor(
    private configService: ConfigService,
    private localStorage: LocalImageStorage,
    private s3Storage: S3ImageStorage,
  ) {}

  getStorage(): ImageStorageStrategy {
    const storageType = this.configService.get<string>('IMAGE_STORAGE_TYPE', 'local');

    switch (storageType.toLowerCase()) {
      case 's3':
        return this.s3Storage;
      case 'local':
      default:
        return this.localStorage;
    }
  }
}
