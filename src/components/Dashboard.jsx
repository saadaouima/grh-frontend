import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Users, TrendingUp, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import '../styles/dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, presentRes, leaveRes, pendingRes] = await Promise.all([
          supabase.from('employees').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('attendance').select('id', { count: 'exact' }).eq('status', 'present').eq('date', new Date().toISOString().split('T')[0]),
          supabase.from('employees').select('id', { count: 'exact' }).eq('status', 'on_leave'),
          supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        ])

        setStats({
          totalEmployees: employeesRes.count || 0,
          presentToday: presentRes.count || 0,
          onLeave: leaveRes.count || 0,
          pending: pendingRes.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{loading ? '-' : value}</p>
      </div>
    </div>
  )

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <h2>Dashboard</h2>
        <p className="view-subtitle">Welcome to your HR admin dashboard</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees} color="blue" />
        <StatCard icon={CheckCircle} label="Present Today" value={stats.presentToday} color="green" />
        <StatCard icon={TrendingUp} label="On Leave" value={stats.onLeave} color="yellow" />
        <StatCard icon={AlertCircle} label="Pending Requests" value={stats.pending} color="orange" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="btn btn-primary">Add Employee</button>
            <button className="btn btn-secondary">Mark Attendance</button>
            <button className="btn btn-secondary">View Reports</button>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>System Status</h3>
          <div className="status-list">
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>Database: Connected</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>API: Active</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>System: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
