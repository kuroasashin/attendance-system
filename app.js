// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfFHn0mvqc84gL14vvqF3CUzw9yPl8CnQ",
  authDomain: "attendance-eec.firebaseapp.com",
  projectId: "attendance-eec",
  storageBucket: "attendance-eec.firebasestorage.app",
  messagingSenderId: "583669434269",
  appId: "1:583669434269:web:075ba77466d0f3f753d174",
  measurementId: "G-18Y4GS2QW9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Configure Google provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

let currentUserRole = '';
let attendanceData = [];
let userData = {};
let currentUser = {};

async function signInWithGoogle(role) {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Check if user exists in our database
        const userDoc = await db.collection('users').where('email', '==', user.email).get();
        
        if (userDoc.empty) {
            // New user - register them
            if (role === 'trainee') {
                // For trainees, go to registration form
                document.getElementById('regEmail').value = user.email;
                document.getElementById('regName').value = user.displayName || '';
                document.getElementById('rolePopup').style.display = 'none';
                document.getElementById('registrationPopup').style.display = 'flex';
                
                // Store user info for registration
                window.currentUser = { email: user.email, displayName: user.displayName };
            } else {
                // For instructors, check if they have access
                // Show OTP popup for verification
                document.getElementById('otpEmail').value = user.email;
                document.getElementById('rolePopup').style.display = 'none';
                document.getElementById('otpPopup').style.display = 'flex';
                
                // Store user info for verification
                window.currentUser = { email: user.email, displayName: user.displayName };
            }
        } else {
            // Existing user - check their role and redirect accordingly
            const userData = userDoc.docs[0].data();
            
            if (role === 'trainee' && userData.role === 'trainee') {
                // Trainee accessing trainee dashboard
                currentUserRole = 'Trainee';
                userData.email = user.email;
                userData.displayName = user.displayName;
                document.getElementById('userRoleDisplay').textContent = 'Trainee';
                document.getElementById('mainContainer').style.display = 'block';
                document.getElementById('rolePopup').style.display = 'none';
            } else if (role === 'instructor' && userData.role === 'instructor') {
                // Instructor accessing admin dashboard
                currentUserRole = 'Instructor';
                document.getElementById('adminContainer').style.display = 'block';
                document.getElementById('rolePopup').style.display = 'none';
            } else {
                alert("Access denied. You don't have permission to access this role.");
            }
        }
    } catch (error) {
        console.error("Error signing in with Google:", error);
        alert("Error signing in with Google. Please try again.");
    }
}

async function registerUser() {
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('regName').value;
    
    if (!email || !name) {
        alert("Please fill in all fields");
        return;
    }
    
    try {
        await db.collection('users').add({
            email: email,
            name: name,
            role: 'trainee',
            registeredAt: new Date()
        });
        
        alert("Registration successful!");
        closeRegistrationPopup();
        userData = { email: email, name: name, role: 'trainee' };
        currentUserRole = 'Trainee';
        document.getElementById('userRoleDisplay').textContent = 'Trainee';
        document.getElementById('mainContainer').style.display = 'block';
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Error registering user. Please try again.");
    }
}

async function verifyInstructor() {
    const email = document.getElementById('otpEmail').value;
    const otp = document.getElementById('otpInput').value;
    
    if (otp !== '1234') {
        alert("Invalid OTP. Please try again.");
        return;
    }
    
    try {
        // Register user as instructor
        await db.collection('users').add({
            email: email,
            name: window.currentUser.displayName || "Instructor",
            role: 'instructor',
            registeredAt: new Date()
        });
        
        alert("Access granted to admin dashboard!");
        closeOtpPopup();
        currentUserRole = 'Instructor';
        document.getElementById('adminContainer').style.display = 'block';
    } catch (error) {
        console.error("Error verifying instructor:", error);
        alert("Error verifying instructor. Please try again.");
    }
}

function closeRegistrationPopup() {
    document.getElementById('registrationPopup').style.display = 'none';
    document.getElementById('rolePopup').style.display = 'flex';
}

function closeOtpPopup() {
    document.getElementById('otpPopup').style.display = 'none';
    document.getElementById('rolePopup').style.display = 'flex';
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    // In a real app, you would implement proper authentication
    // For now, we'll just show a success message
    showMessage('Login successful!', 'success');
});

function recordAttendance(status) {
    const timestamp = new Date();
    const attendanceData = {
        user: userData.name || document.querySelector('#loginForm input[type="text"]').value,
        email: userData.email,
        role: currentUserRole,
        status: status,
        timestamp: timestamp,
        date: timestamp.toDateString()
    };
    
    // Save to Firestore
    db.collection('attendance')
      .add(attendanceData)
      .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          showMessage(`Attendance recorded as ${status}!`, 'success');
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
          showMessage('Error recording attendance!', 'error');
      });
}

function showMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Add active class to selected button
    event.target.classList.add('active');
    
    // Load overview data if switching to overview tab
    if (tabName === 'overview') {
        loadOverviewData();
    }
}

async function loadOverviewData() {
    try {
        const snapshot = await db.collection('attendance')
            .orderBy('timestamp', 'asc')
            .get();
        
        attendanceData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            attendanceData.push({
                id: doc.id,
                ...data
            });
        });
        
        renderOverviewTable();
    } catch (error) {
        console.error("Error loading overview data", error);
        document.getElementById('overviewContent').innerHTML = '<div class="error">Error loading data</div>';
    }
}

function renderOverviewTable() {
    if (attendanceData.length === 0) {
        document.getElementById('overviewContent').innerHTML = '<div>No attendance records found.</div>';
        return;
    }

    // Get unique users and dates
    const users = [...new Set(attendanceData.map(item => item.user))];
    const dates = [...new Set(attendanceData.map(item => item.date))].sort();

    // Create table header
    let tableHTML = '<table><thead><tr><th>Name</th>';
    dates.forEach(date => {
        tableHTML += `<th>${date}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Create table rows for each user
    users.forEach(user => {
        tableHTML += `<tr><td>${user}</td>`;
        dates.forEach(date => {
            const record = attendanceData.find(item => 
                item.user === user && item.date === date
            );
            
            if (record) {
                tableHTML += `<td>${record.status}</td>`;
            } else {
                tableHTML += '<td>-</td>';
            }
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    document.getElementById('overviewContent').innerHTML = tableHTML;
}

// Admin functions
function switchAdminTab(tabName) {
    // Hide all admin tab contents
    document.querySelectorAll('#adminContainer .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all admin buttons
    document.querySelectorAll('#adminContainer .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Add active class to selected button
    event.target.classList.add('active');
    
    // Load data based on selected tab
    if (tabName === 'admin-overview') {
        loadAdminOverview();
    } else if (tabName === 'admin-users') {
        loadAdminUsers();
    }
}

async function loadAdminOverview() {
    try {
        const snapshot = await db.collection('attendance')
            .orderBy('timestamp', 'desc')
            .get();
        
        let tableHTML = '<table><thead><tr><th>User</th><th>Email</th><th>Status</th><th>Date</th><th>Time</th></tr></thead><tbody>';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
            tableHTML += `
                <tr>
                    <td>${data.user || 'N/A'}</td>
                    <td>${data.email || 'N/A'}</td>
                    <td>${data.status}</td>
                    <td>${data.date}</td>
                    <td>${timestamp.toLocaleTimeString()}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        document.getElementById('adminOverviewContent').innerHTML = tableHTML;
    } catch (error) {
        console.error("Error loading admin overview:", error);
        document.getElementById('adminOverviewContent').innerHTML = '<div class="error">Error loading data</div>';
    }
}

async function loadAdminUsers() {
    try {
        const snapshot = await db.collection('users').get();
        
        let tableHTML = '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registered At</th></tr></thead><tbody>';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const registeredAt = data.registeredAt ? data.registeredAt.toDate().toLocaleString() : 'N/A';
            tableHTML += `
                <tr>
                    <td>${data.name || 'N/A'}</td>
                    <td>${data.email}</td>
                    <td>${data.role}</td>
                    <td>${registeredAt}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        document.getElementById('adminUsersContent').innerHTML = tableHTML;
    } catch (error) {
        console.error("Error loading admin users:", error);
        document.getElementById('adminUsersContent').innerHTML = '<div class="error">Error loading data</div>';
      
async function signInWithGoogle(role) {
  try {
      const result = await auth.signInWithPopup(googleProvider);
      const user = result.user;
      
      // Check if user exists in our database
      const userDoc = await db.collection('users').where('email', '==', user.email).get();
      
      if (userDoc.empty) {
          // New user - register them
          if (role === 'trainee') {
              // For trainees, go to registration form
              document.getElementById('regEmail').value = user.email;
              document.getElementById('regName').value = user.displayName || '';
              document.getElementById('rolePopup').style.display = 'none';
              document.getElementById('registrationPopup').style.display = 'flex';
              
              // Store user info for registration
              window.currentUser = { email: user.email, displayName: user.displayName };
          } else {
              // For instructors, check if they have access
              // Show OTP popup for verification
              document.getElementById('otpEmail').value = user.email;
              document.getElementById('rolePopup').style.display = 'none';
              document.getElementById('otpPopup').style.display = 'flex';
              
              // Store user info for verification
              window.currentUser = { email: user.email, displayName: user.displayName };
          }
      } else {
          // Existing user - check their role and redirect accordingly
          const userData = userDoc.docs[0].data();
          
          if (role === 'trainee' && userData.role === 'trainee') {
              // Trainee accessing trainee dashboard
              currentUserRole = 'Trainee';
              userData.email = user.email;
              userData.displayName = user.displayName;
              document.getElementById('userRoleDisplay').textContent = 'Trainee';
              document.getElementById('mainContainer').style.display = 'block';
              document.getElementById('rolePopup').style.display = 'none';
          } else if (role === 'instructor' && userData.role === 'instructor') {
              // Instructor accessing admin dashboard
              currentUserRole = 'Instructor';
              document.getElementById('adminContainer').style.display = 'block';
              document.getElementById('rolePopup').style.display = 'none';
          } else {
              alert("Access denied. You don't have permission to access this role.");
          }
      }
  } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/popup-blocked') {
          alert("Pop-up was blocked. Please allow pop-ups for this site and try again.");
      } else if (error.code === 'auth/cancelled-popup-request') {
          // This happens when user closes the popup - ignore silently
      } else {
          alert("Error signing in with Google. Please try again.\n\nError: " + error.message);
      }
  }
}
  }
}
