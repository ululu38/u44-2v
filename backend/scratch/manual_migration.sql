-- Create media table
CREATE TABLE IF NOT EXISTS "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"url_full" varchar(500) NOT NULL,
	"url_thumb" varchar(500) NOT NULL,
	"blur_hash" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"file_size" integer,
	"created_at" timestamp DEFAULT now()
);


-- Add columns to posts table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='slug') THEN
        ALTER TABLE "posts" ADD COLUMN "slug" varchar(500) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='media_id') THEN
        ALTER TABLE "posts" ADD COLUMN "media_id" integer REFERENCES "media"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='image_alt') THEN
        ALTER TABLE "posts" ADD COLUMN "image_alt" varchar(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='excerpt') THEN
        ALTER TABLE "posts" ADD COLUMN "excerpt" varchar(300);
    END IF;

    -- Add filename to media if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media' AND column_name='filename') THEN
        ALTER TABLE "media" ADD COLUMN "filename" varchar(255);
    END IF;
END $$;

-- Create post_images table for multi-image slider
CREATE TABLE IF NOT EXISTS "post_images" (
    "post_id" integer NOT NULL REFERENCES "posts"("post_id") ON DELETE CASCADE,
    "media_id" integer NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
    "display_order" integer DEFAULT 0,
    CONSTRAINT "post_images_pk" PRIMARY KEY ("post_id", "media_id")
);


