USE scems_db;

ALTER TABLE Queue
  ADD COLUMN QueueStatus ENUM('active','queued') NOT NULL DEFAULT 'queued' AFTER ConfirmationStatus;
