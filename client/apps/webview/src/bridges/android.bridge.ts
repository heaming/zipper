import type { NativeBridgeInterface } from './types'

/**
 * Android WebView Bridge
 */
class AndroidBridge implements NativeBridgeInterface {
  private callNative<T = any>(method: string, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!window.ZipperAndroid) {
        reject(new Error('Android bridge not available'))
        return
      }

      try {
        const result = window.ZipperAndroid[method]?.(...args)
        
        // Android는 동기 응답일 수도 있음
        if (result instanceof Promise) {
          resolve(result)
        } else {
          resolve(result)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async getLocation() {
    const result = await this.callNative<string>('getLocation')
    return JSON.parse(result)
  }

  async requestNotificationPermission() {
    return this.callNative<boolean>('requestNotificationPermission')
  }

  vibrate(duration = 100) {
    this.callNative('vibrate', duration)
  }

  async openCamera() {
    return this.callNative<string>('openCamera')
  }

  async pickImage() {
    return this.callNative<string>('pickImage')
  }

  async getSecureItem(key: string) {
    return this.callNative<string | null>('getSecureItem', key)
  }

  async setSecureItem(key: string, value: string) {
    await this.callNative('setSecureItem', key, value)
  }

  async removeSecureItem(key: string) {
    await this.callNative('removeSecureItem', key)
  }

  async getAppInfo() {
    const result = await this.callNative<string>('getAppInfo')
    return JSON.parse(result)
  }

  openUrl(url: string) {
    this.callNative('openUrl', url)
  }

  async share(options: { title?: string; text?: string; url?: string }) {
    await this.callNative('share', JSON.stringify(options))
  }
}

export const androidBridge = new AndroidBridge()
