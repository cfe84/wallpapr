import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource, Photo } from "./infrastructure/FlickrPhotoSource"
import { default as fetch } from "node-fetch"
import wallpaper = require("wallpaper")
import * as Jimp from "jimp"
import * as fs from "fs"
import { FlickrAlbumPhotoProvider } from "./infrastructure/FlickrPhotoProvider"
import { IPhotoProvider } from "./domain/IPhotoProvider"

const backgroundFiles = ["background-1.png", "background-2.png"]
let baseImage: Jimp
let backgroundIndex = 0
const size = {
  w: 2256,
  h: 1504
}
const refreshRateMs = 5000

type getRandomPhotoUrlAsyncType = () => Promise<Buffer>

const grabPhotoAtRandomAndDisplayAsync = async (photoProvider: IPhotoProvider) => {
  if (!baseImage) {
    const originalBackgroundFile = await wallpaper.get()
    if (!fs.existsSync(originalBackgroundFile)) {
      baseImage = await (await Jimp.create(size.w, size.h)).quality(99)
    } else {
      baseImage = await (await Jimp.read(originalBackgroundFile)).quality(99)
    }
  }
  const photo = await photoProvider.getNextPhotoAsync()
  const newPicture = await Jimp.read(photo)
  const rotatedImage = await newPicture.rotate(Math.random() * 30 - 15)
  const pos = {
    t: Math.random() * (baseImage.getHeight()) - newPicture.getHeight() / 2,
    l: Math.random() * (baseImage.getWidth()) - newPicture.getWidth() / 2,
  }
  baseImage = await baseImage.composite(rotatedImage, pos.l, pos.t)
  const backgroundFile = backgroundFiles[backgroundIndex++ % backgroundFiles.length]
  await baseImage.writeAsync(backgroundFile)
  wallpaper.set(backgroundFile)
}

const loop = (provider: IPhotoProvider) => {
  const next = () => {
    console.log("New picture!")
    setTimeout(() => loop(provider), refreshRateMs)
  }
  grabPhotoAtRandomAndDisplayAsync(provider)
    .then(next)
    .catch(next)
}

const runAsync = async () => {
  const configuration = new Configuration()
  const source = new FlickrPhotoSource({ configuration })
  await source.authenticateAsync()
  const provider = new FlickrAlbumPhotoProvider(source, {
    albumCount: 20
  })

  loop(provider)
}

runAsync().then(() => { })