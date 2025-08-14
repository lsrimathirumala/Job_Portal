# Job_Portal

![License](https://img.shields.io/badge/license-MIT-green)  
![Node.js](https://img.shields.io/badge/Node.js-14%2B-brightgreen)  
![MongoDB](https://img.shields.io/badge/MongoDB-Database-blue)  
![JWT](https://img.shields.io/badge/Auth-JWT-orange)  
![Contributions Welcome](https://img.shields.io/badge/PRs-welcome-blue)  

---

## Table of Contents
- [About](#about)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
  - [Running the App](#running-the-app)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## About  
**Job_Portal** is a full-stack web application that connects recruiters and job seekers.  
Recruiters can post job listings and manage applicants, while job seekers can search for jobs and submit applications directly through the platform.

---

## Features  
- User authentication and authorization using **JWT**  
- Role-based access for recruiters and job seekers  
- Recruiters can create, update, and delete job postings  
- Job seekers can browse, search, and apply for jobs  
- Resume upload functionality  
- Email notifications for applications  
- Secure backend with form validation and error handling  
- Responsive frontend for both desktop and mobile

---

## Tech Stack  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js  
- **Database:** MongoDB  
- **Authentication:** JWT (JSON Web Token)

---

## Getting Started

### Prerequisites  
Before running this project, ensure you have:
- [Node.js](https://nodejs.org/) v14+ installed  
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)  
- npm (comes with Node.js)

---

## Installation  

Clone the repository:
```bash
git clone https://github.com/lsrimathirumala/Job_Portal.git
cd Job_Portal
```

Install backend dependencies:
```bash
npm install
```

If you have a separate frontend directory, install its dependencies as well:
```bash
cd frontend
npm install
```
---

## Environment Variables

Create a .env file in the root directory and add the following:
```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```
---

## Running the App

Start the backend:
```
npm run dev
```

If using a separate frontend:
```
cd frontend
npm start
```
---

### Usage

Sign Up / Log In as a recruiter or job seeker.

Recruiters:

- Post new job listings with title, description, requirements, and salary.

- Manage job postings (edit/delete).

- View applicants and download resumes.

Job Seekers:

- Browse and search job listings.

- Apply for jobs by uploading resumes and submitting applications.


## Contributing

Contributions are welcome!
To contribute:

Fork the repository

Create a feature branch:
```
git checkout -b feature/your-feature
```

Commit your changes and push the branch:
```
git push origin feature/your-feature
```

Open a pull request

## License

This project is licensed under the MIT License.

## Contact

GitHub: lsrimathirumala

Email: your.email@example.com
