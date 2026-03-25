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
- [ ] Add "Mark all as read" button

**Files to modify:**
- `components/layout/notification-bell.tsx` - Add toast/sound trigger
- `app/(protected)/notifications/page.tsx` - Add mark all read button
- `app/api/notifications/mark-all-read/route.ts` - New API endpoint

---

## Phase 2: Discord Webhook Notifications (New)

Send notifications to Discord when users receive messages in Game-World.

### 2.1 Database Changes
- [ ] Add `discord_webhook_url` column to `profiles` table (optional, user-configurable)
- [ ] Or create `user_settings` table for notification preferences

**Migration:** `scripts/023_discord_notifications.sql`

### 2.2 Discord Webhook Sender
- [ ] Create utility function to send Discord webhook messages
- [ ] Handle different notification types (DM, friend request, thread reply)
- [ ] Format embeds nicely with Game-World branding

**Files:**
- `lib/discord-webhook.ts` - Webhook sender utility

### 2.3 Notification Triggers
Modify existing notification-creating code to also send Discord webhooks:
- [ ] When DM received → send Discord webhook (if user has webhook configured)
- [ ] When friend request received → send Discord webhook
- [ ] When thread reply received → send Discord webhook

**Files to modify:**
- `app/api/dm/[conversationId]/messages/route.ts`
- `app/api/friends/route.ts`
- `app/api/threads/[threadId]/replies/route.ts`

### 2.4 User Settings UI
- [ ] Add Discord webhook URL field to settings page
- [ ] Allow users to enable/disable Discord notifications

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
**Status: Needs Implementation**

- [ ] Add DELETE endpoint for communities (creator-only check)
- [ ] Add delete button to community page (visible only to creator)
- [ ] Cascade delete: channels, messages, community_members, threads

**Files:**
- `app/api/communities/[communityId]/route.ts` - Add DELETE method
- `app/(protected)/communities/[slug]/page.tsx` - Add delete button for owner

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
