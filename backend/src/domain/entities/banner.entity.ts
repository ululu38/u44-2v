export class Banner {
  id: number;
  name: string;
  mediaId?: number;
  linkUrl?: string;
  status: number; // 1 = public, 0 = draft
  createdAt?: Date;
  updatedAt?: Date;
}
