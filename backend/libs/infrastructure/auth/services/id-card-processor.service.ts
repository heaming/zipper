import { Injectable } from '@nestjs/common';

/**
 * 주민등록증 처리 서비스 (Infrastructure 레이어)
 * 
 * 향후 외부 OCR API (예: 네이버 클라우드 플랫폼 OCR, AWS Textract 등)로 교체 가능
 * 또는 Spring 서버로 교체 가능하도록 인터페이스 분리
 */
@Injectable()
export class IdCardProcessorService {
  /**
   * 주민등록증 이미지에서 OCR 수행
   * @param imageBuffer 주민등록증 이미지 버퍼
   * @returns OCR 결과 (이름, 주소, 주민등록번호 등)
   */
  async performOcr(imageBuffer: Buffer): Promise<{
    name?: string;
    address?: string;
    registrationNumber?: string; // 원본 주민등록번호
  }> {
    // TODO: 실제 OCR API 연동
    // 예: 네이버 클라우드 플랫폼 OCR, AWS Textract, Google Cloud Vision 등
    // 현재는 틀만 구성
    
    throw new Error('OCR 기능은 향후 구현 예정입니다.');
  }

  /**
   * 주민등록번호 뒷자리 마스킹
   * @param registrationNumber 원본 주민등록번호 (예: "123456-1234567")
   * @returns 마스킹된 주민등록번호 (예: "123456-1******")
   */
  maskRegistrationNumber(registrationNumber: string): string {
    if (!registrationNumber) {
      return '';
    }

    // 주민등록번호 형식: YYMMDD-GXXXXXX
    const parts = registrationNumber.split('-');
    if (parts.length !== 2) {
      return registrationNumber; // 형식이 맞지 않으면 그대로 반환
    }

    const [front, back] = parts;
    // 뒷자리 첫 번째 자리만 남기고 나머지 마스킹
    const maskedBack = back.charAt(0) + '*'.repeat(back.length - 1);
    
    return `${front}-${maskedBack}`;
  }

  /**
   * 주민등록증 이미지에 마스킹 적용
   * @param imageBuffer 원본 이미지 버퍼
   * @param ocrResult OCR 결과 (주민등록번호 위치 정보 포함)
   * @returns 마스킹된 이미지 버퍼
   */
  async applyMasking(
    imageBuffer: Buffer,
    ocrResult: { registrationNumber?: string; registrationNumberPosition?: any },
  ): Promise<Buffer> {
    // TODO: 이미지 처리 라이브러리 사용 (예: sharp, jimp 등)
    // 주민등록번호 영역을 검은색 또는 블러 처리
    // 현재는 틀만 구성
    
    throw new Error('이미지 마스킹 기능은 향후 구현 예정입니다.');
  }

  /**
   * 주민등록증 인증 처리 전체 플로우
   * 1. OCR 수행
   * 2. 주민등록번호 마스킹
   * 3. 마스킹된 이미지 생성 (저장하지 않음, 인증용으로만 사용)
   * 
   * @param imageBuffer 주민등록증 이미지 버퍼
   * @returns 인증에 사용할 데이터 (마스킹된 주민등록번호, 마스킹된 이미지 등)
   */
  async processIdCard(imageBuffer: Buffer): Promise<{
    maskedRegistrationNumber: string;
    ocrResult: {
      name?: string;
      address?: string;
      registrationNumber?: string;
    };
  }> {
    // 1. OCR 수행
    const ocrResult = await this.performOcr(imageBuffer);

    // 2. 주민등록번호 마스킹
    const maskedRegistrationNumber = ocrResult.registrationNumber
      ? this.maskRegistrationNumber(ocrResult.registrationNumber)
      : '';

    // 3. 마스킹된 이미지는 인증 프로세스에서만 사용하고 저장하지 않음
    // (이미지 저장은 하지 않고, OCR 결과와 마스킹된 주민등록번호만 저장)

    return {
      maskedRegistrationNumber,
      ocrResult: {
        name: ocrResult.name,
        address: ocrResult.address,
        registrationNumber: maskedRegistrationNumber, // 마스킹된 버전만 저장
      },
    };
  }
}
