# VU Sports Society (Expo/React Native)

This app provides a portal for the VU Sports Society. Participants (students/staff) and Coaches can register, login (after appropriate approval), and modify their profiles.

Backend is implemented using Firebase (Auth + Firestore + optional Storage).

## Implemented Features (30–40% scope)

- Registration: `app/register.tsx`
  - Fields: name, email, password, role (student/staff), sports preferences, past participation, achievements.
  - Registration sets the account to pending coach approval.
  - Coach role supported: coach-specific fields (sports expertise, team management, availability).
  - Role selection screen: `app/role-select.tsx` to choose Student, Staff, or Coach.
- Login/Logout: `app/login.tsx`
  - Enforces approval before allowing access to the tabs area.
    - Participants (student/staff): require coach approval.
    - Coaches: require admin approval.
  - Logout available in Profile tab.
- Modify Profile: `app/(tabs)/profile.tsx`
  - Edit name, sports preferences, past participation, achievements.
  - Email and role are read-only.
  - If role is Coach, edit coach fields (sports expertise, team management, availability).

- Admin Flow
  - Admin area: `app/admin/` with guarded layout.
  - Dashboard: `app/admin/index.tsx`
  - Manage Users: `app/admin/users.tsx` (approve/block/delete, inline edit of name/role)
  - Manage Teams: `app/admin/teams.tsx` (add/block/delete)
  - Default admin credentials (demo):
    - Email: `admin@vu.edu.pk`
    - Password: `admin123`

## Notes

- Data is now stored in Firebase Firestore via `context/AuthContext.tsx`.
- A demo helper is provided on the Login screen: “Demo: Approve this email” to simulate approval for the entered email (coach -> admin approval; participants -> coach approval).
- UI colors use the app theme defined in `constants/Colors.ts` and accessed via `useColorScheme`.

## Navigation

- The app uses Expo Router.
- Role selection: `app/role-select.tsx` (stack route). Registration can also be opened with a `role` param.
- Auth guard lives in `app/(tabs)/_layout.tsx`, redirecting unauthenticated users to `/login`.
- Stack is declared in `app/_layout.tsx`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npx expo start
   ```
3. Press **a** to open Android emulator or scan the QR with Expo Go on an Android device.

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add a Web app to your project (</> icon) and copy your config.
3. Fill `lib/firebaseConfig.ts` with your project's credentials:

   ```ts
   export const firebaseConfig = {
     apiKey: '...`,
     authDomain: '...`,
     projectId: '...`,
     storageBucket: '...`,
     messagingSenderId: '...`,
     appId: '...`,
   };
   ```

4. Install dependencies:

   ```bash
   npm install
   npm install firebase
   ```

5. Firestore structure used by the app:

   - Collection `users/{uid}` documents with fields:
     - `name: string`
     - `email: string`
     - `role: 'student' | 'staff' | 'coach' | 'admin'`
     - `sportsPreferences: string[]`
     - `pastParticipation?: string`
     - `achievements?: string`
     - `approvedByCoach: boolean`
     - `approvedByAdmin: boolean`
     - `blocked?: boolean`
     - Coach-only: `sportsExpertise?`, `teamManagement?`, `availability?`

   - Collection `teams/{id}` documents with fields:
     - `name: string`
     - `blocked?: boolean`

6. Authentication providers:
   - The app uses Email/Password. Enable it in Firebase Console > Authentication > Sign-in method.

7. Create an Admin user:
   - Option A: Register a normal account, then in Firestore set its `role` to `admin` and set `approvedByCoach` and `approvedByAdmin` to `true`.
   - Option B: In Firebase Auth, create a user, then create a matching document in `users/{uid}` with `role: 'admin'` and the other fields. After this, login with that email/password and you'll be routed to the Admin area.

8. Optional: Security Rules (starter example; tighten as needed):

   ```rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read for authenticated users; write rules simplified for demo
       match /users/{uid} {
         allow read: if request.auth != null;
         // A user can write to their own profile
         allow write: if request.auth != null && request.auth.uid == uid;
       }
       match /teams/{teamId} {
         allow read: if request.auth != null;
         // Only admins can write teams (adjust per your needs)
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Quick Test Scenarios

1) Participant flow (Student/Staff)
- From Login, tap "Create an account" or "Choose a role" then pick Student/Staff.
- Register with details; you will be pending coach approval.
- On Login screen, enter your email and press "Demo: Approve this email".
- Login should now succeed; visit Profile tab to edit details.

2) Coach flow
- From Login, tap "Choose a role" then pick Coach.
- Register with details including expertise, management, and availability; you will be pending admin approval.
- On Login screen, enter your email and press "Demo: Approve this email" (simulates admin approval for coaches).
- Login should now succeed; Profile shows and allows editing of coach-specific fields.

3) Admin flow
- On Login, use the demo admin account: `admin@vu.edu.pk` / `admin123`.
- You will be routed to the Admin Dashboard.
- Manage Users: approve (coaches -> admin approval, participants -> coach approval), block/unblock, delete, and edit name/role.
- Manage Teams: add new teams, block/unblock, delete.

## Next Steps (suggested)

- Add stricter Firestore security rules with admin role checks via custom claims or rules based on `role` field.
- Add Coach role and admin portal to approve users properly.
- Add proper password hashing and validation.
- Add sports events, registrations, and schedules.
- Add image upload for profile pictures.
