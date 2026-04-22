USE scems_db;

-- Demo password for all seeded accounts: admin123
SET @hash = '$2a$10$OO2wQy.K.u84A3xpPBlo5uh1A9Zt4ACm6deaG2x9WKnHibN9LDXT2';

-- 1. SEED USERS
-- Existing users
INSERT IGNORE INTO Users (Name, Email, PasswordHash, Role, Department) VALUES
('Dr. Ramesh Kumar', 'hod.admin@vnrvjiet.in', @hash, 'HOD', 'Administration'),
('Dr. Priya Sharma', 'hod.cse@vnrvjiet.in', @hash, 'HOD', 'CSE'),
('Dr. Anil Reddy', 'hod.ece@vnrvjiet.in', @hash, 'HOD', 'ECE'),
('Dr. Sana Begum', 'hod.mech@vnrvjiet.in', @hash, 'HOD', 'MECH');

INSERT IGNORE INTO Users (Name, Email, PasswordHash, Role, Department, ClubName) VALUES
('Blessy Karen', 'blessy@vnrvjiet.in', @hash, 'Organiser', 'CSE', 'ACM VNRVJIET'),
('Razzaq Khan', 'razzaq@vnrvjiet.in', @hash, 'Organiser', 'ECE', 'IEEE VNRVJIET'),
('Aditya Singh', 'aditya@vnrvjiet.in', @hash, 'Organiser', 'CSE', 'CodeChef VNRVJIET'),
('Shashanka Rao', 'shashanka@vnrvjiet.in', @hash, 'Organiser', 'MECH', 'ASME VNRVJIET');

-- New users requested (Rahul and Priya)
INSERT IGNORE INTO Users (Name, Email, PasswordHash, Role, Department, ClubName) VALUES
('Rahul', 'organiser@test.com', @hash, 'Organiser', 'IT', 'GDSC VNRVJIET'),
('Priya', 'hod@test.com', @hash, 'HOD', 'IT', NULL);

-- Get User IDs for reference in subsequent inserts
SET @organiser_id = (SELECT UserID FROM Users WHERE Email = 'organiser@test.com');
SET @hod_id = (SELECT UserID FROM Users WHERE Email = 'hod@test.com');

-- 2. SEED VENUES
-- Existing venues
INSERT IGNORE INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID) VALUES
('Seminar Hall A', 'B', 'First', 140, 'Seminar Hall', 'Projector,Whiteboard,Mic', 'CSE', 2),
('Seminar Hall B', 'C', 'First', 130, 'Seminar Hall', 'Projector,Whiteboard,PA System', 'ECE', 3),
('Auditorium', 'A', 'Ground', 320, 'Auditorium', 'Projector,Mic,Stage Lighting,PA System', 'Administration', 1),
('Conference Room 1', 'C', 'Second', 55, 'Seminar Hall', 'Display,Whiteboard', 'ECE', 3),
('Conference Room 2', 'E', 'First', 60, 'Classroom', 'Projector,Whiteboard', 'MECH', 4),
('Outdoor Stage', 'D', 'Ground', 900, 'Open Ground', 'PA System,Generator,Lighting', 'Administration', 1);

-- New venues requested
INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'KS Auditorium', 'A', 'Ground', 300, 'Auditorium', 'Projector, Mic, PA System', 'Administration', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'KS Auditorium');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'B Block Seminar Hall', 'B', 'First', 150, 'Seminar Hall', 'Projector, Whiteboard', 'IT', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'B Block Seminar Hall');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'E Block Seminar Hall', 'E', 'Second', 150, 'Seminar Hall', 'Projector, AC', 'CSE', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'E Block Seminar Hall');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'IT department Labs', 'B', 'Third', 200, 'Lab', 'Computers, High-speed Internet', 'IT', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'IT department Labs');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'CSE department Labs', 'E', 'First', 200, 'Lab', 'Computers, Projector', 'CSE', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'CSE department Labs');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'Open Air Ground', 'D', 'Ground', 1000, 'Open Ground', 'Stage, Lighting, Power', 'Administration', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'Open Air Ground');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID)
SELECT 'APJ Abdul Kalam Auditorium', 'C', 'Ground', 200, 'Auditorium', 'Projector, Audio System', 'CSE', @hod_id
WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE Name = 'APJ Abdul Kalam Auditorium');

-- Get Venue IDs
SET @venue1 = (SELECT VenueID FROM Venues WHERE Name = 'KS Auditorium');
SET @venue2 = (SELECT VenueID FROM Venues WHERE Name = 'B Block Seminar Hall');
SET @venue3 = (SELECT VenueID FROM Venues WHERE Name = 'E Block Seminar Hall');
SET @venue4 = (SELECT VenueID FROM Venues WHERE Name = 'IT department Labs');
SET @venue5 = (SELECT VenueID FROM Venues WHERE Name = 'CSE department Labs');

-- 3. SEED BOOKING REQUESTS (3 Pending, 2 Approved)
-- Pending Requests
INSERT INTO BookingRequests (OrganizerID, VenueID, EventName, EventType, ExpectedAudience, RequestedDate, StartTime, EndTime, Status)
SELECT @organiser_id, @venue1, 'Hackathon 2024', 'Technical', 250, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '09:00:00', '18:00:00', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM BookingRequests WHERE EventName = 'Hackathon 2024');

INSERT INTO BookingRequests (OrganizerID, VenueID, EventName, EventType, ExpectedAudience, RequestedDate, StartTime, EndTime, Status)
SELECT @organiser_id, @venue2, 'Guest Lecture on AI', 'Educational', 100, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00', '12:00:00', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM BookingRequests WHERE EventName = 'Guest Lecture on AI');

INSERT INTO BookingRequests (OrganizerID, VenueID, EventName, EventType, ExpectedAudience, RequestedDate, StartTime, EndTime, Status)
SELECT @organiser_id, @venue4, 'Web Dev Workshop', 'Technical', 150, DATE_ADD(CURDATE(), INTERVAL 15 DAY), '09:00:00', '16:00:00', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM BookingRequests WHERE EventName = 'Web Dev Workshop');

-- Approved Requests
INSERT INTO BookingRequests (OrganizerID, VenueID, EventName, EventType, ExpectedAudience, RequestedDate, StartTime, EndTime, Status)
SELECT @organiser_id, @venue3, 'Cultural Fest Prep', 'Cultural', 100, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '17:00:00', 'Approved'
WHERE NOT EXISTS (SELECT 1 FROM BookingRequests WHERE EventName = 'Cultural Fest Prep');

INSERT INTO BookingRequests (OrganizerID, VenueID, EventName, EventType, ExpectedAudience, RequestedDate, StartTime, EndTime, Status)
SELECT @organiser_id, @venue5, 'Placement Drive', 'Corporate', 200, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00:00', '17:00:00', 'Approved'
WHERE NOT EXISTS (SELECT 1 FROM BookingRequests WHERE EventName = 'Placement Drive');

-- 4. SEED EVENTS (For Approved Requests)
SET @req_approved1 = (SELECT RequestID FROM BookingRequests WHERE EventName = 'Cultural Fest Prep');
SET @req_approved2 = (SELECT RequestID FROM BookingRequests WHERE EventName = 'Placement Drive');

INSERT INTO Events (RequestID, VenueID, OrganizerID, EventName, EventType, EventDate, StartTime, EndTime, Status, IsPublished, Category, RegistrationLink, Instructions, RegistrationDeadline)
SELECT @req_approved1, @venue3, @organiser_id, 'Cultural Fest Prep', 'Cultural', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '17:00:00', 'Upcoming', TRUE, 'Workshop', 'https://example.com/register-cult', 'Bring your college ID cards for entry.', DATE_ADD(CURDATE(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM Events WHERE RequestID = @req_approved1);

INSERT INTO Events (RequestID, VenueID, OrganizerID, EventName, EventType, EventDate, StartTime, EndTime, Status, IsPublished, Category, RegistrationLink, Instructions, RegistrationDeadline)
SELECT @req_approved2, @venue5, @organiser_id, 'Placement Drive', 'Corporate', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00:00', '17:00:00', 'Upcoming', TRUE, 'Recruitment', 'https://example.com/register-place', 'Formal attire is mandatory for all participants.', DATE_ADD(CURDATE(), INTERVAL 6 DAY)
WHERE NOT EXISTS (SELECT 1 FROM Events WHERE RequestID = @req_approved2);

-- 5. SEED NOTIFICATIONS
INSERT INTO Notifications (RecipientUserID, Message, Type)
SELECT @hod_id, 'New booking request pending approval for "Hackathon 2024"', 'booking_submitted'
WHERE NOT EXISTS (SELECT 1 FROM Notifications WHERE RecipientUserID = @hod_id AND Message LIKE '%Hackathon 2024%');

INSERT INTO Notifications (RecipientUserID, Message, Type)
SELECT @hod_id, 'New booking request pending approval for "Guest Lecture on AI"', 'booking_submitted'
WHERE NOT EXISTS (SELECT 1 FROM Notifications WHERE RecipientUserID = @hod_id AND Message LIKE '%Guest Lecture on AI%');

-- Demo notifications for other users
INSERT INTO Notifications (RecipientUserID, Message, Type)
SELECT UserID, 'Demo: A booking request is awaiting your review.', 'booking_submitted'
FROM Users WHERE Role = 'HOD' AND Email != 'hod@test.com'
AND NOT EXISTS (SELECT 1 FROM Notifications WHERE RecipientUserID = Users.UserID AND Type = 'booking_submitted');

