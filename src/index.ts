import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource, Photo } from "./infrastructure/FlickrPhotoSource"
import { default as fetch } from "node-fetch"
import wallpaper = require("wallpaper")
import * as Jimp from "jimp"
import * as fs from "fs"

const backgroundFile = "background.jpg"
const size = {
  w: 2256,
  h: 1504
}

type getRandomPhotoUrlAsyncType = () => Promise<string>

const grabPhotoAtRandomAndDisplayAsync = async (source: FlickrPhotoSource, getRandomPhotoUrlAsync: getRandomPhotoUrlAsyncType) => {
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
  await newBackground.writeAsync(backgroundFile)
  wallpaper.set(backgroundFile)
}

const loop = (source: FlickrPhotoSource, getRandomPhotoUrlAsync: getRandomPhotoUrlAsyncType) => {
  grabPhotoAtRandomAndDisplayAsync(source, getRandomPhotoUrlAsync).then(() => {
    setTimeout(() => loop(source, getRandomPhotoUrlAsync), 2000)
  })
}

const runAsync = async () => {
  const configuration = new Configuration()
  const source = new FlickrPhotoSource({ configuration })
  await source.authenticateAsync()
  const albums = await source.listAlbums()
  const getRandomPhotoUrlAsync = async () => {
    const album = albums[Math.ceil(Math.random() * albums.length)]
    const photos = await source.getPhotosAsync(album.id)
    const randomPicture = photos[Math.floor(Math.random() * photos.length)]
    const url = await source.getPhotoUrl(randomPicture.id, 800)
    return url
  }
  //await grabPhotoAtRandomAndDisplayAsync(source, photos)
  loop(source, getRandomPhotoUrlAsync)
}

runAsync().then(() => { })