import { useState } from 'react'

export default function App() {
  const [svc1, setSvc1] = useState<string>('')
  const [svc2, setSvc2] = useState<string>('')
  const [svc3, setSvc3] = useState<string>('')
  const [svc4, setSvc4] = useState<string>('')

  const baseUrl = import.meta.env.VITE_API_URL || '/api'

  async function call(service: 'svc1' | 'svc2' | 'svc3' | 'svc4') {
    try {
      console.log(`[Frontend] Calling ${baseUrl}/${service}/whoami`)
      const res = await fetch(`${baseUrl}/${service}/whoami`)
      console.log(`[Frontend] Response status:`, res.status, res.statusText)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const text = await res.text()
      console.log(`[Frontend] Response text:`, text)
      if (service === 'svc1') setSvc1(text)
      if (service === 'svc2') setSvc2(text)
      if (service === 'svc3') setSvc3(text)
      if (service === 'svc4') setSvc4(text)
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e)
      console.error(`[Frontend] Error calling ${service}:`, err)
      if (service === 'svc1') setSvc1(`錯誤: ${err}`)
      if (service === 'svc2') setSvc2(`錯誤: ${err}`)
      if (service === 'svc3') setSvc3(`錯誤: ${err}`)
      if (service === 'svc4') setSvc4(`錯誤: ${err}`)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '48px auto', fontFamily: 'sans-serif' }}>
      <h2>這是第1個前端</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
        <button onClick={() => call('svc1')}>呼叫 svc1</button>
        <span>{svc1}</span>
        <button onClick={() => call('svc2')}>呼叫 svc2</button>
        <span>{svc2}</span>
        <button onClick={() => call('svc3')}>呼叫 svc3</button>
        <span>{svc3}</span>
        <button onClick={() => call('svc4')}>呼叫 svc4</button>
        <span>{svc4}</span>
      </div>
    </div>
  )
}
