import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource } from "./infrastructure/FlickrPhotoSource"

const runAsync = async () => {
  const configuration = new Configuration()
  const source = new FlickrPhotoSource({ configuration })
  await source.authenticateAsync()
  // await source.listAlbums()
  // const photos = await source.getPhotosAsync("72157716991200377")
  console.log(await source.getPhotoUrl("50302347866", 500))
}

runAsync().then(() => { })