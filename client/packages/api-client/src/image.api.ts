import type { ApiClient } from './client'

/**
 * 이미지 업로드 API
 *
 * WebView 환경에서 네이티브 파일 피커로 선택한 File 객체를 그대로 받음.
 * 최대 5장까지 동시 업로드 가능.
 */
export class ImageApi {
  constructor(private client: ApiClient) {}

  // 게시글 이미지 업로드 (FormData multipart)
  async uploadPostImages(files: File[]): Promise<{ imageUrls: string[] }> {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    return this.client.postFormData('/api/community/images/upload', formData)
  }
}
