export enum HashtagCategory {
  TECH = 'Tech',
  DESIGN = 'Design',
  NEWS = 'News',
  UPDATE = 'Update',
  EVENT = 'Event',
  SOLUTION = 'Solution',
  PROJECT = 'Project',
  ARTICLE = 'Article',
}

export class Hashtag {
  id: number;
  name: string;
  usageCount: number;
  category?: HashtagCategory;
  createdAt?: Date;
  updatedAt?: Date;
}
