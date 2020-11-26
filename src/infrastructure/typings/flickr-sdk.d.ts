declare module 'flickr-sdk' {
  export class FlickrAuth {

  }

  export interface OAuthResponse {
    body: {
      oauth_token: string,
      oauth_token_secret: string
    }
  }

  export interface OAuthTokenResponse {
    body: string
  }

  export class OAuth {
    constructor(key: string, secret: string)

    request(callbackUrl: string): Promise<OAuthResponse>

    authorizeUrl(token: string, permission: "read" | "write" | "delete"): string

    verify(token: string, verifier: string, tokenSecret: string): Promise<OAuthTokenResponse>

    static createPlugin(
      key: string,
      secret: string,
      oauthToken: string,
      oauthTokenSecret: string
    ): any
  }
}