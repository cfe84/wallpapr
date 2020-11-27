import { IPhotoProvider } from "../domain/IPhotoProvider";
import { FlickrPhotoSource, Photoset } from "./FlickrPhotoSource";

export interface FlickrPhotoProviderOptions {
  albumCount: number
}

export class FlickrAlbumPhotoProvider implements IPhotoProvider {
  private albums: Photoset[] = []

  constructor(private source: FlickrPhotoSource, private options?: FlickrPhotoProviderOptions) {
  }

  public async getNextPhotoAsync(): Promise<Buffer> {
    if (!this.albums.length) {
      this.albums = await this.source.listAlbumsAsync()
      if (this.options && this.options.albumCount) {
        this.albums = this.albums.slice(0, this.options.albumCount)
      }
    }
    const album = this.albums[Math.floor(Math.random() * this.albums.length)]
    const photos = await this.source.getPhotosAsync(album.id)
    const randomPicture = photos[Math.floor(Math.random() * photos.length)]
    const photo = await this.source.getPhoto(randomPicture.id, 800)
    return photo
  }

}