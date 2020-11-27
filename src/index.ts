import { Configuration } from "./infrastructure/Configuration"
import { FlickrPhotoSource, Photo } from "./infrastructure/FlickrPhotoSource"
import { IPhotoProvider } from "./domain/IPhotoProvider"
import { WallpaperProvider } from "./infrastructure/WallpaperProvider"
import { OptionValue, parseCommandLine } from "yaclip"
import { FlickrAlbumPhotoProvider } from "./infrastructure/FlickrAlbumPhotoProvider"
import { FlickrPhotoProvider, FlickrPhotoProviderOptions } from "./infrastructure/FlickrPhotoProvider"
import { Loop } from "./domain/Loop"


const subcommands = [
  { name: 'album', alias: "a", type: String, description: "Use album id", multiple: false },
  { name: 'count', alias: "c", type: String, multiple: false },
]

const commands = [
  { name: 'flickr', alias: "f", type: Boolean, multiple: false, subcommands },
  { name: 'refresh-rate', alias: "t", type: String, multiple: false }
];

const args = parseCommandLine(commands, {
  dashesAreOptional: true
});

let refreshRateMs = 5000
if (args["refresh-rate"]) {
  refreshRateMs = Number.parseInt((args["refresh-rate"] as OptionValue).value) * 1000
}

let provider: IPhotoProvider | null = null
if (args.flickr) {
  console.log("Using Flickr")
  const configuration = new Configuration()
  const source = new FlickrPhotoSource({ configuration })
  const album = ((args["flickr"] as OptionValue)["album"] as OptionValue)
  if (album) {
    const albumId = album.value
    console.log(`Using album ${albumId}`)
    provider = new FlickrAlbumPhotoProvider(source, albumId)
  } else {
    const countOption = ((args["flickr"] as OptionValue)["count"] as OptionValue)
    const options: FlickrPhotoProviderOptions = {}
    if (countOption) {
      options.albumCount = Number.parseInt(countOption.value)
      console.log(`Using the ${options.albumCount} last albums`)
    }
    provider = new FlickrPhotoProvider(source, options)
  }
}

if (!provider) {
  console.error("No provider set, use --flickr")

} else {
  const loop = new Loop(refreshRateMs, provider)
  loop.loop()
}