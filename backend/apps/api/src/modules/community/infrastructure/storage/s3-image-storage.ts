import { Injectable } from '@nestjs/common';
import { ImageStorageStrategy, MulterFile } from '../../domain/services/image-storage.strategy';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

// S3 클라이언트는 optional dependency로 처리
let S3ClientClass: any;
let PutObjectCommand: any;
let DeleteObjectCommand: any;

try {
  const s3Module = require('@aws-sdk/client-s3');
  S3ClientClass = s3Module.S3Client;
  PutObjectCommand = s3Module.PutObjectCommand;
  DeleteObjectCommand = s3Module.DeleteObjectCommand;
} catch (error) {
  // S3 패키지가 설치되지 않은 경우
  console.warn('@aws-sdk/client-s3 is not installed. S3 storage will not work.');
}

/**
 * AWS S3 이미지 저장소 구현
 * 환경변수에서 S3 설정을 읽어서 사용
 */
@Injectable()
export class S3ImageStorage implements ImageStorageStrategy {
  private readonly s3Client: any;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    if (!S3ClientClass) {
      throw new Error('@aws-sdk/client-s3 is required for S3 storage. Please install it: npm install @aws-sdk/client-s3');
    }

    this.region = this.configService.get<string>('AWS_REGION', 'ap-northeast-2');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME', '');

    this.s3Client = new S3ClientClass({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async uploadImage(file: MulterFile, folder: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // 또는 환경변수로 설정 가능
    });

    await this.s3Client.send(command);

    // S3 URL 반환
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
  }

  async uploadImages(files: MulterFile[], folder: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // S3 URL에서 키 추출
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1); // 첫 번째 '/' 제거

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.warn(`Failed to delete image from S3: ${imageUrl}`, error);
    }
  }

  async deleteImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    await Promise.allSettled(deletePromises);
  }
}
