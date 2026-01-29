# Attendance System

A simple attendance tracking system built with Firebase and hosted on GitHub Pages.

## Features
- User authentication
- Student attendance tracking
- Class-based organization
- Real-time data synchronization

## Setup Instructions

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firebase Authentication (Email/Password provider)
3. Enable Firestore Database
4. Update the Firebase configuration in the HTML file with your project credentials
5. Add sample data to your Firestore database

## Firebase Collections Required

### Students Collection
```javascript
{
  "name": "Student Name",
  "id": "student_id",
  "class": "class_name"
}
