CREATE TABLE `emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`from_address` text NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`html` text DEFAULT '' NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
