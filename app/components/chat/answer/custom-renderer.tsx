'use client'

import React from 'react'
import StreamdownMarkdown from '@/app/components/base/streamdown-markdown'
import LoadingAnim from '../loading-anim'
import s from '../style.module.css'
import { openZendeskWidget } from '@/utils/zendesk'

interface CustomRendererProps {
  content: string
  onSend?: (text: string) => void
  theme?: 'default' | 'super' | 'customer'
}

const parseContent = (text: string) => {
  if (!text) return []

  const HANDOFF_TAG = '[[HANDOFF]]'
  const START_TAGS = ['[CAROUSEL]', '<CAROUSEL>']
  const END_TAGS = ['[/CAROUSEL]', '</CAROUSEL>']

  const chunks = []
  let remaining = text

  while (remaining.length > 0) {
    const handoffIndex = remaining.indexOf(HANDOFF_TAG)
    
    // Find the first occurring start tag
    let carouselIndex = -1
    let usedStartTag = ''
    for (const tag of START_TAGS) {
      const idx = remaining.indexOf(tag)
      if (idx !== -1 && (carouselIndex === -1 || idx < carouselIndex)) {
        carouselIndex = idx
        usedStartTag = tag
      }
    }

    // Check which tag comes first (handoff or carousel)
    if (handoffIndex !== -1 && (carouselIndex === -1 || handoffIndex < carouselIndex)) {
      if (handoffIndex > 0) {
        chunks.push({ type: 'markdown', content: remaining.slice(0, handoffIndex) })
      }
      chunks.push({ type: 'handoff', content: '' })
      remaining = remaining.slice(handoffIndex + HANDOFF_TAG.length)
      continue
    }

    if (carouselIndex === -1) {
      // No more carousels or handoffs
      chunks.push({ type: 'markdown', content: remaining })
      break
    }

    // Add text before the carousel
    if (carouselIndex > 0) {
      chunks.push({ type: 'markdown', content: remaining.slice(0, carouselIndex) })
    }

    // Find the corresponding end tag
    let endIndex = -1
    let usedEndTag = ''
    for (const tag of END_TAGS) {
      const idx = remaining.indexOf(tag, carouselIndex + usedStartTag.length)
      if (idx !== -1 && (endIndex === -1 || idx < endIndex)) {
        endIndex = idx
        usedEndTag = tag
      }
    }

    if (endIndex === -1) {
      // Streaming, not finished yet
      chunks.push({ type: 'loading_carousel', content: remaining.slice(carouselIndex) })
      break
    } else {
      // Finished carousel block
      const jsonStr = remaining.slice(carouselIndex + usedStartTag.length, endIndex).trim()
      chunks.push({ type: 'carousel', content: jsonStr })
      remaining = remaining.slice(endIndex + usedEndTag.length)
    }
  }

  return chunks
}

export const CustomRenderer: React.FC<CustomRendererProps> = ({ content, onSend, theme = 'default' }) => {
  const chunks = parseContent(content)

  // 브랜드별 메인 컬러 정의
  const themeColor = theme === 'super' ? '#004F34' : theme === 'customer' ? '#00D0F1' : '#00ADE9'
  const themeColorLight = theme === 'super' ? '#008C38' : theme === 'customer' ? '#00B5AD' : '#00ADE9'

  return (
    <div className="flex flex-col space-y-2 w-full">
      {chunks.map((chunk, idx) => {
        if (chunk.type === 'markdown') {
          return <StreamdownMarkdown key={idx} content={chunk.content} />
        }

        if (chunk.type === 'loading_carousel') {
          return (
            <div key={idx} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">
              <LoadingAnim type="text" />
              <span className="text-xs text-gray-400 mt-2">콘텐츠를 구성하는 중입니다...</span>
            </div>
          )
        }

        if (chunk.type === 'carousel') {
          let parsedData
          try {
            parsedData = JSON.parse(chunk.content)
          } catch (e) {
            // Fallback if JSON is malformed
            return (
              <div key={idx} className="p-4 bg-red-50 text-red-500 rounded-lg text-xs">
                데이터를 불러오는데 실패했습니다. (잘못된 형식)
              </div>
            )
          }

          const items = (parsedData.items || []).slice(0, 3)
          const gridCols = items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'

          return (
            <div key={idx} className="w-full pb-6 pt-2">
              <div className={`grid ${gridCols} gap-4 w-full`}>
                {items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => {
                      if (onSend && item.action?.value) {
                        onSend(item.action.value)
                      }
                    }}
                  >
                    <div className="p-4 flex-grow flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 
                            className="text-sm font-bold text-gray-900 leading-snug transition-colors line-clamp-2"
                            style={{ color: 'inherit' }}
                          >{item.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3 mb-4">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50/50">
                        <span className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: themeColor }}>{item.action?.label || '자세히 보기'}</span>
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-all group-hover:text-white"
                          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = themeColor
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `${themeColor}15`
                            e.currentTarget.style.color = themeColor
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (chunk.type === 'handoff') {
          return (
            <div key={idx} className="w-full pb-4 pt-2">
              <div 
                className="p-6 rounded-2xl border shadow-sm"
                style={{ 
                  background: `linear-gradient(to bottom right, ${themeColor}15, ${themeColorLight}15)`,
                  borderColor: `${themeColor}20`
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: themeColor }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">GS리테일 상담사 연결</h3>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: themeColor }}>Professional Support</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  현재 문의하신 내용은 전문 상담사의 확인이 필요합니다. <br />
                  아래 원하시는 상담 방식을 선택해 주세요.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {/* 1:1 문의 연결 — Zendesk Live Chat */}
                  <button
                    className="flex items-center justify-between w-full p-4 bg-white border border-gray-100 rounded-xl transition-all group"
                    style={{ '--hover-bg': `${themeColor}05`, '--hover-border': `${themeColor}30` } as any}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColor}05`
                      e.currentTarget.style.borderColor = `${themeColor}30`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.borderColor = '#F3F4F6'
                    }}
                    onClick={() => {
                      openZendeskWidget('chat')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-semibold text-gray-800 block">1:1 문의 연결</span>
                        <span className="text-[11px] text-gray-400">실시간 채팅 상담</span>
                      </div>
                    </div>
                    <svg className="text-gray-400 transition-all" style={{ color: 'inherit' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>

                  {/* 상담문의 하기 — Zendesk Contact Form */}
                  <button
                    className="flex items-center justify-between w-full p-4 bg-white border border-gray-100 rounded-xl transition-all group"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColorLight}05`
                      e.currentTarget.style.borderColor = `${themeColorLight}30`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.borderColor = '#F3F4F6'
                    }}
                    onClick={() => {
                      openZendeskWidget('contact')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${themeColorLight}15`, color: themeColorLight }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-semibold text-gray-800 block">상담문의 하기</span>
                        <span className="text-[11px] text-gray-400">문의 접수</span>
                      </div>
                    </div>
                    <svg className="text-gray-400 transition-all" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>

                  <div className="mt-2 p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[13px] text-gray-700 font-medium">
                        <span className="text-base">📞</span>
                        <span>GS25 고객센터: <a href="tel:080-999-5425" className="font-bold underline underline-offset-2" style={{ color: themeColor }}>080-999-5425</a></span>
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-gray-700">
                        <span className="text-base">⏰</span>
                        <span>운영 시간: <span className="font-semibold text-gray-900">평일 09:00 ~ 18:00</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
