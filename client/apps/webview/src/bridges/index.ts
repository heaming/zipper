/**
 * Native Bridge 진입점
 * 
 * 플랫폼에 따라 적절한 브리지를 자동으로 선택합니다.
 * WebView 코드에서는 항상 NativeBridge를 통해 Native 기능에 접근합니다.
 */

import type { NativeBridgeInterface } from './types'
import { iosBridge } from './ios.bridge'
import { androidBridge } from './android.bridge'
import { webBridge } from './web.bridge'
import { getPlatform } from '@/lib/env'

/**
 * 플랫폼별 브리지 선택
 */
function selectBridge(): NativeBridgeInterface {
  const platform = getPlatform()
  
  switch (platform) {
    case 'ios':
      return iosBridge
    case 'android':
      return androidBridge
    default:
      return webBridge
  }
}

/**
 * 전역 Native Bridge
 * 
 * @example
 * ```ts
 * import { NativeBridge } from '@bridges/index'
 * 
 * // 위치 가져오기
 * const location = await NativeBridge.getLocation()
 * 
 * // 진동
 * NativeBridge.vibrate()
 * 
 * // 이미지 선택
 * const image = await NativeBridge.pickImage()
 * ```
 */
export const NativeBridge = selectBridge()

// 타입 export
export type { NativeBridgeInterface }
