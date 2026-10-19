import { useState, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import JobDescriptionPanel from './components/JobDescriptionPanel'

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [candidateName, setCandidateName] = useState('the candidate')

  // Fetch candidate profile on mount and set welcome message
  useEffect(() => {
    fetch('/candidate')
      .then((res) => res.json())
      .then((data) => {
        setCandidateName(data.name)
        setMessages([
          {
            role: 'assistant',
            content: `Hi! I'm the AI representative for ${data.name}, a ${data.title}.\n\nAsk me anything about their background, skills, projects, or experience — or paste a job description on the left to see how well they match!`,
          },
        ])
      })
      .catch(() => {
        setMessages([
          {
            role: 'assistant',
            content: "Hi! I'm a Portfolio Agent. Ask me anything about this candidate!",
          },
        ])
      })
  }, [])

  const sendMessage = async (userText, baseMessages = null) => {
    if (isStreaming || !userText.trim()) return

    const userMsg = { role: 'user', content: userText }
    const history = baseMessages ?? messages
    const messagesWithUser = [...history, userMsg]

    // Optimistically render user message + empty assistant placeholder
    setMessages([...messagesWithUser, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesWithUser,
          job_description: jobDescription.trim() || undefined,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // { stream: true } prevents garbling multi-byte chars split across chunks
        const chunk = decoder.decode(value, { stream: true })

        // Functional update avoids stale closure on `messages`
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please make sure the backend is running and try again.',
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  const handleAnalyzeMatch = () => {
    if (!jobDescription.trim() || isStreaming) return
    sendMessage(
      'Based on the job description provided, how well does this candidate match? Give a detailed analysis covering match score, strengths, any skill gaps, and a final recommendation.'
    )
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo">Portfolio Agent</span>
        <span className="app__subtitle">AI representative for {candidateName}</span>
        <span className="app__powered">Powered by Groq + Llama 3.3</span>
      </header>

      <div className="app__body">
        <JobDescriptionPanel
          value={jobDescription}
          onChange={setJobDescription}
          onAnalyze={handleAnalyzeMatch}
          disabled={isStreaming}
        />
        <ChatWindow messages={messages} isStreaming={isStreaming} />
      </div>

      <InputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isStreaming}
      />
    </div>
  )
}
