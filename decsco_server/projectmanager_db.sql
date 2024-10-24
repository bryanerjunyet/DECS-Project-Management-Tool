/***
    Main Schema to initialize the project manager database
    v.01
***/

/**
    Table creation
**/
-- User tables
CREATE TABLE SysUser(
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) UNIQUE NOT NULL,
    role_id INT NOT NULL,
    hashed_password VARCHAR(64) NOT NULL,
    password_salt VARCHAR(32) NOT NULL
);

CREATE TABLE Role(
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

-- Task-related tables
CREATE TABLE Task(
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description VARCHAR(1024),
    user_id INT,
    story_point INT NOT NULL CHECK (story_point >= 1 AND story_point <= 10),
    taskpriority_id INT NOT NULL,
    tasktype_id INT NOT NULL,
    taskstage_id INT NOT NULL,
    taskstatus_id INT NOT NULL
);

CREATE TABLE TaskPriority(
    taskpriority_id SERIAL PRIMARY KEY,
    priority_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE TaskType(
    tasktype_id SERIAL PRIMARY KEY,
    type_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE TaskStage(
    taskstage_id SERIAL PRIMARY KEY,
    stage_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE TaskStatus(
    taskstatus_id SERIAL PRIMARY KEY,
    status_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE TaskTag(
    tasktag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE JT_TaskTags(
    jt_tasktags_id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    tasktag_id INT NOT NULL,
    UNIQUE(task_id, tasktag_id)
);

CREATE TABLE JT_TaskHistory(
    jt_taskhistory_id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    histentry_id INT NOT NULL,
    UNIQUE(task_id, histentry_id)
);

-- Task History tables
CREATE TABLE HistoryEntry(
    histentry_id SERIAL PRIMARY KEY,
    description VARCHAR(1024) NOT NULL,
    user_id INT,
    histentry_date TIMESTAMP NOT NULL,
    histentrystatus_id INT NOT NULL
);

CREATE TABLE HistoryEntryStatus(
    histentrystatus_id SERIAL PRIMARY KEY,
    status_name VARCHAR(255) UNIQUE NOT NULL
);

-- Sprint tables
CREATE TABLE Sprint(
    sprint_id SERIAL PRIMARY KEY,
    sprint_name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    sprintstatus_id INT NOT NULL
);

CREATE TABLE SprintStatus(
    sprintstatus_id SERIAL PRIMARY KEY,
    status_name VARCHAR(255) UNIQUE NOT NULL
);

-- Sprint Backlog/Kanban Board tables
CREATE TABLE JT_SprintTask(
    jt_sprinttask_id SERIAL PRIMARY KEY,
    sprint_id INT NOT NULL,
    task_id INT UNIQUE NOT NULL
);

CREATE TABLE JT_UserTime(
    jt_usertime_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    time_taken INT NOT NULL,
    datetime TIMESTAMP NOT NULL
);

CREATE TABLE SecurityQuestion(
    securityquestion_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    question VARCHAR(1024) NOT NULL,
    answer VARCHAR(1024) NOT NULL
);

/**
    Foreign key assignments
**/
-- Task
ALTER TABLE Task 
    ADD CONSTRAINT task_sysuser_fk FOREIGN KEY (user_id)
        REFERENCES SysUser (user_id)
            ON DELETE SET NULL;

ALTER TABLE Task 
    ADD CONSTRAINT task_priority_fk FOREIGN KEY (taskpriority_id)
        REFERENCES TaskPriority (taskpriority_id)
            ON DELETE RESTRICT;

ALTER TABLE Task 
    ADD CONSTRAINT task_type_fk FOREIGN KEY (tasktype_id)
        REFERENCES TaskType (tasktype_id)
            ON DELETE RESTRICT;

ALTER TABLE Task 
    ADD CONSTRAINT task_stage_fk FOREIGN KEY (taskstage_id)
        REFERENCES TaskStage (taskstage_id)
            ON DELETE RESTRICT;

ALTER TABLE Task 
    ADD CONSTRAINT task_status_fk FOREIGN KEY (taskstatus_id)
        REFERENCES TaskStatus (taskstatus_id)
            ON DELETE RESTRICT;

-- JT TaskTags (for Task)
ALTER TABLE JT_TaskTags 
    ADD CONSTRAINT jt_tasktags_task_fk FOREIGN KEY (task_id)
        REFERENCES Task (task_id)
            ON DELETE CASCADE;

ALTER TABLE JT_TaskTags 
    ADD CONSTRAINT jt_tasktags_tasktag_fk FOREIGN KEY (tasktag_id)
        REFERENCES TaskTag (tasktag_id)
            ON DELETE CASCADE;

-- HistoryEntry
ALTER TABLE HistoryEntry
    ADD CONSTRAINT histentry_status_fk FOREIGN KEY (histentrystatus_id)
        REFERENCES HistoryEntryStatus (histentrystatus_id)
            ON DELETE RESTRICT;

ALTER TABLE HistoryEntry
    ADD CONSTRAINT histentry_sysuser_fk FOREIGN KEY (user_id)
        REFERENCES SysUser(user_id)
            ON DELETE SET NULL;

-- JT TaskHistory (for Task)
ALTER TABLE JT_TaskHistory
    ADD CONSTRAINT jt_taskhistory_task_fk FOREIGN KEY (task_id)
        REFERENCES Task (task_id)
            ON DELETE CASCADE;

ALTER TABLE JT_TaskHistory
    ADD CONSTRAINT jt_taskhistory_histentry_fk FOREIGN KEY (histentry_id)
        REFERENCES HistoryEntry (histentry_id)
            ON DELETE CASCADE;

-- Sprints
ALTER TABLE Sprint
    ADD CONSTRAINT sprint_sprintstatus_fk FOREIGN KEY (sprintstatus_id)
        REFERENCES SprintStatus (sprintstatus_id)
            ON DELETE RESTRICT;

-- JT SprintTask (for Sprints)
ALTER TABLE JT_SprintTask
    ADD CONSTRAINT jt_sprinttask_sprint_fk FOREIGN KEY (sprint_id)
        REFERENCES Sprint (sprint_id)
            ON DELETE CASCADE;

ALTER TABLE JT_SprintTask
    ADD CONSTRAINT jt_sprinttask_task_fk FOREIGN KEY (task_id)
        REFERENCES Task (task_id)
            ON DELETE CASCADE;

-- JT_UserTime
ALTER TABLE JT_UserTime
    ADD CONSTRAINT jt_usertime_user_fk FOREIGN KEY (user_id)
        REFERENCES SysUser (user_id)
            ON DELETE CASCADE;

ALTER TABLE JT_UserTime
    ADD CONSTRAINT jt_usertime_task_fk FOREIGN KEY (task_id)
        REFERENCES Task (task_id)
            ON DELETE CASCADE;

-- SecurityQuestion
ALTER TABLE SecurityQuestion
    ADD CONSTRAINT securityquestion_sysuser_fk FOREIGN KEY (user_id)
        REFERENCES SysUser (user_id)
            ON DELETE CASCADE;

/**
    Data insertion
**/
-- Task priority
INSERT INTO TaskPriority (priority_name)
    VALUES
        ('Low'),
        ('Medium'),
        ('High'),
        ('Urgent');

-- Task type
INSERT INTO TaskType (type_name)
    VALUES
        ('Story'),
        ('Bug');

-- Task stage
INSERT INTO TaskStage (stage_name)
    VALUES
        ('Planning'),
        ('Development'),
        ('Testing'),
        ('Integration');

-- Task status
INSERT INTO TaskStatus (status_name)
    VALUES
        ('To Do'),
        ('In Progress'),
        ('Completed');

-- Task tags
INSERT INTO TaskTag (tag_name)
    VALUES
        ('Frontend'),
        ('UI/UX'),
        ('Backend'),
        ('Database'),
        ('Testing'),
        ('API');

-- Sprint status
INSERT INTO SprintStatus(status_name)
    VALUES
        ('Not Started'),
        ('Started'),
        ('Completed');

-- User roles
INSERT INTO Role(role_name)
    VALUES
        ('Team Member'),
        ('Admin');

-- Task History status
INSERT INTO HistoryEntryStatus(status_name)
    VALUES
        ('Created'),
        ('Modified'),
        ('Completed');

-- Admin account
INSERT INTO SysUser(user_name, role_id, hashed_password, password_salt)
    VALUES
        ('Admin', 2, 'd33ee5cb28906f7ab1b9001aa6e28debc27ce59d3e64f0ad58054062d032c25d', '59eb2a63b7723435045a4f9bdddf5522');