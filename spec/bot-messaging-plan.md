# Bot Messaging Implementation Plan

Based on `spec/botmessages.spec.md`

---

## Overview

Implement a dual-notification system (in-app + Discord) and complete community management features (create, join, leave, delete with ownership checks).

---

## Phase 1: In-App Notification Enhancements (Already Mostly Done)

**Status: ~80% Complete**

What exists:
- `notifications` table with Realtime enabled
- NotificationBell component with Realtime subscription
- Notifications page with loading/error/empty states
- Test bot panel for triggering test notifications

Remaining work:
- [ ] Add notification sound/toast on new notification arrival
- [x] Add "Mark all as read" button (DONE - exists in notification bell)

**Files to modify:**
- `components/layout/notification-bell.tsx` - Add toast/sound trigger
- `app/(protected)/notifications/page.tsx` - Add mark all read button
- `app/api/notifications/mark-all-read/route.ts` - New API endpoint

---

## Phase 2: Discord Webhook Notifications (New)

**Status: COMPLETE**

Send notifications to Discord when users receive messages in Game-World.

### 2.1 Database Changes
- [x] Add `discord_webhook_url` column to `profiles` table (optional, user-configurable)
- [x] Add `webhook_deliveries` table for tracking delivery attempts

**Migration:** `scripts/023_webhook_and_softdelete.sql`

### 2.2 Discord Webhook Sender
- [x] Create utility function to send Discord webhook messages
- [x] Handle different notification types (DM, friend request, thread reply)
- [x] Format embeds nicely with Game-World branding
- [x] Retry logic with exponential backoff (3 attempts)

**Files:**
- `lib/webhook-service.ts` - Webhook sender utility with retries

### 2.3 Notification Triggers
Modify existing notification-creating code to also send Discord webhooks:
- [x] When DM received → send Discord webhook (if user has webhook configured)
- [x] When friend request received → send Discord webhook
- [x] When thread reply received → send Discord webhook

**Files modified:**
- `app/api/dm/[conversationId]/messages/route.ts`
- `app/api/friends/route.ts`
- `app/api/threads/[threadId]/replies/route.ts`

### 2.4 User Settings UI
- [x] Add Discord webhook URL field to settings page
- [x] Add test webhook button

**Files:**
- `app/(protected)/settings/page.tsx` - Add Discord webhook section

---

## Phase 3: Community Management (Partially Done)

### 3.1 Create Community
**Status: Done** - Users can create communities

### 3.2 Join Community  
**Status: Done** - JoinButton component handles join/leave

### 3.3 Leave Community
**Status: Done** - JoinButton component handles this

### 3.4 Delete Community (Owner Only)
**Status: COMPLETE**

- [x] Add DELETE endpoint for communities (creator-only check, soft-delete)
- [x] Add delete button to community page (visible only to creator)
- [x] Filter out deleted communities from listings

**Files:**
- `app/api/communities/[communityId]/route.ts` - DELETE method with soft-delete
- `components/communities/delete-community-button.tsx` - Delete button with confirmation
- `app/(protected)/communities/[slug]/page.tsx` - Shows delete button for owner

---

## Phase 4: Channel Management (Partially Done)

### 4.1 Create Channel
**Status: Done** - ChannelList component with "+ New" button

### 4.2 Join/Leave Channel
**Status: Needs Implementation**
- [ ] Add join/leave buttons to channel view
- [ ] Track channel membership in `channel_members` table

### 4.3 Delete Channel (Creator Only)
**Status: Done** - API exists, UI shows delete button

---

## Implementation Order (Credit-Efficient)

### Step 1: Mark All Read (Quick Win)
1. Create `app/api/notifications/mark-all-read/route.ts`
2. Add button to notifications page

### Step 2: Community Delete
1. Add DELETE to `app/api/communities/[communityId]/route.ts`
2. Add delete button to community page (owner-only)

### Step 3: Discord Webhooks (User Configured)
1. Migration for `discord_webhook_url` 
2. Create webhook utility
3. Integrate into notification creation points
4. Add settings UI

---

## Database Changes Summary

```sql
-- scripts/023_discord_notifications.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_webhook_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_notifications_enabled boolean DEFAULT false;
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/notifications/mark-all-read` | POST | Mark all notifications as read | New |
| `/api/communities/[communityId]` | DELETE | Delete community (owner only) | New |
| `/api/channels/[channelId]/members` | POST/DELETE | Join/leave channel | Exists |

---

## Questions Before Starting

1. **Discord notifications** - Should users configure their own webhook URL in settings, or use a single app-wide Discord channel?

2. **Community deletion** - Soft-delete (mark as deleted) or hard-delete (remove all data)?

3. **Priority** - Discord webhooks now, or prioritize community delete and mark-all-read first?
