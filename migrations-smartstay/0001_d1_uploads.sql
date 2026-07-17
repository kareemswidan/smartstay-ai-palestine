CREATE TABLE IF NOT EXISTS `ss_uploads` (
	`object_key` text PRIMARY KEY NOT NULL,
	`owner_id` integer NOT NULL,
	`content_type` text NOT NULL,
	`original_name` text NOT NULL,
	`data` blob NOT NULL CHECK(length(`data`) <= 1572864),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `ss_users`(`id`) ON UPDATE no action ON DELETE cascade
);
