import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource, Photo } from "./infrastructure/FlickrPhotoSource"
import { FlickrAlbumPhotoProvider } from "./infrastructure/FlickrPhotoProvider"
import { IPhotoProvider } from "./domain/IPhotoProvider"
import { WallpaperProvider } from "./infrastructure/WallpaperProvider"

const refreshRateMs = 5000

const grabPhotoAtRandomAndDisplayAsync = async (photoProvider: IPhotoProvider, wallpaperProvider: WallpaperProvider) => {
  const photo = await photoProvider.getNextPhotoAsync()
  await wallpaperProvider.addPhotoToWallpaperAsync(photo)
}

const loop = (provider: IPhotoProvider, wallpaperProvider: WallpaperProvider) => {
  const next = () => {
    setTimeout(() => loop(provider, wallpaperProvider), refreshRateMs)
  }
  grabPhotoAtRandomAndDisplayAsync(provider, wallpaperProvider)
    .then(next)
    .catch(next)
}

const runAsync = async () => {
  const configuration = new Configuration()
  const wallpaperProvider = new WallpaperProvider()
  const source = new FlickrPhotoSource({ configuration })
  await source.authenticateAsync()
  const provider = new FlickrAlbumPhotoProvider(source, {
    albumCount: 20
  })

  loop(provider, wallpaperProvider)
}

runAsync().then(() => { })