export class Post {
  postId: number;
  title: string;
  contentHtml: string;
  contentText: string;
  tags?: any;
  status?: number;
  views?: number;
  slug?: string;
  thumbnailMediaId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
