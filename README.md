# Attendance System - Firebase & GitHub Only

A complete attendance tracking system built with Firebase and hosted on GitHub Pages. This system is completely independent of Google Sheets and Google Apps Script.

## 🚀 Features

- **User Authentication**: Secure login/registration system
- **Attendance Tracking**: Mark students as present, absent, or late
- **Student Management**: Add, view, and remove students
- **Class Organization**: Organize students by classes
- **Attendance Reports**: Generate detailed attendance reports
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Powered by Firebase Firestore

## 🔧 Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase Firestore (Database), Firebase Auth (Authentication)
- **Hosting**: GitHub Pages
- **CDN**: Firebase SDK via CDN

## 📋 Prerequisites

1. **Firebase Account**: Create a free account at [Firebase Console](https://console.firebase.google.com/)
2. **GitHub Account**: For hosting the application

## 🛠️ Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "attendance-system")
4. Follow the setup wizard (enable Google Analytics if desired)
5. Once created, click on your project

### Step 2: Configure Firebase Services

1. **Enable Firestore Database**:
   - Go to "Firestore Database" in the sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Click "Enable"

2. **Enable Authentication**:
   - Go to "Authentication" in the sidebar
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Click "Save"

3. **Get Firebase Configuration**:
   - Go to Project Settings
   - Scroll down to "Your apps"
   - Click "</>" to add web app
   - Register app name (e.g., "attendance-web")
   - Copy the configuration object (we'll use this later)

### Step 3: Configure Security Rules

1. Go to Firestore Database → Rules
2. Replace existing rules with:
