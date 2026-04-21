USE scems_db;

-- Demo password for all seeded accounts: admin123
SET @hash = '$2a$10$OO2wQy.K.u84A3xpPBlo5uh1A9Zt4ACm6deaG2x9WKnHibN9LDXT2';

INSERT INTO Users (Name, Email, PasswordHash, Role) VALUES
('Dr. Principal Admin', 'principal@vnrvjiet.in', @hash, 'Principal');

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
('KS Auditorium', 'A', 'Ground', 300, 'Auditorium', 'Projector,Mic,Stage Lighting,PA System', 'Administration', 2),
('B Block Seminar Hall', 'B', 'First', 150, 'Seminar Hall', 'Projector,Whiteboard,Mic', 'CSE', 3),
('ECE Conference Room', 'C', 'Second', 60, 'Seminar Hall', 'Projector,Whiteboard', 'ECE', 4),
('CSE Lab 301', 'C', 'Third', 45, 'Lab', 'Systems,Projector', 'CSE', 3),
('Open Ground', 'D', 'Ground', 800, 'Open Ground', 'PA System,Generator', 'Administration', 2),
('MECH Design Studio', 'E', 'First', 80, 'Classroom', 'Projector,Whiteboard', 'MECH', 5);

INSERT INTO BlockedSlots (VenueID, DayOfWeek, StartTime, EndTime, Reason) VALUES
(4, 1, '09:00:00', '11:00:00', 'Lab Practical Class'),
(4, 3, '14:00:00', '16:00:00', 'Lab Practical Class'),
(2, 2, '10:00:00', '11:00:00', 'Department Seminar');
