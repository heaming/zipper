/**
 * Native Bridge 타입 정의
 */

export interface NativeBridgeInterface {
  // 위치 정보
  getLocation(): Promise<{ latitude: number; longitude: number }>
  
  // 알림
  requestNotificationPermission(): Promise<boolean>
  
  // 진동
  vibrate(duration?: number): void
  
  // 카메라
  openCamera(): Promise<string> // returns base64 image
  pickImage(): Promise<string> // returns base64 image
  
  // 저장소
  getSecureItem(key: string): Promise<string | null>
  setSecureItem(key: string, value: string): Promise<void>
  removeSecureItem(key: string): Promise<void>
  
  // 앱 정보
  getAppInfo(): Promise<{
    version: string
    buildNumber: string
    platform: 'ios' | 'android' | 'web'
  }>
  
  // 딥링크
  openUrl(url: string): void
  
  // 공유
  share(options: {
    title?: string
    text?: string
    url?: string
  }): Promise<void>
}

/**
 * Window 타입 확장 (Native 브리지)
 */
declare global {
  interface Window {
    // iOS
    webkit?: {
      messageHandlers?: {
        zipper?: {
          postMessage: (message: any) => void
        }
      }
    }
    
    // Android
    ZipperAndroid?: {
      [key: string]: (...args: any[]) => any
    }
  }
}
