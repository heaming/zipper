import type { NativeBridgeInterface } from './types'

/**
 * iOS WebView Bridge (WKWebView)
 */
class IOSBridge implements NativeBridgeInterface {
  private postMessage(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!window.webkit?.messageHandlers?.zipper) {
        reject(new Error('iOS bridge not available'))
        return
      }

      const messageId = Math.random().toString(36).substring(7)
      
      // 응답 리스너 등록
      const listener = (event: MessageEvent) => {
        if (event.data.messageId === messageId) {
          window.removeEventListener('message', listener)
          if (event.data.error) {
            reject(new Error(event.data.error))
          } else {
            resolve(event.data.result)
          }
        }
      }
      window.addEventListener('message', listener)

      // iOS에 메시지 전송
      window.webkit.messageHandlers.zipper.postMessage({
        messageId,
        method,
        params,
      })
    })
  }

  async getLocation() {
    return this.postMessage('getLocation')
  }

  async requestNotificationPermission() {
    return this.postMessage('requestNotificationPermission')
  }

  vibrate(duration = 100) {
    this.postMessage('vibrate', { duration })
  }

  async openCamera() {
    return this.postMessage('openCamera')
  }

  async pickImage() {
    return this.postMessage('pickImage')
  }

  async getSecureItem(key: string) {
    return this.postMessage('getSecureItem', { key })
  }

  async setSecureItem(key: string, value: string) {
    return this.postMessage('setSecureItem', { key, value })
  }

  async removeSecureItem(key: string) {
    return this.postMessage('removeSecureItem', { key })
  }

  async getAppInfo() {
    return this.postMessage('getAppInfo')
  }

  openUrl(url: string) {
    this.postMessage('openUrl', { url })
  }

  async share(options: { title?: string; text?: string; url?: string }) {
    return this.postMessage('share', options)
  }
}

export const iosBridge = new IOSBridge()
