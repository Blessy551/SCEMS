USE scems_db;

-- Demo password for all seeded accounts: admin123
SET @hash = '$2a$10$OO2wQy.K.u84A3xpPBlo5uh1A9Zt4ACm6deaG2x9WKnHibN9LDXT2';

INSERT INTO Users (Name, Email, PasswordHash, Role, Department) VALUES
('Dr. Ramesh Kumar', 'hod.admin@vnrvjiet.in', @hash, 'HOD', 'Administration'),
('Dr. Priya Sharma', 'hod.cse@vnrvjiet.in', @hash, 'HOD', 'CSE'),
('Dr. Anil Reddy', 'hod.ece@vnrvjiet.in', @hash, 'HOD', 'ECE'),
('Dr. Sana Begum', 'hod.mech@vnrvjiet.in', @hash, 'HOD', 'MECH');

INSERT INTO Users (Name, Email, PasswordHash, Role, Department, ClubName) VALUES
('Blessy Karen', 'blessy@vnrvjiet.in', @hash, 'Organiser', 'CSE', 'ACM VNRVJIET'),
('Razzaq Khan', 'razzaq@vnrvjiet.in', @hash, 'Organiser', 'ECE', 'IEEE VNRVJIET'),
('Aditya Singh', 'aditya@vnrvjiet.in', @hash, 'Organiser', 'CSE', 'CodeChef VNRVJIET'),
('Shashanka Rao', 'shashanka@vnrvjiet.in', @hash, 'Organiser', 'MECH', 'ASME VNRVJIET');

INSERT INTO Venues (Name, Block, Floor, Capacity, Type, AvailableResources, OwningDepartment, HOD_UserID) VALUES
('Seminar Hall A', 'B', 'First', 140, 'Seminar Hall', 'Projector,Whiteboard,Mic', 'CSE', 3),
('Seminar Hall B', 'C', 'First', 130, 'Seminar Hall', 'Projector,Whiteboard,PA System', 'ECE', 4),
('Auditorium', 'A', 'Ground', 320, 'Auditorium', 'Projector,Mic,Stage Lighting,PA System', 'Administration', 2),
('Conference Room 1', 'C', 'Second', 55, 'Seminar Hall', 'Display,Whiteboard', 'ECE', 4),
('Conference Room 2', 'E', 'First', 60, 'Classroom', 'Projector,Whiteboard', 'MECH', 5),
('Outdoor Stage', 'D', 'Ground', 900, 'Open Ground', 'PA System,Generator,Lighting', 'Administration', 2);

INSERT INTO BlockedSlots (VenueID, DayOfWeek, StartTime, EndTime, Reason) VALUES
(4, 1, '09:00:00', '11:00:00', 'Lab Practical Class'),
(4, 3, '14:00:00', '16:00:00', 'Lab Practical Class'),
(2, 2, '10:00:00', '11:00:00', 'Department Seminar');

-- Demo notifications (assuming seeded UserIDs: HOD CSE = 3, HOD ECE = 4, Organiser Blessy = 6)
INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES
(3, 'Demo: A booking request for "ACM Hackathon" is awaiting your approval.', 'booking_submitted'),
(4, 'Demo: A booking request for "IEEE Workshop" is awaiting your approval.', 'booking_submitted'),
(6, 'Demo: Your booking request has been received and is pending HOD review.', 'booking_submitted');

