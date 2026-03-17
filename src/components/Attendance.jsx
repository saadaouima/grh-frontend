import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Check, X } from 'lucide-react'
import '../styles/attendance.css'

export default function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState('')

  useEffect(() => {
    fetchAttendance()
    fetchEmployees()
  }, [selectedDate])

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, employees(id, first_name, last_name, email)')
        .eq('date', selectedDate)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAttendance(data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('first_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const markAttendance = async (employeeId, status) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employeeId,
          date: selectedDate,
          status: status,
          check_in: status === 'present' ? new Date().toTimeString().split(' ')[0] : null,
        }, {
          onConflict: 'employee_id, date'
        })

      if (error) throw error
      fetchAttendance()
    } catch (error) {
      console.error('Error marking attendance:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      present: '#10b981',
      absent: '#ef4444',
      late: '#f59e0b',
      half_day: '#3b82f6',
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className="attendance-view">
      <div className="view-header">
        <div>
          <h2>Attendance</h2>
          <p className="view-subtitle">Track employee attendance</p>
        </div>
      </div>

      <div className="attendance-controls">
        <div className="control-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading attendance records...</div>
      ) : (
        <div className="attendance-content">
          <div className="quick-mark">
            <h3>Mark Attendance for Today</h3>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
            <div className="quick-buttons">
              <button className="btn-status present" onClick={() => {
                if (selectedEmployee) {
                  markAttendance(selectedEmployee, 'present')
                  setSelectedEmployee('')
                }
              }}>
                <Check size={18} /> Present
              </button>
              <button className="btn-status absent" onClick={() => {
                if (selectedEmployee) {
                  markAttendance(selectedEmployee, 'absent')
                  setSelectedEmployee('')
                }
              }}>
                <X size={18} /> Absent
              </button>
              <button className="btn-status late" onClick={() => {
                if (selectedEmployee) {
                  markAttendance(selectedEmployee, 'late')
                  setSelectedEmployee('')
                }
              }}>
                <Calendar size={18} /> Late
              </button>
            </div>
          </div>

          <div className="attendance-list">
            <h3>Attendance for {selectedDate}</h3>
            {attendance.length === 0 ? (
              <div className="empty-state">
                <p>No attendance records for this date</p>
              </div>
            ) : (
              <div className="records-grid">
                {attendance.map(record => (
                  <div key={record.id} className="record-card">
                    <div className="record-header">
                      <span className="emp-name">
                        {record.employees?.first_name} {record.employees?.last_name}
                      </span>
                      <span
                        className="status-pill"
                        style={{ backgroundColor: getStatusColor(record.status) }}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div className="record-details">
                      <div className="detail">
                        <span className="label">Check In:</span>
                        <span className="value">{record.check_in || '-'}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Check Out:</span>
                        <span className="value">{record.check_out || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
