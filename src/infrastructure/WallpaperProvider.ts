import * as Jimp from "jimp"
import * as wallpaper from "wallpaper"
import * as fs from "fs"

export class WallpaperProvider {
  baseImage: Jimp | null = null
  backgroundFiles = ["background-1.png", "background-2.png"]
  backgroundIndex = 0
  size = {
    w: 2256,
    h: 1504
  }
  async addPhotoToWallpaperAsync(photo: Buffer) {
    if (!this.baseImage) {
      const originalBackgroundFile = await wallpaper.get()
      if (!fs.existsSync(originalBackgroundFile)) {
        this.baseImage = await (await Jimp.create(this.size.w, this.size.h))
      } else {
        this.baseImage = await (await Jimp.read(originalBackgroundFile))
      }
    }
    const newPicture = await Jimp.read(photo)
    const rotatedImage = await newPicture.rotate(Math.random() * 30 - 15)
    const pos = {
      t: Math.random() * (this.baseImage.getHeight()) - newPicture.getHeight() / 2,
      l: Math.random() * (this.baseImage.getWidth()) - newPicture.getWidth() / 2,
    }
    this.baseImage = await this.baseImage.composite(rotatedImage, pos.l, pos.t)
    const backgroundFile = this.backgroundFiles[this.backgroundIndex++ % this.backgroundFiles.length]
    await this.baseImage.writeAsync(backgroundFile)
    await wallpaper.set(backgroundFile)
  }
}