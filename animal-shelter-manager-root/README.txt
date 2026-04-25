Updated By: Pierce Wexler on 4/24/2026

Currently implementation:

backend     - Endpoints supports create/update/delete functionality for our database as required in phase 5
db          - Includes.sql file
docs        - Associate Images/Diagrams
frontend    - Interface supports connection to backend endpoints, allow user functionality as required in phase 5
reports     - Not yet implemented
roles       - User Roles and Contributions

To run this system from scratch, follow these instructions:
1. Use git clone on the HTTPS or SSH link on the git repository (included in appendix)
2. Install MySQL Server and MySQL Workbench.
3. Access or create a new connection
4. Create a new db to hold the tables (if desired)
5. File -> Open SQL Script (use file in db github folder)
6. Run the script to create tables
7. Insert the sample data used for testing and demonstration (if desired).
8. Set environment variables in.env file in project root according to the README.txt
9. Open the backend project folder and install the required dependencies. (npm install)
10. Configure the database connection settings for the backend.
11. Start the backend server. (node index.js)
12. Open the frontend project folder and install the required dependencies. (npm install)
13. Start the frontend application. (npm run dev)
14. Open the application in a browser and use the graphical interface to manage system data.


###     include in .env file:    ###

JWT_SECRET="A long random string"
DB_HOST="your host (localhost)"
DB_USER="user set in MySQL"
DB_PASSWORD="password set in MySQL"
DB_NAME="name set in MySQL"
DB_PORT="port set in MySQL"

ADMIN_PASS="desired password for admin profile"