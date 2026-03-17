import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Employees from './components/Employees'
import Attendance from './components/Attendance'
import Leave from './components/Leave'
import Auth from './components/Auth'
import './styles/app.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Auth onAuthenticated={() => setSession(true)} />
  }

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="main-content">
        <div className="content-wrapper">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'employees' && <Employees />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'leave' && <Leave />}
        </div>
      </main>
    </div>
  )
}
