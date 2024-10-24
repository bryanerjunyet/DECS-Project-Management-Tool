# DECS Project Management Tool

## Project Overview
The **DECS Project Management Tool** is a comprehensive software solution developed by **DECS Co.** to modernize project management practices by adopting the **Agile methodology**, specifically the **Scrum framework**. This tool helps companies transition from traditional paper-based systems to a digital, efficient, and cost-effective platform that enhances workflow efficiency, team collaboration, and task management.

## Project Vision
Our vision is to deliver a **user-friendly**, **affordable**, and **scalable** project management tool that enables teams to manage projects with ease. With a focus on **Agile** and **Scrum** methodologies, the DECS Project Management Tool is designed for:
- **Product Backlog Management**
- **Task Assignment and Tracking**
- **Sprint Planning**
- **Transparent Team Collaboration**

This tool is perfect for businesses seeking to streamline their project management processes and improve team productivity.

## Our DECS Co. Team
- **Er Jun Yet**  
  *Product Owner*  
  - Role: Frontend Developer 
  - Email: jerr0005@student.monash.edu  
  - Phone: +60 17 891 1531

- **Irdeena Ixora Ismas**  
  *Scrum Master*  
  - Role: Frontend Developer 
  - Email: imoh0022@student.monash.edu  
  - Phone: +60 19 206 2757

- **Chung Su Suen**  
  *UI/UX Specialist*  
  - Role: Frontend Developer
  - Email: schu0099@student.monash.edu  
  - Phone: +60 16 447 3557

- **Dylan Wong Zhen Ning**  
  *Technical Specialist* 
  - Role: Database Manager  
  - Email: dwon0028@student.monash.edu  
  - Phone: +60 14 395 1733

- **Boo Yeu Rou**  
  *QA/QC Specialist*  
  - Role: Backend Developer
  - Email: yboo0003@student.monash.edu  
  - Phone: +60 16 721 1860

## Sprint 1 Goal
The goal of Sprint 1 is to develop the Product Backlog Page, enabling users to easily manage tasks through add, view, save, edit, and delete functionalities, while also providing sorting, filtering, and a dynamic card layout for improved task visibility and prioritization.

## Sprint 2 Goal
The goal of Sprint 2 is to develop a robust Sprint Backlog Page with drag-and-drop functionality, enhance task tracking through a Kanban Board Page, implement a secure Login Page, and refine the Product Backlog Page by refactoring the codebase for scalability and React integration.

## Sprint 3 Goal
The goal of Sprint 3 is to develop a Team Board with distinct views for admins and members. Admins will be able to add new team member and manage them by selecting dates to view active members, viewing member details, reassigning tasks upon deletion, and accessing an effort graph. Members will be able to view their own work data and effort. Additionally, the sprint includes non-functional features such as zoom functionality, security questions for admin login, and customizable backgrounds for users.

## How to Run the Project

### 1. Navigate to the Relative Path
To run the development server, change directory to the relative path by running either of these two commands:</br>
1. deployment version (demonstrated to client)
```bash
cd decsco_tool_deployed
```
2. Database version (requires database server to be running)
```bash
cd decsco_tool
```
### 2. Install Dependencies
Make sure you have **Node.js** installed. Then run the following command to install the necessary packages:
```bash
npm install
```
### 3. Run the Development Server
To start the development server and view the project locally, run the following command:
```bash
npm run dev
```
The development server will start, and you can access the application in your browser at http://localhost:5173/.

## How to Run the Database server
### 1. Set up the PostgreSQL database
Make sure you have **PostgreSQL** and **pgAdmin4** installed.<br/>
To set up the database, execute the schema instructions in the schema files located in the decsco_server folder:<br/>
1. Open pgAdmin4, select postgres in the Object Explorer and open the PSQL terminal.<br/>
2. Run the CREATE DATABASE command in the database_creation.sql schema file<br/>
3. Navigate to the newly created database using the following command:
```bash
\c project_manager
```
4. Run the commands in the projectmanager_db.sql schema file

### 2. Set up the database server
Add your PostgreSQL credentials and settings to the database.js file in the decsco_server folder

### 3. Navigate to the Relative Path
To run the database server, change directory to the relative path by running the command:
```bash
cd decsco_server
```

### 4. Install Dependencies
Make sure you have **Node.js** installed. Then run the following command to install the necessary packages:
```bash
npm install
```

### 4. Run the database server
To start the database server and connect it to the application, run the following command:
```bash
node server.js
```
The database server will start and will automatically be connected to the application

## Key Features
The DECS Project Management Tool will include the following main features:

- **Product Backlog Management  [COMPLETION: 100%]**
  - Task creation, editing, deletion, and prioritization with tags and filters.
- **Sprint Board                [COMPLETION: 100%]**
  - Management of sprint planning, sprint names, dates, and Kanban board integration.
- **Team Board                  [COMPLETION: 100%]**
  - Team management, including task assignments and team effort monitoring.
- **User Access Management      [COMPLETION: 100%]**
  - Differentiated access levels for staff and administrators.

## Technical Stack
This project is built using the PERN stack, which consists of:
- **PostgreSQL** (Database)
- **Express.js** (Backend Framework)
- **React.js** (Frontend Framework)
- **Node.js** (Runtime Environment)

## Contact Information
For any further queries or support, please reach out to any of the DECS Co. members through their respective emails listed above.



