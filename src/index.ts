import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource, Photo } from "./infrastructure/FlickrPhotoSource"
import { default as fetch } from "node-fetch"
import wallpaper = require("wallpaper")
import * as Jimp from "jimp"
import * as fs from "fs"

const backgroundFiles = ["background-1.jpg", "background-2.jpg"]
let backgroundIndex = 0
const size = {
  w: 2256,
  h: 1504
}

type getRandomPhotoUrlAsyncType = () => Promise<string>

const grabPhotoAtRandomAndDisplayAsync = async (getRandomPhotoUrlAsync: getRandomPhotoUrlAsyncType) => {
  const url = await getRandomPhotoUrlAsync()
  const res = await fetch(url)
  const content = await res.buffer()
  let baseImage: Jimp
  const originalBackgroundFile = await wallpaper.get()
  if (!fs.existsSync(originalBackgroundFile)) {
    baseImage = await Jimp.create(size.w, size.h)
  } else {
    baseImage = await Jimp.read(originalBackgroundFile)
  }
  const newPicture = await Jimp.read(content)
  const rotatedImage = await newPicture.rotate(Math.random() * 30 - 15)
  const pos = {
    t: Math.random() * (baseImage.getHeight()) - newPicture.getHeight() / 2,
    l: Math.random() * (baseImage.getWidth()) - newPicture.getWidth() / 2,
  }
  const newBackground = await baseImage.blit(rotatedImage, pos.l, pos.t)
  const backgroundFile = backgroundFiles[backgroundIndex++ % backgroundFiles.length]
  await newBackground.writeAsync(backgroundFile)
  wallpaper.set(backgroundFile)
}

const loop = (getRandomPhotoUrlAsync: getRandomPhotoUrlAsyncType) => {
  grabPhotoAtRandomAndDisplayAsync(getRandomPhotoUrlAsync).then(() => {
    console.log("New picture!")
    setTimeout(() => loop(getRandomPhotoUrlAsync), 2000)
  })
}

const runAsync = async () => {
  const configuration = new Configuration()
  const source = new FlickrPhotoSource({ configuration })
  await source.authenticateAsync()
  const albums = (await source.listAlbums())
    // Keeping only recents / HACK
    .slice(0, 20)

  const getRandomPhotoUrlAsync = async () => {
    const album = albums[Math.ceil(Math.random() * albums.length)]
    const photos = await source.getPhotosAsync(album.id)
    const randomPicture = photos[Math.floor(Math.random() * photos.length)]
    const url = await source.getPhotoUrl(randomPicture.id, 800)
    return url
  }
  //await grabPhotoAtRandomAndDisplayAsync(source, photos)
  loop(getRandomPhotoUrlAsync)
}

runAsync().then(() => { })