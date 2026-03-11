# Game-World Database Schema

Last updated: March 11, 2026

## Overview

This document describes the canonical database schema for Game-World, a gaming community platform built on Supabase (PostgreSQL). All tables have Row Level Security (RLS) enabled.

---

## Tables

### profiles
User profile information linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (matches auth.users.id) |
| username | text | Unique username |
| display_name | text | Display name shown in UI |
| avatar_url | text | URL to profile picture |
| bio | text | User biography |
| date_of_birth | date | User's date of birth |
| is_over_16 | boolean | Age verification flag |
| created_at | timestamptz | Account creation time |
| updated_at | timestamptz | Last profile update |

**RLS Policies:** Anyone can view profiles. Users can only insert/update/delete their own.

---

### communities
Gaming communities (servers) that users can join.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Community name |
| slug | text | URL-friendly identifier |
| description | text | Community description |
| icon_url | text | Community icon/logo |
| banner_url | text | Community banner image |
| category | text | Community category |
| platforms | text[] | Gaming platforms (PC, PlayStation, Xbox, etc.) |
| game_tags | text[] | Associated game tags |
| is_nsfw | boolean | Age-restricted content flag |
| created_by | uuid | FK to profiles.id |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:** Anyone can view. Authenticated users can create. Only owner can update/delete.

---

### community_members
Junction table for user-community membership.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| community_id | uuid | FK to communities.id |
| user_id | uuid | FK to profiles.id |
| role | enum | Member role (member, moderator, admin, owner) |
| joined_at | timestamptz | When user joined |

**RLS Policies:** Members can view other members. Users can join/leave themselves.

---

### channels
Chat channels within communities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| community_id | uuid | FK to communities.id |
| name | text | Channel name |
| description | text | Channel description |
| type | enum | Channel type (text, voice, announcement) |
| position | integer | Display order |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:** Authenticated users can view. Admins can create/update/delete.

---

### messages
Chat messages in community channels.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| channel_id | uuid | FK to channels.id |
| sender_id | uuid | FK to profiles.id |
| content | text | Message content |
| is_deleted | boolean | Soft delete flag |
| created_at | timestamptz | Sent timestamp |
| updated_at | timestamptz | Last edit timestamp |

**RLS Policies:** Authenticated users can view/create. Users can only update/delete their own.

---

### threads
Discussion threads within communities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| community_id | uuid | FK to communities.id |
| author_id | uuid | FK to profiles.id |
| title | text | Thread title |
| content | text | Thread body content |
| is_pinned | boolean | Pinned to top flag |
| is_locked | boolean | Prevent new replies flag |
| is_deleted | boolean | Soft delete flag |
| likes_count | integer | Cached like count |
| reply_count | integer | Cached reply count |
| created_at | timestamptz | Creation timestamp |
| last_activity_at | timestamptz | Last reply/activity time |

**RLS Policies:** Anyone can view (non-deleted). Community members can create. Authors can update/delete.

---

### thread_replies
Replies to discussion threads.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| thread_id | uuid | FK to threads.id |
| author_id | uuid | FK to profiles.id |
| content | text | Reply content |
| is_deleted | boolean | Soft delete flag |
| likes_count | integer | Cached like count |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:** Anyone can view. Authenticated users can create. Authors can update/delete.

---

### thread_likes
Likes on threads and replies.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| thread_id | uuid | FK to threads.id (nullable) |
| reply_id | uuid | FK to thread_replies.id (nullable) |
| user_id | uuid | FK to profiles.id |
| created_at | timestamptz | Like timestamp |

**RLS Policies:** Anyone can view. Users can create/delete their own likes.

---

### friendships
Friend relationships between users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| requester_id | uuid | FK to profiles.id (who sent request) |
| addressee_id | uuid | FK to profiles.id (who received request) |
| status | enum | pending, accepted, blocked |
| created_at | timestamptz | Request timestamp |
| updated_at | timestamptz | Status change timestamp |

**RLS Policies:** Users can view/manage their own friendships only.

---

### dm_conversations
Direct message conversation containers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:** Only participants can view/create.

---

### dm_participants
Users participating in DM conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| conversation_id | uuid | FK to dm_conversations.id |
| user_id | uuid | FK to profiles.id |
| joined_at | timestamptz | Join timestamp |

**RLS Policies:** Users can view their own participations. Authenticated users can create.

---

### dm_messages
Messages in DM conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| conversation_id | uuid | FK to dm_conversations.id |
| sender_id | uuid | FK to profiles.id |
| content | text | Message content |
| is_deleted | boolean | Soft delete flag |
| created_at | timestamptz | Sent timestamp |

**RLS Policies:** Only participants can view/create. Senders can delete their own.

---

### notifications
User notifications for various events.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles.id (recipient) |
| actor_id | uuid | FK to profiles.id (who triggered) |
| type | text | friend_request, message, thread_reply, mention |
| message | text | Notification message |
| link | text | URL to relevant content |
| thread_id | uuid | FK to threads.id (optional) |
| community_id | uuid | FK to communities.id (optional) |
| is_read | boolean | Read status |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:** Users can view/update/delete their own notifications. Anyone can insert.

---

### user_presence
Real-time user online status.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | FK to profiles.id (unique) |
| status | text | online, away, offline |
| last_seen | timestamptz | Last activity timestamp |
| current_community_id | uuid | FK to communities.id (optional) |

**RLS Policies:** Anyone can view. Users can insert/update their own.

---

### activity_feed
Activity events for communities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| community_id | uuid | FK to communities.id |
| user_id | uuid | FK to profiles.id |
| type | text | Event type (join, post, etc.) |
| metadata | jsonb | Additional event data |
| created_at | timestamptz | Event timestamp |

**RLS Policies:** Anyone can view. Users can insert their own activity.

---

### reports
User reports for moderation.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| reporter_id | uuid | FK to profiles.id |
| reported_user_id | uuid | FK to profiles.id |
| reason | text | Report reason category |
| description | text | Detailed description |
| status | enum | pending, reviewed, resolved |
| created_at | timestamptz | Report timestamp |

**RLS Policies:** Users can view/create their own reports only.

---

## Custom Types (Enums)

- **member_role**: `member`, `moderator`, `admin`, `owner`
- **channel_type**: `text`, `voice`, `announcement`
- **friendship_status**: `pending`, `accepted`, `blocked`
- **report_status**: `pending`, `reviewed`, `resolved`

---

## Database Functions

### increment_thread_replies(thread_uuid uuid)
Atomically increments the reply_count on a thread.

```sql
UPDATE threads SET reply_count = reply_count + 1 WHERE id = thread_uuid;
```

---

## Realtime Subscriptions

The following tables have Supabase Realtime enabled:
- `messages` - Live chat in channels
- `dm_messages` - Live DM conversations
- `threads` - New discussion threads
- `user_presence` - Online status updates
- `activity_feed` - Community activity
