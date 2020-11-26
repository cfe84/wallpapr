declare module 'flickr-sdk' {
  interface Content<T> {
    _content: T
  }


  interface Size {
    label: string
    width: number
    height: number
    source: string
    url: string
    media: Flickr.MediaType
  }

  type PhotoId = string
  type PhotoSecret = string

  interface GetSizesResponse {
    sizes: {
      size: Size[]
    }
  }

  interface Photo {
    id: PhotoId
    secret: PhotoSecret
    server: string
    farm: number
    title: string
  }


  interface GetPhotosResponse {
    photoset: {
      photo: Photo[]
    }
  }

  type AlbumId = string
  type DateAsString = string
  type UserId = string

  interface Photoset {
    id: AlbumId
    owner: string
    username: string
    server: string
    secret: string
    farm: number
    count_photos: number
    count_videos: number
    photos: number
    videos: number
    date_create: DateAsString
    date_update: DateAsString
    title: Content<string>
    description: Content<string>
  }

  interface GetPhotosetsResponse {
    photosets: {
      photoset: Photoset[]
    }
  }

  interface FlickrResponse<T> {
    body: T
  }

  interface GetPhotosParameters {
    photoset_id: AlbumId,
    user_id: UserId
  }

  interface PhotosetsProvider {
    getList(): FlickrResponse<GetPhotosetsResponse>
    getPhotos(parameters: GetPhotosParameters): FlickrResponse<GetPhotosResponse>
  }

  interface GetSizesParameters {
    photo_id: PhotoId
  }

  interface PhotosProvider {
    getSizes(parameters: GetSizesParameters): FlickrResponse<GetSizesResponse>
  }

  class Flickr {
    constructor(auth: OauthPlugin)
    photosets: PhotosetsProvider
    photos: PhotosProvider
  }

  interface OauthPlugin {
    user_id: string
  }

  type OauthToken = string
  type OauthTokenSecret = string

  interface OauthTokenResponse {
    oauth_token: OauthToken
    oauth_token_secret: OauthTokenSecret
    fullname: string
    user_nsid: UserId
    username: string
  }

  namespace Flickr {
    type AlbumId = string
    type PhotoId = string
    type MediaType = "photo" | "video"

    class OAuth {
      constructor(key: string, secret: string)

      request(callbackUrl: string): Promise<FlickrResponse<OauthTokenResponse>>

      authorizeUrl(token: string, permission: "read" | "write" | "delete"): string

      verify(token: OauthToken, verifier: string, tokenSecret: OauthTokenSecret): Promise<FlickrResponse<OauthTokenResponse>>

      static createPlugin(
        key: string,
        secret: string,
        oauthToken: string,
        oauthTokenSecret: string
      ): OauthPlugin
    }
  }

  export = Flickr
}