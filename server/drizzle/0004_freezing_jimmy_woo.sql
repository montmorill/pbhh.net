CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`type` text NOT NULL,
	`actor_username` text NOT NULL,
	`tibi_id` integer NOT NULL,
	`reply_id` integer,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
