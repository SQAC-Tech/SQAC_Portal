club-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                     ← Mahik
│   │   │   └── socket.js                 ← Shaurya
│   │   ├── models/
│   │   │   ├── User.js                   ← Mahik
│   │   │   ├── Project.js                ← Manya
│   │   │   ├── Task.js                   ← Manya
│   │   │   ├── Meeting.js                ← Manya
│   │   │   ├── Attendance.js             ← Manya
│   │   │   ├── Notice.js                 ← Tusharika
│   │   │   ├── Warning.js                ← Tusharika
│   │   │   ├── Message.js                ← Shaurya
│   │   │   └── Certificate.js            ← Shaurya
│   │   ├── routes/
│   │   │   ├── auth.routes.js            ← Mahik
│   │   │   ├── user.routes.js            ← Mahik
│   │   │   ├── project.routes.js         ← Manya
│   │   │   ├── task.routes.js            ← Manya
│   │   │   ├── meeting.routes.js         ← Manya
│   │   │   ├── attendance.routes.js      ← Manya
│   │   │   ├── notice.routes.js          ← Tusharika
│   │   │   ├── warning.routes.js         ← Tusharika
│   │   │   ├── chat.routes.js            ← Shaurya
│   │   │   ├── mail.routes.js            ← Shaurya
│   │   │   └── certificate.routes.js     ← Shaurya
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        ← Mahik
│   │   │   ├── user.controller.js        ← Mahik
│   │   │   ├── project.controller.js     ← Manya
│   │   │   ├── task.controller.js        ← Manya
│   │   │   ├── meeting.controller.js     ← Manya
│   │   │   ├── attendance.controller.js  ← Manya
│   │   │   ├── notice.controller.js      ← Tusharika
│   │   │   ├── warning.controller.js     ← Tusharika
│   │   │   ├── chat.controller.js        ← Shaurya
│   │   │   ├── mail.controller.js        ← Shaurya
│   │   │   └── certificate.controller.js ← Shaurya
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        ← Mahik (verifyToken)
│   │   │   └── role.middleware.js        ← Mahik (requireRole)
│   │   ├── socket/
│   │   │   └── chat.socket.js           ← Shaurya
│   │   └── app.js                       ← Mahik (sets up express + mounts all routes)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js                  ← Raghav (base axios instance with token injection)
    │   ├── context/
    │   │   ├── AuthContext.jsx           ← Mahik/Agrim (share user state globally)
    │   │   └── SocketContext.jsx         ← Chirag (socket.io-client instance)
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx             ← Agrim
    │   │   │   ├── Onboarding.jsx        ← Agrim (multi-step form)
    │   │   │   └── DigitalSign.jsx       ← Agrim
    │   │   ├── member/
    │   │   │   ├── Dashboard.jsx         ← Agrim
    │   │   │   ├── Profile.jsx           ← Agrim
    │   │   │   ├── MyTasks.jsx           ← Agrim
    │   │   │   └── MyProjects.jsx        ← Agrim
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx    ← Raghav
    │   │   │   ├── MemberList.jsx        ← Raghav
    │   │   │   ├── MemberDetail.jsx      ← Raghav
    │   │   │   ├── ProjectManager.jsx    ← Raghav
    │   │   │   ├── TaskAssign.jsx        ← Raghav
    │   │   │   ├── MeetingManager.jsx    ← Raghav
    │   │   │   ├── AttendanceTracker.jsx ← Raghav
    │   │   │   ├── OnboardApproval.jsx   ← Raghav
    │   │   │   └── CertGenerator.jsx     ← Raghav
    │   │   ├── notices/
    │   │   │   ├── NoticeBoard.jsx       ← Chirag
    │   │   │   └── WarningList.jsx       ← Chirag
    │   │   └── chat/
    │   │       ├── ChatLayout.jsx        ← Chirag
    │   │       ├── GroupChat.jsx         ← Chirag
    │   │       └── DirectChat.jsx        ← Chirag
    │   ├── components/
    │   │   └── common/
    │   │       ├── Navbar.jsx            ← Agrim
    │   │       ├── ProtectedRoute.jsx    ← Agrim
    │   │       └── RoleGuard.jsx         ← Agrim
    │   └── App.jsx                       ← Agrim (routing setup)
    └── package.json


### Onboarding Flow (Important — Sabko pata hona chahiye)
New Person Registers
     ↓
Welcome Screen (public)
     ↓
Member Information Form (name, email, domain, mob, dept)
     ↓
Credential Auto-Generator (username + password created → stored in MongoDB)
     ↓
Member Joining Undertaking (Digital Signature via Firebase)
     ↓
Code of Conduct (Digital Signature via Firebase)
     ↓
Board Approval (Admin gets a pending request notification)
     ↓
Portal Access Granted → Login with generated credentials





