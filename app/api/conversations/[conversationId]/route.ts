import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo, setSession } from '@/app/api/utils/common'
import { API_KEY, API_URL } from '@/config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } },
) {
  const { sessionId, user } = getInfo(request)
  const { conversationId } = await params

  try {
    const baseUrl = API_URL || 'https://api.dify.ai/v1'
    const res = await fetch(`${baseUrl}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete conversation' },
        { status: res.status, headers: setSession(sessionId) },
      )
    }

    return NextResponse.json(
      { result: 'success' },
      { headers: setSession(sessionId) },
    )
  }
  catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: setSession(sessionId) },
    )
  }
}
