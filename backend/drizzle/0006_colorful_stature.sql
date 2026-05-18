ALTER TABLE "posts" RENAME COLUMN "media_id" TO "thumbnail_media_id";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_media_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_media_id_media_id_fk" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;