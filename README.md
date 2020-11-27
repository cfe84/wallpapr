Updates your wallpaper with collage of your photo.

Currently support Flickr as the source for photos, but can easily be extended.

# Usage

```sh
wallpapr [--flickr [--count N] [--album ID]] [--refresh-rate T]
```

- `refresh-rate` indicates wait time between adding photos in `T` seconds.

## Flickr

- `count` will limit random pictures to the `N` first albums
- `album` will limit random pictures to album with id `ID`
