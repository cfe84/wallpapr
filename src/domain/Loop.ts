import { WallpaperProvider } from "../infrastructure/WallpaperProvider"
import { IPhotoProvider } from "./IPhotoProvider"

export class Loop {
  private wallpaperProvider = new WallpaperProvider()
  constructor(private refreshRateMs: number, private photoProvider: IPhotoProvider) {

  }

  private async grabPhotoAtRandomAndDisplayAsync() {
    const photo = await this.photoProvider.getNextPhotoAsync()
    await this.wallpaperProvider.addPhotoToWallpaperAsync(photo)
  }

  loop() {
    const next = () => {
      setTimeout(() => this.loop(), this.refreshRateMs)
    }
    this.grabPhotoAtRandomAndDisplayAsync()
      .then(next)
      .catch(next)
  }
}

