import { IPhotoProvider } from "../domain/IPhotoProvider";
import { FlickrPhotoSource, Photo, Photoset } from "./FlickrPhotoSource";


export class FlickrAlbumPhotoProvider implements IPhotoProvider {
  private albums: Photoset[] = []
  private photos: Photo[] = []

  constructor(private source: FlickrPhotoSource, private albumId: string) {
  }

  public async getNextPhotoAsync(): Promise<Buffer> {
    if (this.photos.length === 0) {
      this.photos = await this.source.getPhotosAsync(this.albumId)
    }
    const randomPicture = this.photos[Math.floor(Math.random() * this.photos.length)]
    const photo = await this.source.getPhoto(randomPicture.id, 800)
    return photo
  }

}