-- ======================================
-- DATABASE SCHEMA (SAFE CREATE VERSION)
-- Creates tables only if they do not exist
-- ======================================

-- ======================
-- USERS
-- ======================
CREATE TABLE IF NOT EXISTS app_user (
  userId INT NOT NULL AUTO_INCREMENT,
  fname VARCHAR(45) NOT NULL,
  lname VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  PRIMARY KEY (userId),
  UNIQUE KEY email_UNIQUE (email)
) ENGINE=InnoDB;

-- ======================
-- ROLES
-- ======================
CREATE TABLE IF NOT EXISTS adopter (
  userId INT NOT NULL,
  qualificationNotes LONGTEXT,
  blacklistFlag TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (userId),
  CONSTRAINT adopter_userId
    FOREIGN KEY (userId)
    REFERENCES app_user(userId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff (
  userId INT NOT NULL,
  supervisor INT DEFAULT NULL,
  PRIMARY KEY (userId),
  CONSTRAINT staff_userId
    FOREIGN KEY (userId)
    REFERENCES app_user(userId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS volunteer (
  userId INT NOT NULL,
  supervisor INT NOT NULL,
  PRIMARY KEY (userId),
  CONSTRAINT volunteer_userId
    FOREIGN KEY (userId)
    REFERENCES app_user(userId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================
-- KENNEL + PET
-- ======================
CREATE TABLE IF NOT EXISTS kennel (
  kennelId INT NOT NULL AUTO_INCREMENT,
  roomNo INT NOT NULL,
  occupationStatus VARCHAR(45) NOT NULL,
  PRIMARY KEY (kennelId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet (
  petId INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  dateOfBirth DATE,
  age INT NOT NULL,
  sex VARCHAR(45) NOT NULL,
  kennelId INT NOT NULL,
  breed VARCHAR(45) NOT NULL,
  behavioralNotes LONGTEXT NOT NULL,
  dateOfAdmittance DATE NOT NULL,
  daysInShelter INT NOT NULL,
  specialNotes LONGTEXT NOT NULL,
  status VARCHAR(45) NOT NULL,
  PRIMARY KEY (petId),
  CONSTRAINT pet_kennel
    FOREIGN KEY (kennelId)
    REFERENCES kennel(kennelId)
) ENGINE=InnoDB;

-- ======================
-- RECORDS
-- ======================
CREATE TABLE IF NOT EXISTS record (
  recordId INT NOT NULL AUTO_INCREMENT,
  petId INT NOT NULL,
  dateOfRecord DATETIME(6) NOT NULL,
  recordType VARCHAR(45) NOT NULL,
  notes LONGTEXT,
  PRIMARY KEY (recordId),
  CONSTRAINT record_petId
    FOREIGN KEY (petId)
    REFERENCES pet(petId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS adoption_record (
  recordId INT NOT NULL,
  adopterId INT NOT NULL,
  staffId INT NOT NULL,
  PRIMARY KEY (recordId),
  CONSTRAINT adoptRec_record
    FOREIGN KEY (recordId)
    REFERENCES record(recordId)
    ON DELETE CASCADE,
  CONSTRAINT adoptRec_adopter
    FOREIGN KEY (adopterId)
    REFERENCES adopter(userId)
    ON UPDATE CASCADE,
  CONSTRAINT adoptRec_staff
    FOREIGN KEY (staffId)
    REFERENCES staff(userId)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS foster_record (
  recordId INT NOT NULL,
  status VARCHAR(45) NOT NULL,
  fosterEndDate DATETIME(6) NOT NULL,
  PRIMARY KEY (recordId),
  CONSTRAINT foster_record_fk
    FOREIGN KEY (recordId)
    REFERENCES adoption_record(recordId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medical_record (
  recordId INT NOT NULL,
  institution VARCHAR(45) NOT NULL,
  vet VARCHAR(45) NOT NULL,
  PRIMARY KEY (recordId),
  CONSTRAINT medical_record_fk
    FOREIGN KEY (recordId)
    REFERENCES record(recordId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================
-- ADOPTION REQUESTS
-- ======================
CREATE TABLE IF NOT EXISTS adoption_request (
  requestId INT NOT NULL AUTO_INCREMENT,
  submitterId INT NOT NULL,
  petId INT NOT NULL,
  description LONGTEXT,
  status VARCHAR(45) NOT NULL,
  fufilledBy INT DEFAULT NULL,
  adoptionType VARCHAR(45) NOT NULL,
  PRIMARY KEY (requestId),
  CONSTRAINT adoptReq_submitter
    FOREIGN KEY (submitterId)
    REFERENCES adopter(userId)
    ON DELETE CASCADE,
  CONSTRAINT adoptReq_pet
    FOREIGN KEY (petId)
    REFERENCES pet(petId)
    ON DELETE CASCADE,
  CONSTRAINT adoptReq_fufiller
    FOREIGN KEY (fufilledBy)
    REFERENCES staff(userId)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================
-- EVENTS
-- ======================
CREATE TABLE IF NOT EXISTS event (
  eventId INT NOT NULL AUTO_INCREMENT,
  eventType VARCHAR(45) NOT NULL,
  eventDateTime DATETIME(6) NOT NULL,
  staffId INT DEFAULT NULL,
  volunteerId INT DEFAULT NULL,
  adopterId INT DEFAULT NULL,
  petId INT DEFAULT NULL,
  location VARCHAR(45) NOT NULL,
  PRIMARY KEY (eventId),
  CONSTRAINT event_staff
    FOREIGN KEY (staffId)
    REFERENCES staff(userId)
    ON DELETE SET NULL,
  CONSTRAINT event_adopter
    FOREIGN KEY (adopterId)
    REFERENCES adopter(userId)
    ON DELETE SET NULL,
  CONSTRAINT event_pet
    FOREIGN KEY (petId)
    REFERENCES pet(petId)
    ON DELETE CASCADE
) ENGINE=InnoDB;