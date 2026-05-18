import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import Sqids from 'sqids';

@Injectable()
export class SlugService {
  private sqids: Sqids;

  constructor() {
    // We use a fixed salt for consistency across reloads
    this.sqids = new Sqids({
      minLength: 5,
    });
  }

  generateSlug(title: string, id: number): string {
    const thaiSlug = slugify(title, {
      replacement: '-',
      lower: true,
      strict: false, // Keep Thai characters
      locale: 'th',
    });

    const encodedId = this.sqids.encode([id]);
    return `${thaiSlug}-${encodedId}`;
  }

  decodeId(slug: string): number | null {
    const parts = slug.split('-');
    const lastPart = parts.pop();
    if (!lastPart) return null;

    const ids = this.sqids.decode(lastPart);
    return ids.length > 0 ? ids[0] : null;
  }
}
