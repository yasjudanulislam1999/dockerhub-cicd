export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`bubble-wrapper ${isUser ? 'bubble-wrapper--user' : 'bubble-wrapper--assistant'}`}>
      {!isUser && <div className="bubble-avatar">AI</div>}
      <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}>
        {message.content}
      </div>
    </div>
  )
}
