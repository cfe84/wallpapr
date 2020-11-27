import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource, Photo } from "./infrastructure/FlickrPhotoSource"
import { default as fetch } from "node-fetch"
import wallpaper = require("wallpaper")
import * as Jimp from "jimp"
import * as fs from "fs"

const backgroundFiles = ["background-1.png", "background-2.png"]
let baseImage: Jimp
let backgroundIndex = 0
const size = {
  w: 2256,
  h: 1504
}
const refreshRateMs = 5000

type getRandomPhotoUrlAsyncType = () => Promise<string>

const grabPhotoAtRandomAndDisplayAsync = async (getRandomPhotoUrlAsync: getRandomPhotoUrlAsyncType) => {
  const url = await getRandomPhotoUrlAsync()
  const res = await fetch(url)
  const content = await res.buffer()
  if (!baseImage) {
    const originalBackgroundFile = await wallpaper.get()
    if (!fs.existsSync(originalBackgroundFile)) {
      baseImage = await (await Jimp.create(size.w, size.h)).quality(99)
    } else {
      baseImage = await (await Jimp.read(originalBackgroundFile)).quality(99)
    }
  }
  const newPicture = await Jimp.read(content)
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

const loop = (getRandomPhotoUrlAsync: getRandomPhotoUrlAsyncType) => {
  const next = () => {
    console.log("New picture!")
    setTimeout(() => loop(getRandomPhotoUrlAsync), refreshRateMs)
  }
  grabPhotoAtRandomAndDisplayAsync(getRandomPhotoUrlAsync)
    .then(next)
    .catch(next)
}

const runAsync = async () => {
  const configuration = new Configuration()
  const source = new FlickrPhotoSource({ configuration })
  await source.authenticateAsync()
  const albums = (await source.listAlbums())
    // Keeping only recents / HACK
    .slice(0, 20)

  const getRandomPhotoUrlAsync = async () => {
    const album = albums[Math.floor(Math.random() * albums.length)]
    const photos = await source.getPhotosAsync(album.id)
    const randomPicture = photos[Math.floor(Math.random() * photos.length)]
    const url = await source.getPhotoUrl(randomPicture.id, 800)
    return url
  }
  //await grabPhotoAtRandomAndDisplayAsync(source, photos)
  loop(getRandomPhotoUrlAsync)
}

runAsync().then(() => { })