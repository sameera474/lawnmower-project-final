SAHKA: Smart LawnMower Dashboard
🚀 SAHKA is a modern, responsive web application designed to monitor and manage a smart lawnmower. Featuring real-time data visualization, AI-powered object detection, and interactive user interfaces, it provides an innovative way to enhance the mowing experience.

📋 Table of Contents
Features
Technologies Used
Setup Instructions
Project Structure
Screenshots
Future Enhancements
License
✨ Features
Real-Time Monitoring: Track battery, blade speed, temperature, humidity, and proximity sensors in real-time.
AI Camera Integration: Detect objects with confidence levels and positions using AI.
LiDAR & IMU Data Visualization: Interactive radar charts for LiDAR distances and IMU orientation.
Dynamic Settings: Customize dark mode and user preferences.
History Management: View and manage historical data for insights and analysis.
Responsive Design: Fully functional on both desktop and mobile devices.
🛠 Technologies Used
Frontend: React.js, Material-UI, Chart.js
Backend: Node.js, Express.js
Database: MongoDB
State Management: React Context API
Visualization: React-D3-Speedometer, Chart.js (Line and Radar Charts)
⚙️ Setup Instructions
Prerequisites
Node.js (v16 or higher)
MongoDB (local or cloud)
Git
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/<YOUR_USERNAME>/sahka-dashboard.git
cd sahka-dashboard
Install dependencies:

bash
Copy code
npm install
Set up environment variables:

Create a .env file in the root directory:
plaintext
Copy code
PORT=5000
MONGO_URI=<YOUR_MONGO_CONNECTION_STRING>
API_BASE_URL=http://localhost:5000
Replace <YOUR_MONGO_CONNECTION_STRING> with your MongoDB connection string.
Run the backend server:

bash
Copy code
npm run server
Run the frontend:

bash
Copy code
npm start
Open your browser and navigate to http://localhost:3000.

📂 Project Structure
graphql
Copy code
sahka-dashboard/
├── public/               # Static files
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components (Dashboard, History, etc.)
│   ├── config/           # API base URL configuration
│   ├── context/          # Dark mode and state management
│   ├── App.js            # Main React component
│   ├── index.js          # ReactDOM render
├── server.js             # Backend server
├── models/               # Mongoose schemas (e.g., LawnData)
├── routes/               # Express routes for API
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
📸 Screenshots
Dashboard

History Page

🚀 Future Enhancements
Live Camera Feed: Stream live footage from the AI Camera.
User Authentication: Add login and role-based access control.
Data Analytics: Provide detailed analytics and trends for historical data.
Mobile App: Build a mobile app for better portability.
📜 License
This project is licensed under the MIT License.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Fork the repository.
Create a new branch:
bash
Copy code
git checkout -b feature/your-feature-name
Make your changes and commit them:
bash
Copy code
git commit -m "Add your message here"
Push the changes:
bash
Copy code
git push origin feature/your-feature-name
Open a pull request.
📧 Contact
For any inquiries, reach out to me via:

GitHub: @sameera474
Email: sameera474@gmail.com
