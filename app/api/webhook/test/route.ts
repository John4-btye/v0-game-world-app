import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 })
    }

    const testPayload = {
      embeds: [{
        title: 'Test Notification',
        description: 'Your Discord webhook is working! You will now receive Game-World notifications here.',
        color: 0xEB459E, // Pink
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Game-World Notifications',
        },
      }],
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Discord returned ${res.status}: ${res.statusText}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send test' },
      { status: 500 }
    )
  }
}
