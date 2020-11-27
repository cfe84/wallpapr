export interface IPhotoProvider {
  getNextPhotoAsync: () => Promise<Buffer>
}