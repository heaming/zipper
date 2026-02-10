import type { NativeBridgeInterface } from './types'

/**
 * Web Fallback Bridge (브라우저에서 테스트용)
 */
class WebBridge implements NativeBridgeInterface {
  async getLocation() {
    console.warn('[WebBridge] getLocation called')
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          (error) => {
            reject(new Error(`Geolocation error: ${error.message}`))
          }
        )
      } else {
        reject(new Error('Geolocation not supported'))
      }
    })
  }

  async requestNotificationPermission() {
    console.warn('[WebBridge] requestNotificationPermission called')
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  vibrate(duration = 100) {
    console.warn('[WebBridge] vibrate called')
    if ('vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  async openCamera(): Promise<string> {
    console.warn('[WebBridge] openCamera not supported in web')
    throw new Error('Camera not available in web environment')
  }

  async pickImage() {
    console.warn('[WebBridge] pickImage: using file input')
    return new Promise<string>((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        } else {
          reject(new Error('No file selected'))
        }
      }
      
      input.click()
    })
  }

  async getSecureItem(key: string) {
    console.warn('[WebBridge] getSecureItem: using localStorage')
    return localStorage.getItem(key)
  }

  async setSecureItem(key: string, value: string) {
    console.warn('[WebBridge] setSecureItem: using localStorage')
    localStorage.setItem(key, value)
  }

  async removeSecureItem(key: string) {
    console.warn('[WebBridge] removeSecureItem: using localStorage')
    localStorage.removeItem(key)
  }

  async getAppInfo() {
    console.warn('[WebBridge] getAppInfo called')
    return {
      version: '1.0.0',
      buildNumber: '1',
      platform: 'web' as const,
    }
  }

  openUrl(url: string) {
    console.warn('[WebBridge] openUrl:', url)
    window.open(url, '_blank')
  }

  async share(options: { title?: string; text?: string; url?: string }) {
    console.warn('[WebBridge] share called')
    if (navigator.share) {
      try {
        await navigator.share(options)
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      console.log('Share not supported, options:', options)
    }
  }
}

export const webBridge = new WebBridge()
