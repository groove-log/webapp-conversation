import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'
import { API_URL } from '@/config'

export async function GET(request: NextRequest) {
  console.log(`[Info API] Request received for ${process.env.NEXT_PUBLIC_APP_TITLE}`)
  const { sessionId, user } = getInfo(request)
  
  // 환경 변수 우선
  const envTitle = process.env.NEXT_PUBLIC_APP_TITLE || 'GS Retail AX'
  const envIcon = process.env.NEXT_PUBLIC_APP_ICON || ''
  const appId = process.env.APP_ID || ''
  
  try {
    const { data }: any = await client.getApplicationParameters(user)
    console.log(`[Info API] Dify Response: ${JSON.stringify(data)}`)
    
    const siteInfo = data.site || {}
    
    // 1. Dify 설정 이름 우선, 없으면 환경 변수 사용
    const title = siteInfo.title || envTitle || 'GS Retail AX'
    
    let iconUrl = envIcon || siteInfo.icon || ''
    let finalIconUrl = ''
    
    if (iconUrl) {
      // 1. Dify 내부 아이콘 경로인 경우 (/files/icon로 시작)
      if (iconUrl.startsWith('/files/icon')) {
        const baseUrl = API_URL.replace(/\/v1$/, '')
        const absoluteDifyUrl = `${baseUrl}${iconUrl}`
        finalIconUrl = `/api/info/icon?url=${encodeURIComponent(absoluteDifyUrl)}`
      }
      // 2. 이미 프록시가 필요한 외부 주소인 경우
      else if (iconUrl.startsWith('http') && iconUrl.includes('docker-api-1')) {
        finalIconUrl = `/api/info/icon?url=${encodeURIComponent(iconUrl)}`
      }
      // 3. 그 외 로컬 파일 (/woodong_logo.png 등)은 그대로 사용
      else {
        finalIconUrl = iconUrl
      }
    }
    
    // 아이콘이 전혀 없고 APP_ID가 있다면 Dify 기본 경로 시도
    if (!finalIconUrl && appId) {
      const baseUrl = API_URL.replace(/\/v1$/, '')
      const defaultDifyUrl = `${baseUrl}/files/icon/app/${appId}`
      finalIconUrl = `/api/info/icon?url=${encodeURIComponent(defaultDifyUrl)}`
    }

    // 테마 결정 (최종 확정된 title을 기준으로 판단)
    let theme = 'default'
    if (title.includes('대고객') || title.includes('우리동네'))
      theme = 'customer'
    else if (title.includes('수퍼') || title.toLowerCase().includes('super'))
      theme = 'super'

    return NextResponse.json({
      title,
      icon: finalIconUrl,
      theme,
      icon_background: siteInfo.icon_background || '',
      description: siteInfo.description || '',
    }, {
      headers: setSession(sessionId),
    })
  }
  catch (error: any) {
    // 에러 발생 시 fallback
    const title = envTitle || 'GS Retail AX'
    let theme = 'default'
    if (title.includes('대고객'))
      theme = 'customer'
    else if (title.includes('수퍼') || title.toLowerCase().includes('super'))
      theme = 'super'

    return NextResponse.json({ 
      title,
      theme,
      icon: envIcon ? `/api/info/icon?url=${encodeURIComponent(envIcon)}` : ''
    })
  }
}
