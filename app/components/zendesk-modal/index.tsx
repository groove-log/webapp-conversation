'use client'

import React, { useEffect, useState, useRef } from 'react'
import { subscribeZendesk, closeZendeskWidget } from '@/utils/zendesk'

const ZendeskModal = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const unsubscribe = subscribeZendesk((type, key) => {
      setActiveKey(key)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'zendesk-close') {
        closeZendeskWidget()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!activeKey) return null

  const srcDoc = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
        /* Hide launcher in iframe to force auto-open only */
        iframe[id^="launcher"], [data-testid="launcher"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
        /* Force widget to fill our iframe completely */
        iframe[id^="webWidget"], iframe[title*="Messaging window"] {
          width: 100% !important;
          height: 100% !important;
          max-height: 100% !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          right: 0 !important;
          position: absolute !important;
          border-radius: 12px !important;
        }
      </style>
    </head>
    <body>
      <script>
        window.zESettings = {
          webWidget: {
            launcher: { chatLabel: { '*': '' } },
            chat: { suppress: false },
            contactForm: { suppress: false }
          }
        };
      </script>
      <script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=${activeKey}"></script>
      <script>
        // Auto-open logic
        var attempts = 0;
        var poll = setInterval(function() {
          attempts++;
          if (typeof zE === 'function') {
            clearInterval(poll);
            try { zE('webWidget', 'hide'); } catch(e) {}
            try { zE('messenger', 'hide'); } catch(e) {}
            
            setTimeout(function() {
              try { zE('webWidget', 'show'); zE('webWidget', 'open'); } catch(e) {}
              try { zE('messenger', 'show'); zE('messenger', 'open'); } catch(e) {}
              
              // If user closes from inside
              try {
                zE('webWidget:on', 'close', function() {
                  window.parent.postMessage('zendesk-close', '*');
                });
              } catch(e) {}
              try {
                zE('messenger:on', 'close', function() {
                  window.parent.postMessage('zendesk-close', '*');
                });
              } catch(e) {}
            }, 300);
          }
          if (attempts > 50) clearInterval(poll);
        }, 100);
      </script>
    </body>
    </html>
  `

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[999998] sm:bg-black/40 sm:backdrop-blur-sm transition-opacity cursor-pointer flex items-center justify-center sm:items-end sm:justify-end sm:p-6"
        onClick={closeZendeskWidget}
      >
        {/* Modal Container */}
        <div 
          className="relative w-full h-full sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-48px)] sm:bg-white sm:rounded-2xl sm:shadow-2xl overflow-hidden cursor-default animate-fade-in-up pointer-events-none sm:pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            className="w-full h-full border-none pointer-events-auto"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>

        {/* Explicit Close Button for PC (floats outside the widget container) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            closeZendeskWidget()
          }}
          className="hidden sm:flex absolute top-6 right-6 z-[999999] items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors font-medium border border-white/20 backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          닫기
        </button>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </>
  )
}

export default ZendeskModal
