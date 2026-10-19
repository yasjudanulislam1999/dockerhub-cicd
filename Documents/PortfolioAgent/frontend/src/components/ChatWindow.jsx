import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages, isStreaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastMsg = messages[messages.length - 1]
  const showTypingIndicator = isStreaming && lastMsg?.role === 'assistant' && lastMsg?.content === ''

  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {showTypingIndicator && (
        <div className="typing-indicator">
          <span />
          <span />
          <span />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
