import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: Execute dev actions that write to real database
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { action, sender_id, target_id, content, channel_id } = body

  console.log('[v0 DevActions] Received action:', { action, sender_id, target_id, content_length: content?.length, channel_id })

  // Validate sender_id - must be either current user or a valid fake user UUID
  const isFakeUser = sender_id?.startsWith('00000000-0000-0000-0000-')
  const isCurrentUser = sender_id === user.id
  
  if (!isCurrentUser && !isFakeUser) {
    return NextResponse.json({ error: 'Invalid sender_id' }, { status: 400 })
  }

  try {
    switch (action) {
      case 'send_dm': {
        if (!target_id || !content) {
          return NextResponse.json({ error: 'target_id and content required' }, { status: 400 })
        }

        // Find or create DM conversation
        let conversationId: string | null = null

        // Check if conversation exists
        const { data: senderParticipations } = await supabase
          .from('dm_participants')
          .select('conversation_id')
          .eq('user_id', sender_id)

        if (senderParticipations && senderParticipations.length > 0) {
          const convoIds = senderParticipations.map(p => p.conversation_id)
          const { data: targetInConvo } = await supabase
            .from('dm_participants')
            .select('conversation_id')
            .eq('user_id', target_id)
            .in('conversation_id', convoIds)

          if (targetInConvo && targetInConvo.length > 0) {
            conversationId = targetInConvo[0].conversation_id
          }
        }

        // Create conversation if not exists
        if (!conversationId) {
          const { data: newConvo, error: convoError } = await supabase
            .from('dm_conversations')
            .insert({})
            .select()
            .single()

          if (convoError) {
            console.log('[v0 DevActions] Error creating conversation:', convoError)
            return NextResponse.json({ error: convoError.message }, { status: 500 })
          }

          conversationId = newConvo.id

          // Add both participants
          const { error: partError } = await supabase
            .from('dm_participants')
            .insert([
              { conversation_id: conversationId, user_id: sender_id },
              { conversation_id: conversationId, user_id: target_id },
            ])

          if (partError) {
            console.log('[v0 DevActions] Error adding participants:', partError)
            return NextResponse.json({ error: partError.message }, { status: 500 })
          }
        }

        // Insert message
        const { data: message, error: msgError } = await supabase
          .from('dm_messages')
          .insert({
            conversation_id: conversationId,
            sender_id,
            content,
          })
          .select()
          .single()

        if (msgError) {
          console.log('[v0 DevActions] Error inserting DM:', msgError)
          return NextResponse.json({ error: msgError.message }, { status: 500 })
        }

        // Create notification for target
        await supabase.from('notifications').insert({
          user_id: target_id,
          type: 'message',
          title: 'New message',
          message: content.substring(0, 100),
          body: content.substring(0, 100),
          link: `/messages/${conversationId}`,
          actor_id: sender_id,
        })

        console.log('[v0 DevActions] DM sent successfully:', { message_id: message.id, conversation_id: conversationId })
        return NextResponse.json({ success: true, message, conversation_id: conversationId })
      }

      case 'send_channel_message': {
        if (!channel_id || !content) {
          return NextResponse.json({ error: 'channel_id and content required' }, { status: 400 })
        }

        const { data: message, error: msgError } = await supabase
          .from('messages')
          .insert({
            channel_id,
            sender_id,
            content,
          })
          .select()
          .single()

        if (msgError) {
          console.log('[v0 DevActions] Error inserting channel message:', msgError)
          return NextResponse.json({ error: msgError.message }, { status: 500 })
        }

        console.log('[v0 DevActions] Channel message sent:', { message_id: message.id, channel_id })
        return NextResponse.json({ success: true, message })
      }

      case 'send_friend_request': {
        if (!target_id) {
          return NextResponse.json({ error: 'target_id required' }, { status: 400 })
        }

        // Check for existing friendship
        const { data: existing } = await supabase
          .from('friendships')
          .select('id, status')
          .or(
            `and(requester_id.eq.${sender_id},addressee_id.eq.${target_id}),and(requester_id.eq.${target_id},addressee_id.eq.${sender_id})`
          )
          .maybeSingle()

        if (existing) {
          console.log('[v0 DevActions] Friendship already exists:', existing)
          return NextResponse.json({ error: `Friendship already exists with status: ${existing.status}` }, { status: 409 })
        }

        const { data: friendship, error: friendError } = await supabase
          .from('friendships')
          .insert({
            requester_id: sender_id,
            addressee_id: target_id,
            status: 'pending',
          })
          .select()
          .single()

        if (friendError) {
          console.log('[v0 DevActions] Error creating friendship:', friendError)
          return NextResponse.json({ error: friendError.message }, { status: 500 })
        }

        // Create notification
        await supabase.from('notifications').insert({
          user_id: target_id,
          type: 'friend_request',
          title: 'New friend request',
          message: 'You have a new friend request',
          body: 'You have a new friend request',
          link: '/friends',
          actor_id: sender_id,
        })

        console.log('[v0 DevActions] Friend request sent:', { friendship_id: friendship.id })
        return NextResponse.json({ success: true, friendship })
      }

      case 'accept_friend_request': {
        if (!target_id) {
          return NextResponse.json({ error: 'target_id (friendship_id) required' }, { status: 400 })
        }

        const { data: friendship, error: updateError } = await supabase
          .from('friendships')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', target_id)
          .select()
          .single()

        if (updateError) {
          console.log('[v0 DevActions] Error accepting friendship:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        // Notify the requester
        await supabase.from('notifications').insert({
          user_id: friendship.requester_id,
          type: 'friend_accepted',
          title: 'Friend request accepted',
          message: 'Your friend request was accepted',
          body: 'Your friend request was accepted',
          link: '/friends',
          actor_id: friendship.addressee_id,
        })

        console.log('[v0 DevActions] Friend request accepted:', { friendship_id: friendship.id })
        return NextResponse.json({ success: true, friendship })
      }

      case 'reject_friend_request': {
        if (!target_id) {
          return NextResponse.json({ error: 'target_id (friendship_id) required' }, { status: 400 })
        }

        const { error: deleteError } = await supabase
          .from('friendships')
          .delete()
          .eq('id', target_id)

        if (deleteError) {
          console.log('[v0 DevActions] Error rejecting friendship:', deleteError)
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        console.log('[v0 DevActions] Friend request rejected:', { friendship_id: target_id })
        return NextResponse.json({ success: true })
      }

      case 'block_user': {
        if (!target_id) {
          return NextResponse.json({ error: 'target_id required' }, { status: 400 })
        }

        // Update or create blocked friendship
        const { data: existing } = await supabase
          .from('friendships')
          .select('id')
          .or(
            `and(requester_id.eq.${sender_id},addressee_id.eq.${target_id}),and(requester_id.eq.${target_id},addressee_id.eq.${sender_id})`
          )
          .maybeSingle()

        if (existing) {
          await supabase
            .from('friendships')
            .update({ status: 'blocked', updated_at: new Date().toISOString() })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('friendships')
            .insert({
              requester_id: sender_id,
              addressee_id: target_id,
              status: 'blocked',
            })
        }

        console.log('[v0 DevActions] User blocked:', { sender_id, target_id })
        return NextResponse.json({ success: true })
      }

      case 'unblock_user': {
        if (!target_id) {
          return NextResponse.json({ error: 'target_id required' }, { status: 400 })
        }

        const { error: deleteError } = await supabase
          .from('friendships')
          .delete()
          .or(
            `and(requester_id.eq.${sender_id},addressee_id.eq.${target_id},status.eq.blocked),and(requester_id.eq.${target_id},addressee_id.eq.${sender_id},status.eq.blocked)`
          )

        if (deleteError) {
          console.log('[v0 DevActions] Error unblocking user:', deleteError)
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        console.log('[v0 DevActions] User unblocked:', { sender_id, target_id })
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.log('[v0 DevActions] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
