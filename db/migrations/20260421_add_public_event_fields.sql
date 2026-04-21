USE scems_db;

ALTER TABLE Events
  ADD COLUMN Category VARCHAR(100) NULL AFTER EventType,
  ADD COLUMN RegistrationLink VARCHAR(500) NULL AFTER EndTime,
  ADD COLUMN Instructions TEXT NULL AFTER RegistrationLink,
  ADD COLUMN PosterUrl VARCHAR(500) NULL AFTER Instructions,
  ADD COLUMN IsPublished BOOLEAN NOT NULL DEFAULT FALSE AFTER PosterUrl,
  ADD COLUMN RegistrationDeadline DATETIME NULL AFTER IsPublished;
