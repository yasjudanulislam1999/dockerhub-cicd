export default function InputBar({ value, onChange, onSend, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault()
      if (value.trim()) onSend()
    }
  }

  return (
    <div className="input-bar">
      <textarea
        className="input-bar__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about skills, experience, projects… (Enter to send, Shift+Enter for newline)"
        rows={1}
        disabled={disabled}
      />
      <button
        className="input-bar__btn"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        Send
      </button>
    </div>
  )
}
