CREATE TABLE `ss_booking_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`property_id` integer NOT NULL,
	`slot_key` text NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `ss_bookings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`property_id`) REFERENCES `ss_properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_booking_slot_unique` ON `ss_booking_slots` (`property_id`,`slot_key`);--> statement-breakpoint
CREATE INDEX `ss_booking_slots_lookup_idx` ON `ss_booking_slots` (`property_id`,`slot_key`);--> statement-breakpoint
CREATE TABLE `ss_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_code` text NOT NULL,
	`property_id` integer NOT NULL,
	`user_id` integer,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`guest_phone` text,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`guests` integer NOT NULL,
	`subtotal` real NOT NULL,
	`service_fee` real NOT NULL,
	`total` real NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`payment_status` text DEFAULT 'demo' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `ss_properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `ss_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_bookings_booking_code_unique` ON `ss_bookings` (`booking_code`);--> statement-breakpoint
CREATE INDEX `ss_bookings_property_idx` ON `ss_bookings` (`property_id`);--> statement-breakpoint
CREATE INDEX `ss_bookings_user_idx` ON `ss_bookings` (`user_id`);--> statement-breakpoint
CREATE TABLE `ss_favorites` (
	`user_id` integer NOT NULL,
	`property_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `ss_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`property_id`) REFERENCES `ss_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_favorite_unique` ON `ss_favorites` (`user_id`,`property_id`);--> statement-breakpoint
CREATE TABLE `ss_properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`name_ar` text,
	`type` text NOT NULL,
	`city` text NOT NULL,
	`city_ar` text,
	`area` text,
	`area_ar` text,
	`address` text,
	`description` text,
	`description_ar` text,
	`price` real NOT NULL,
	`cleaning_fee` real DEFAULT 0 NOT NULL,
	`capacity` integer NOT NULL,
	`bedrooms` integer DEFAULT 1 NOT NULL,
	`bathrooms` integer DEFAULT 1 NOT NULL,
	`latitude` real,
	`longitude` real,
	`status` text DEFAULT 'pending' NOT NULL,
	`instant_book` integer DEFAULT false NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `ss_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_properties_slug_unique` ON `ss_properties` (`slug`);--> statement-breakpoint
CREATE INDEX `ss_properties_owner_idx` ON `ss_properties` (`owner_id`);--> statement-breakpoint
CREATE INDEX `ss_properties_city_idx` ON `ss_properties` (`city`);--> statement-breakpoint
CREATE TABLE `ss_property_amenities` (
	`property_id` integer NOT NULL,
	`amenity` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `ss_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_property_amenity_unique` ON `ss_property_amenities` (`property_id`,`amenity`);--> statement-breakpoint
CREATE TABLE `ss_property_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`url` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `ss_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ss_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `ss_properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `ss_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_review_unique` ON `ss_reviews` (`property_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `ss_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `ss_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_sessions_token_hash_unique` ON `ss_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `ss_sessions_token_idx` ON `ss_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `ss_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`role` text NOT NULL,
	`phone` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ss_users_email_unique` ON `ss_users` (`email`);