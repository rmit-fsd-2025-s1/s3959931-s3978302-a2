# Notification System Debug Test

## Steps to Test:

1. **Start Frontend**: `npm run dev` in frontend directory
2. **Login as Lecturer**: Use lecturer credentials to login
3. **Check Console**: Look for these debug messages:

   - `🏠 Header user state: { isAuthenticated: true, userType: "lecturer", shouldShowNotificationBell: true }`
   - `📬 NotificationProvider user state: { userId: X, userType: "lecturer", isLecturer: true }`
   - `🔔 Rendering NotificationBell for lecturer: X`
   - `🔔 NotificationBell rendered with: { notifications: 0, unreadCount: 0, isOpen: false }`

4. **Check Visual**: Should see a bell icon next to avatar and a blue "Test" button (in development)

5. **Test Manual Notification**:

   - Click the blue "Test" button
   - Should see: `🧪 Adding test notification`
   - Should see: `📬 Adding new notification: {...}`
   - Bell should show red badge with "1"

6. **Test Real Notification** (requires admin backend):
   - Start admin backend: `npm start` in admin-backend directory
   - Login to admin frontend and block/unblock a candidate
   - Check console for: `🎯 processSubscriptionData called with event: {...}`

## Potential Issues:

1. **User Type**: Make sure user.userType === "lecturer" (not "LECTURER")
2. **Context Provider**: Make sure NotificationProvider wraps the app
3. **localStorage**: Check if notifications persist after refresh
4. **WebSocket**: Check if subscription is connecting to admin backend
5. **Targeting Logic**: Make sure affectedLecturerIds includes current lecturer ID

## Debug Console Commands:

```javascript
// Check localStorage
localStorage.getItem("lecturer_notifications_1");

// Check user state
window.localStorage.getItem("user");

// Force add notification
// (if NotificationContext is accessible)
```
