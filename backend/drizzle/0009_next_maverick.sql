ALTER TABLE "posts" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE integer USING (
  CASE 
    WHEN "status" = 'draft' THEN 2
    ELSE 1
  END
);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 1;