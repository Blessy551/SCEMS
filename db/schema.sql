CREATE DATABASE IF NOT EXISTS scems_db;
USE scems_db;

CREATE TABLE Users (
  UserID        INT AUTO_INCREMENT PRIMARY KEY,
  Name          VARCHAR(100) NOT NULL,
  Email         VARCHAR(150) NOT NULL UNIQUE,
  PasswordHash  VARCHAR(255) NOT NULL,
  Role          ENUM('Organiser','HOD') NOT NULL,
  Department    VARCHAR(100),
  ClubName      VARCHAR(100),
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Venues (
  VenueID             INT AUTO_INCREMENT PRIMARY KEY,
  Name                VARCHAR(100) NOT NULL,
  Block               VARCHAR(20),
  Floor               VARCHAR(20),
  Capacity            INT NOT NULL,
  Type                ENUM('Auditorium','Lab','Seminar Hall','Open Ground','Classroom') NOT NULL,
  AvailableResources  TEXT,
  OwningDepartment    VARCHAR(100),
  HOD_UserID          INT,
  FOREIGN KEY (HOD_UserID) REFERENCES Users(UserID)
);

CREATE TABLE BlockedSlots (
  SlotID        INT AUTO_INCREMENT PRIMARY KEY,
  VenueID       INT NOT NULL,
  DayOfWeek     TINYINT,
  SpecificDate  DATE,
  StartTime     TIME NOT NULL,
  EndTime       TIME NOT NULL,
  Reason        VARCHAR(255),
  FOREIGN KEY (VenueID) REFERENCES Venues(VenueID)
);

CREATE TABLE BookingRequests (
  RequestID           INT AUTO_INCREMENT PRIMARY KEY,
  OrganizerID         INT NOT NULL,
  VenueID             INT NOT NULL,
  EventName           VARCHAR(200) NOT NULL,
  EventType           VARCHAR(100),
  ExpectedAudience    INT,
  ResourcesRequired   TEXT,
  RequestedDate       DATE NOT NULL,
  StartTime           TIME NOT NULL,
  EndTime             TIME NOT NULL,
  Status              ENUM('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  SubmittedAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
  LastEditedAt        DATETIME,
  HOD_Remarks         TEXT,
  CancellationReason  TEXT,
  IsLateCancellation  BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (OrganizerID) REFERENCES Users(UserID),
  FOREIGN KEY (VenueID) REFERENCES Venues(VenueID)
);

CREATE TABLE Queue (
  QueueID               INT AUTO_INCREMENT PRIMARY KEY,
  VenueID               INT NOT NULL,
  RequestedDate         DATE NOT NULL,
  StartTime             TIME NOT NULL,
  EndTime               TIME NOT NULL,
  OrganizerID           INT NOT NULL,
  QueuePosition         INT NOT NULL,
  SubmittedAt           DATETIME DEFAULT CURRENT_TIMESTAMP,
  ConfirmationDeadline  DATETIME,
  ConfirmationStatus    ENUM('Pending','Confirmed','Expired','Withdrawn') DEFAULT 'Pending',
  QueueStatus           ENUM('active','queued') DEFAULT 'queued',
  FOREIGN KEY (VenueID) REFERENCES Venues(VenueID),
  FOREIGN KEY (OrganizerID) REFERENCES Users(UserID)
);

CREATE TABLE Events (
  EventID      INT AUTO_INCREMENT PRIMARY KEY,
  RequestID    INT NOT NULL UNIQUE,
  VenueID      INT NOT NULL,
  OrganizerID  INT NOT NULL,
  EventName    VARCHAR(200) NOT NULL,
  EventType    VARCHAR(100),
  Category     VARCHAR(100),
  EventDate    DATE NOT NULL,
  StartTime    TIME NOT NULL,
  EndTime      TIME NOT NULL,
  RegistrationLink      VARCHAR(500),
  Instructions          TEXT,
  PosterUrl             VARCHAR(500),
  IsPublished           BOOLEAN DEFAULT FALSE,
  RegistrationDeadline  DATETIME,
  Status       ENUM('Upcoming','Completed','Cancelled') DEFAULT 'Upcoming',
  FOREIGN KEY (RequestID) REFERENCES BookingRequests(RequestID),
  FOREIGN KEY (VenueID) REFERENCES Venues(VenueID),
  FOREIGN KEY (OrganizerID) REFERENCES Users(UserID)
);

CREATE TABLE Notifications (
  NotifID          INT AUTO_INCREMENT PRIMARY KEY,
  RecipientUserID  INT NOT NULL,
  Message          TEXT NOT NULL,
  Type             VARCHAR(50),
  IsRead           BOOLEAN DEFAULT FALSE,
  CreatedAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (RecipientUserID) REFERENCES Users(UserID)
);

CREATE TABLE Feedback (
  FeedbackID               INT AUTO_INCREMENT PRIMARY KEY,
  EventID                  INT NOT NULL,
  OrganizerID              INT NOT NULL,
  VenueRating              TINYINT CHECK (VenueRating BETWEEN 1 AND 5),
  ResourceRating           TINYINT CHECK (ResourceRating BETWEEN 1 AND 5),
  HODResponsivenessRating  TINYINT CHECK (HODResponsivenessRating BETWEEN 1 AND 5),
  Comments                 TEXT,
  SubmittedAt              DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_feedback_event_organizer (EventID, OrganizerID),
  FOREIGN KEY (EventID) REFERENCES Events(EventID),
  FOREIGN KEY (OrganizerID) REFERENCES Users(UserID)
);

CREATE TABLE AuditLog (
  LogID             INT AUTO_INCREMENT PRIMARY KEY,
  ActorUserID       INT,
  ActorRole         VARCHAR(20),
  ActionType        VARCHAR(50) NOT NULL,
  TargetEntityType  VARCHAR(50),
  TargetEntityID    INT,
  Timestamp         DATETIME DEFAULT CURRENT_TIMESTAMP,
  AdditionalDetails JSON,
  INDEX idx_ts (Timestamp),
  INDEX idx_actor (ActorUserID)
);
