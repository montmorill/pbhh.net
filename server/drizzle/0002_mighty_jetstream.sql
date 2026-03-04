CREATE TABLE `tibi_likes` (
	`tibi_id` integer NOT NULL,
	`username` text NOT NULL,
	PRIMARY KEY(`tibi_id`, `username`),
	FOREIGN KEY (`tibi_id`) REFERENCES `tibis`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tibis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`username` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
