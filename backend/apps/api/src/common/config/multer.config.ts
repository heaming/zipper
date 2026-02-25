import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

/**
 * Multer 설정
 * memoryStorage를 사용하여 파일을 메모리에 저장 (로컬/S3 저장소에서 처리)
 */
export const multerConfig: MulterOptions = {
  storage: memoryStorage(), // 파일을 메모리에 저장 (버퍼로 전달)
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('지원하지 않는 이미지 형식입니다.'), false);
    }
  },
};
