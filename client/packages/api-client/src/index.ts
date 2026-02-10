/**
 * API Client 통합 export
 */

export { ApiClient } from './client'
export type { ApiClientConfig } from './client'

export { AuthApi } from './auth.api'
export type { LoginRequest, LoginResponse, SignupRequest } from './auth.api'

export { CommunityApi } from './community.api'
export type { Post, CreatePostRequest } from './community.api'

/**
 * API Client Factory
 */
import { ApiClient } from './client'
import { AuthApi } from './auth.api'
import { CommunityApi } from './community.api'
import type { ApiClientConfig } from './client'

export function createApiClient(config: ApiClientConfig) {
  const client = new ApiClient(config)

  return {
    client,
    auth: new AuthApi(client),
    community: new CommunityApi(client),
  }
}
