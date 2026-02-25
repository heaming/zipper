import { Injectable } from '@nestjs/common';
import { ImageStorageStrategy, MulterFile } from '../../domain/services/image-storage.strategy';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 로컬 파일 시스템 이미지 저장소 구현
 */
@Injectable()
export class LocalImageStorage implements ImageStorageStrategy {
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // 환경변수에서 업로드 경로 가져오기 (기본값: ./uploads)
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    // 환경변수에서 base URL 가져오기 (기본값: http://localhost:3000)
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
  }

  async uploadImage(file: MulterFile, folder: string): Promise<string> {
    // 폴더 경로 생성
    const folderPath = path.join(this.uploadPath, folder);
    
    // 폴더가 없으면 생성
    await fs.mkdir(folderPath, { recursive: true });

    // 고유한 파일명 생성
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(folderPath, fileName);

    // 파일 저장
    await fs.writeFile(filePath, file.buffer);

    // URL 반환 (예: http://localhost:3000/uploads/posts/uuid.jpg)
    return `${this.baseUrl}/uploads/${folder}/${fileName}`;
  }

  async uploadImages(files: MulterFile[], folder: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // URL에서 파일 경로 추출
      const urlPath = new URL(imageUrl).pathname; // /uploads/posts/uuid.jpg
      const filePath = path.join(process.cwd(), urlPath); // ./uploads/posts/uuid.jpg

      // 파일이 존재하면 삭제
      await fs.unlink(filePath);
    } catch (error) {
      // 파일이 없어도 에러 무시 (이미 삭제되었을 수 있음)
      console.warn(`Failed to delete image: ${imageUrl}`, error);
    }
  }

  async deleteImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    await Promise.allSettled(deletePromises); // 일부 실패해도 계속 진행
  }
}
