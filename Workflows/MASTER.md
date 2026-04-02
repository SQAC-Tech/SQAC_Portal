# Club Portal Implementation Master Plan

Read this file first. Every teammate should use this document as the source of truth for:
- what they own
- which files they may edit
- which shared contracts they must follow
- which integration points are already fixed

The goal is parallel implementation with minimal merge conflicts.

## 1. Target Structure

```text
club-portal/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── firebaseAdmin.js
│   │   │   └── socket.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   ├── Meeting.js
│   │   │   ├── Attendance.js
│   │   │   ├── Notice.js
│   │   │   ├── Warning.js
│   │   │   ├── Message.js
│   │   │   └── Certificate.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── meeting.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── notice.routes.js
│   │   │   ├── warning.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── mail.routes.js
│   │   │   └── certificate.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── meeting.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── notice.controller.js
│   │   │   ├── warning.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── mail.controller.js
│   │   │   └── certificate.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   └── socket/
│   │       ├── chat.socket.js
│   │       └── notifier.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   └── axios.js
    │   ├── firebase.js
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── components/
    │   │   └── common/
    │   │       ├── Navbar.jsx
    │   │       ├── ProtectedRoute.jsx
    │   │       ├── RoleGuard.jsx
    │   │       ├── NotificationBell.jsx
    │   │       ├── Spinner.jsx
    │   │       └── EmptyState.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Onboarding.jsx
    │   │   ├── member/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── MyTasks.jsx
    │   │   │   ├── MyProjects.jsx
    │   │   │   └── MyMeetings.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminLayout.jsx
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── MemberList.jsx
    │   │   │   ├── MemberDetail.jsx
    │   │   │   ├── ProjectManager.jsx
    │   │   │   ├── TaskAssign.jsx
    │   │   │   ├── MeetingManager.jsx
    │   │   │   ├── AttendanceTracker.jsx
    │   │   │   ├── OnboardApproval.jsx
    │   │   │   ├── CertGenerator.jsx
    │   │   │   ├── MassMailer.jsx
    │   │   │   └── WarningsAdmin.jsx
    │   │   ├── notices/
    │   │   │   ├── NoticeBoard.jsx
    │   │   │   └── WarningList.jsx
    │   │   └── chat/
    │   │       ├── ChatLayout.jsx
    │   │       ├── GroupChat.jsx
    │   │       └── DirectChat.jsx
    │   └── utils/
    │       └── formatters.js
    └── package.json
```

## 2. Fixed Cross-Team Contracts

These are not optional. Everyone must code against these exact assumptions.

### Backend startup contract
- `app.js` creates and exports the configured Express app only.
- `server.js` creates the HTTP server, initializes Socket.IO, and calls `server.listen`.
- Nobody except Mahik touches `app.js` and `server.js`.

### Auth and onboarding contract
- Public registration is a 3-step flow.
- `POST /api/auth/register` creates the user and returns:
  - generated `username`
  - generated `password`
  - temporary onboarding JWT as `onboardingToken`
  - lightweight user object with `_id`, `name`, `email`, `username`
- `POST /api/auth/complete-onboarding` uses the onboarding JWT or normal login JWT in `Authorization`.
- Login is blocked until `isApproved === true`.
- Onboarding is completed before board approval.

Why this contract exists:
- without `onboardingToken`, Step 2 and Step 3 cannot call a protected endpoint
- login cannot be required before approval, because approval happens after onboarding

### Shared frontend providers
- `AuthContext.jsx` is owned by Agrim.
- `SocketContext.jsx` is owned by Chirag.
- `main.jsx` must wrap the app in this order:
  - `BrowserRouter`
  - `AuthProvider`
  - `SocketProvider`
  - `Toaster`

### Shared API helper
- `frontend/src/api/axios.js` is owned by Raghav.
- Every frontend page uses this shared instance.

### Realtime notifications
- `backend/src/socket/notifier.js` is owned by Shaurya.
- Other backend members only import and call notifier methods in their own controllers.
- Event names are fixed:
  - `new_notice`
  - `new_warning`
  - `task_assigned`
  - `account_approved`
  - `new_meeting`

### Firebase ownership split
- Frontend Firebase client setup: Agrim
- Backend Firebase Admin setup: Shaurya

## 3. Ownership Map

Each person must stay inside their write set unless `MASTER.md` explicitly says otherwise.

### Mahik
Owns:
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/config/db.js`
- `backend/src/models/User.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/user.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/user.controller.js`
- `backend/src/middleware/auth.middleware.js`
- `backend/src/middleware/role.middleware.js`
- `backend/.env.example`
- `README.md`

### Manya
Owns:
- `backend/src/models/Project.js`
- `backend/src/models/Task.js`
- `backend/src/models/Meeting.js`
- `backend/src/models/Attendance.js`
- `backend/src/routes/project.routes.js`
- `backend/src/routes/task.routes.js`
- `backend/src/routes/meeting.routes.js`
- `backend/src/routes/attendance.routes.js`
- `backend/src/controllers/project.controller.js`
- `backend/src/controllers/task.controller.js`
- `backend/src/controllers/meeting.controller.js`
- `backend/src/controllers/attendance.controller.js`

### Tusharika
Owns:
- `backend/src/models/Notice.js`
- `backend/src/models/Warning.js`
- `backend/src/routes/notice.routes.js`
- `backend/src/routes/warning.routes.js`
- `backend/src/controllers/notice.controller.js`
- `backend/src/controllers/warning.controller.js`

### Shaurya
Owns:
- `backend/src/models/Message.js`
- `backend/src/models/Certificate.js`
- `backend/src/routes/chat.routes.js`
- `backend/src/routes/mail.routes.js`
- `backend/src/routes/certificate.routes.js`
- `backend/src/controllers/chat.controller.js`
- `backend/src/controllers/mail.controller.js`
- `backend/src/controllers/certificate.controller.js`
- `backend/src/socket/chat.socket.js`
- `backend/src/socket/notifier.js`
- `backend/src/config/firebaseAdmin.js`
- `backend/src/config/socket.js` if needed

### Agrim
Owns:
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/firebase.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/components/common/Navbar.jsx`
- `frontend/src/components/common/ProtectedRoute.jsx`
- `frontend/src/components/common/RoleGuard.jsx`
- `frontend/src/components/common/Spinner.jsx`
- `frontend/src/components/common/EmptyState.jsx`
- `frontend/src/pages/auth/Login.jsx`
- `frontend/src/pages/auth/Onboarding.jsx`
- `frontend/src/pages/member/Dashboard.jsx`
- `frontend/src/pages/member/Profile.jsx`
- `frontend/src/pages/member/MyTasks.jsx`
- `frontend/src/pages/member/MyProjects.jsx`
- `frontend/src/pages/member/MyMeetings.jsx`

### Chirag
Owns:
- `frontend/src/context/SocketContext.jsx`
- `frontend/src/components/common/NotificationBell.jsx`
- `frontend/src/pages/chat/ChatLayout.jsx`
- `frontend/src/pages/chat/GroupChat.jsx`
- `frontend/src/pages/chat/DirectChat.jsx`
- `frontend/src/pages/notices/NoticeBoard.jsx`
- `frontend/src/pages/notices/WarningList.jsx`

### Raghav
Owns:
- `frontend/src/api/axios.js`
- `frontend/src/pages/admin/AdminLayout.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/MemberList.jsx`
- `frontend/src/pages/admin/MemberDetail.jsx`
- `frontend/src/pages/admin/ProjectManager.jsx`
- `frontend/src/pages/admin/TaskAssign.jsx`
- `frontend/src/pages/admin/MeetingManager.jsx`
- `frontend/src/pages/admin/AttendanceTracker.jsx`
- `frontend/src/pages/admin/OnboardApproval.jsx`
- `frontend/src/pages/admin/CertGenerator.jsx`
- `frontend/src/pages/admin/MassMailer.jsx`
- `frontend/src/pages/admin/WarningsAdmin.jsx`

## 4. Parallel Work Rules

To avoid merge conflicts:
- Only Agrim edits `App.jsx`, `main.jsx`, and `Navbar.jsx`.
- Only Raghav edits admin page files.
- Only Chirag edits chat/notices/socket client files.
- Only Mahik edits backend boot files, auth, user, middleware, env, README.
- Only Shaurya edits socket backend, mail, certificate, and Firebase Admin.
- Only Manya edits project/task/meeting/attendance modules.
- Only Tusharika edits notice/warning modules.

Cross-team integration must happen through stable APIs and imports, not shared file editing.

## 5. Remaining Work Reassigned

The previous docs left some unowned work. It is now assigned as follows:

### Newly assigned to Mahik
- create `backend/src/server.js`
- make onboarding token flow work in auth controller
- mount all route placeholders in `app.js`
- emit `account_approved` via notifier from user approval controller

### Newly assigned to Agrim
- create `AuthContext.jsx`
- create `main.jsx` provider wiring
- create `firebase.js`
- create `Spinner.jsx` and `EmptyState.jsx`
- add `/meetings` route and member meetings page

### Newly assigned to Raghav
- create `AdminLayout.jsx`
- define all admin routes under `/admin/*`

### Newly assigned to Shaurya
- create `config/firebaseAdmin.js`
- finalize notifier helper for all backend modules

### Newly assigned to Chirag
- create `NotificationBell.jsx`
- consume socket events only, no shared navbar edits

## 6. Integration Checklist

Each member should finish their work and verify against this checklist:

### Mahik
- auth routes work
- onboarding token works
- `app.js` exports app
- `server.js` starts server with sockets

### Manya
- projects/tasks/meetings/attendance routes export routers
- meeting and attendance member-friendly endpoints exist
- notifier calls fire on task assignment and meeting creation

### Tusharika
- notices and warnings CRUD works
- warning stats route exists
- notifier calls fire on notice creation and warning issue

### Shaurya
- chat socket authenticates
- notifier works
- mail route works
- certificate PDF upload path is set

### Agrim
- auth context works
- protected routes work
- onboarding can finish without normal login
- navbar route list is complete

### Chirag
- socket provider reconnects on auth state change
- chat screens load
- notices/warnings pages use toast + shared loading states
- notification bell works from incoming socket events

### Raghav
- admin layout and routes work
- member detail debt tab works
- mass mail and warnings admin pages work

## 7. Recommended Execution Order

Parallel work can start immediately, but this order reduces waiting:

1. Mahik finishes auth, middleware, user model, app/server boot.
2. In parallel:
   - Manya builds project/task/meeting/attendance backend.
   - Tusharika builds notice/warning backend.
   - Shaurya builds socket/chat/mail/certificate backend.
3. In parallel on frontend:
   - Agrim builds auth/member shell, providers, routes, member pages.
   - Chirag builds socket client, chat, notices, warnings, notification bell.
   - Raghav builds admin shell and admin pages.

## 8. Onboarding Flow

This is the exact flow everyone must follow:

1. Public user fills member info form.
2. Frontend calls `POST /api/auth/register`.
3. Backend creates user with:
   - `isApproved = false`
   - `isOnboarded = false`
4. Backend returns:
   - `username`
   - `password`
   - `onboardingToken`
   - `user`
5. Frontend stores `onboardingToken` temporarily.
6. User signs undertaking.
7. User signs code of conduct.
8. Frontend uploads signature proof to Firebase Storage.
9. Frontend calls `POST /api/auth/complete-onboarding`.
10. Backend marks onboarding complete.
11. Admin sees pending onboarding approval.
12. Board approves account.
13. Backend emits `account_approved`.
14. User can now log in with generated credentials.

## 9. Rule For Everyone

If your member-specific file says something that conflicts with `MASTER.md`, follow `MASTER.md`.
