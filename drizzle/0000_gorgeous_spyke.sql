CREATE TABLE `interactions` (
	`business_id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_interactions_action` ON `interactions` (`action`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'Neu' NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`priority` integer DEFAULT false NOT NULL,
	`snapshot` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`next_action` text DEFAULT 'Erstkontakt vorbereiten' NOT NULL,
	`follow_up_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_leads_status_updated` ON `leads` (`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_leads_source_id` ON `leads` (`source_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` text,
	`title` text NOT NULL,
	`due_at` text,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_completed_due` ON `tasks` (`completed`,`due_at`);--> statement-breakpoint
CREATE INDEX `idx_tasks_lead_id` ON `tasks` (`lead_id`);