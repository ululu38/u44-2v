export class Media {
  id: number;
  filename: string;
  urlFull: string;
  urlThumb: string;
  urlMini: string;
  blurHash: string;
  width: number;
  height: number;
  fileSize?: number | null;
  createdAt?: Date | null;
}
