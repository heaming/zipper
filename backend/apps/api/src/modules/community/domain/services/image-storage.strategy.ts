/**
 * Multer 파일 타입 정의
 */
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

/**
 * 이미지 저장 전략 인터페이스
 * 전략 패턴을 사용하여 로컬/S3 등 다양한 저장소 지원
 */
export interface ImageStorageStrategy {
  /**
   * 이미지 파일을 저장하고 URL을 반환
   * @param file 이미지 파일
   * @param folder 저장할 폴더 경로 (예: 'posts', 'profiles')
   * @returns 저장된 이미지의 URL
   */
  uploadImage(file: MulterFile, folder: string): Promise<string>;

  /**
   * 여러 이미지 파일을 저장하고 URL 배열을 반환
   * @param files 이미지 파일 배열
   * @param folder 저장할 폴더 경로
   * @returns 저장된 이미지의 URL 배열
   */
  uploadImages(files: MulterFile[], folder: string): Promise<string[]>;

  /**
   * 이미지 URL로부터 파일 삭제
   * @param imageUrl 삭제할 이미지의 URL
   */
  deleteImage(imageUrl: string): Promise<void>;

  /**
   * 여러 이미지 URL로부터 파일 삭제
   * @param imageUrls 삭제할 이미지의 URL 배열
   */
  deleteImages(imageUrls: string[]): Promise<void>;
}
