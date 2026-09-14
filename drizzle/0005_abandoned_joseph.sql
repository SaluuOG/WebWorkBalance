CREATE TABLE `design_memory` (
	`style_key` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_design_memory_created` ON `design_memory` (`created_at`);