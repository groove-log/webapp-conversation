import { type NextRequest } from 'next/server'
import { API_URL } from '@/config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new Response('URL is required', { status: 400 })
  }

  try {
    // Dify 서버에서 이미지 가져오기
    const response = await fetch(url, {
      headers: {
        // 보안상 필요한 경우 여기에 헤더 추가 가능
      },
    })

    if (!response.ok) throw new Error('Failed to fetch image')

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 1시간 캐싱
      },
    })
  } catch (error) {
    console.error('[Icon Proxy] Error:', error)
    return new Response('Failed to fetch image', { status: 500 })
  }
}
