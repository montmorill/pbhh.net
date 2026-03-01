CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`password` text NOT NULL,
	`avatar` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);