import type { NextRequest } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      inputs,
      query,
      files,
      conversation_id: conversationId,
      response_mode: responseMode,
    } = body
    const { user } = getInfo(request)
    console.log('Sending to Dify API:', { inputs, query, user, responseMode, conversationId, files })
    const res = await client.createChatMessage(inputs, query, user, responseMode, conversationId, files)
    return new Response(res.data as any)
  } catch (error: any) {
    let errorMsg = error.message
    if (error.response && error.response.data) {
      if (typeof error.response.data.on === 'function') {
        error.response.data.on('data', (chunk: any) => {
          console.error('Dify API Error Body Chunk:', chunk.toString())
        })
      } else {
        errorMsg = JSON.stringify(error.response.data)
      }
    }
    console.error('Dify API Error:', errorMsg)
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: error.response?.status || 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
