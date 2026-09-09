CREATE TABLE `master_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`business_name` text NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`mode` text NOT NULL,
	`variant` integer DEFAULT 0 NOT NULL,
	`settings` text NOT NULL,
	`fingerprint` text NOT NULL,
	`prompt` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_master_prompts_lead_created` ON `master_prompts` (`lead_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_master_prompts_author_id` ON `master_prompts` (`author_id`);