/**
 * 카카오 로컬 API 서비스
 * 주소로부터 좌표 정보를 가져옵니다.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KakaoAddressResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: Array<{
    address_name: string;
    y: string; // 위도
    x: string; // 경도
    address_type: string;
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      region_3depth_h_name: string;
      region_4depth_name: string;
      code: string;
    };
    road_address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: string;
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
      y: string;
      x: string;
    };
  }>;
}

@Injectable()
export class KakaoLocalService {
  private readonly logger = new Logger(KakaoLocalService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://dapi.kakao.com/v2/local';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('KAKAO_REST_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('KAKAO_REST_API_KEY가 설정되지 않았습니다. 카카오 로컬 API를 사용할 수 없습니다.');
    }
  }

  /**
   * 주소로부터 전체 주소 정보를 가져옵니다.
   * @param address 도로명 주소 또는 지번 주소
   * @returns 카카오 로컬 API 응답의 첫 번째 결과 또는 null
   */
  async getAddressInfo(address: string): Promise<KakaoAddressResponse['documents'][0] | null> {
    if (!this.apiKey) {
      this.logger.warn('KAKAO_REST_API_KEY가 설정되지 않아 주소 정보를 가져올 수 없습니다.');
      return null;
    }

    if (!address) {
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      
      // 먼저 exact로 시도, 실패하면 similar로 재시도
      let url = `${this.baseUrl}/search/address.json?query=${encodedAddress}&analyze_type=exact`;
      
      this.logger.debug(`카카오 로컬 API 호출: ${url}`);

      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${this.apiKey}`,
        },
      });

      let data: KakaoAddressResponse | null = null;

      if (response.ok) {
        data = await response.json();
        this.logger.log(`카카오 로컬 API exact 검색 응답: total_count=${data.meta?.total_count}, documents.length=${data.documents?.length}`);
        
        // exact 검색 결과가 없으면 similar로 재시도
        if (data.meta?.total_count === 0 || !data.documents || data.documents.length === 0) {
          this.logger.log(`주소 "${address}"에 대한 exact 검색 결과가 없어 similar로 재시도합니다.`);
          
          // similar로 재시도
          url = `${this.baseUrl}/search/address.json?query=${encodedAddress}&analyze_type=similar`;
          this.logger.debug(`카카오 로컬 API 재시도: ${url}`);
          
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `KakaoAK ${this.apiKey}`,
            },
          });
          
          if (response.ok) {
            data = await response.json();
            this.logger.log(`카카오 로컬 API similar 검색 응답: total_count=${data.meta?.total_count}, documents.length=${data.documents?.length}`);
          }
        }
      }

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`카카오 로컬 API 호출 실패: ${response.status} ${response.statusText}, 응답: ${errorBody}`);
        return null;
      }

      if (!data) {
        this.logger.error(`카카오 로컬 API 응답 데이터가 없습니다.`);
        return null;
      }

      if (data.documents && data.documents.length > 0) {
        const matchedAddress = data.documents[0].road_address?.address_name || data.documents[0].address_name;
        this.logger.log(`주소 매칭 성공: 원본="${address}", 매칭="${matchedAddress}"`);
        return data.documents[0];
      }

      this.logger.warn(`주소 "${address}"에 대한 검색 결과가 없습니다.`);
      return null;
    } catch (error) {
      this.logger.error(`카카오 로컬 API 호출 중 오류 발생: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 주소로부터 좌표 정보를 가져옵니다.
   * @param address 도로명 주소 또는 지번 주소
   * @returns { latitude: number, longitude: number } | null
   */
  async getCoordinatesFromAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    if (!this.apiKey) {
      this.logger.warn('KAKAO_REST_API_KEY가 설정되지 않아 좌표를 가져올 수 없습니다.');
      return null;
    }

    if (!address) {
      return null;
    }

    const addressInfo = await this.getAddressInfo(address);
    if (!addressInfo) {
      return null;
    }

    // 도로명 주소가 있으면 도로명 주소의 좌표 사용, 없으면 지번 주소 좌표 사용
    const coordinates = addressInfo.road_address || addressInfo;
    
    if (!coordinates.y || !coordinates.x) {
      this.logger.error(`좌표 정보가 없습니다. 응답: ${JSON.stringify(addressInfo)}`);
      return null;
    }

    const latitude = parseFloat(coordinates.y);
    const longitude = parseFloat(coordinates.x);

    if (isNaN(latitude) || isNaN(longitude)) {
      this.logger.error(`좌표 파싱 실패: y=${coordinates.y}, x=${coordinates.x}`);
      return null;
    }

    this.logger.log(`주소 "${address}"의 좌표: ${latitude}, ${longitude}`);
    
    return {
      latitude,
      longitude,
    };
  }
}
