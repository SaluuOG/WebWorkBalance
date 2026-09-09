CREATE TABLE `team_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`kind` text DEFAULT 'Notiz' NOT NULL,
	`lead_id` text,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_team_notes_pinned_updated` ON `team_notes` (`pinned`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_team_notes_lead_id` ON `team_notes` (`lead_id`);--> statement-breakpoint
ALTER TABLE `leads` ADD `claimed_by_id` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `claimed_by_name` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `claimed_at` text;--> statement-breakpoint
CREATE INDEX `idx_leads_claimed_by` ON `leads` (`claimed_by_id`,`claimed_at`);