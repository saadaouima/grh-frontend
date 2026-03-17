import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Check, X } from 'lucide-react'
import '../styles/leave.css'

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: '',
  })

  useEffect(() => {
    fetchLeaves()
    fetchEmployees()
  }, [])

  const fetchLeaves = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, employees(first_name, last_name, email)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeaves(data || [])
    } catch (error) {
      console.error('Error fetching leave requests:', error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert([formData])

      if (error) throw error

      setShowModal(false)
      setFormData({
        employee_id: '',
        leave_type: 'vacation',
        start_date: '',
        end_date: '',
        reason: '',
      })
      fetchLeaves()
    } catch (error) {
      console.error('Error creating leave request:', error)
    }
  }

  const updateLeaveStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: status,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', id)

      if (error) throw error
      fetchLeaves()
    } catch (error) {
      console.error('Error updating leave status:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
    }
    return colors[status] || '#6b7280'
  }

  const getLeaveTypeLabel = (type) => {
    const labels = {
      vacation: 'Vacation',
      sick: 'Sick Leave',
      personal: 'Personal',
      maternity: 'Maternity',
      other: 'Other',
    }
    return labels[type] || type
  }

  return (
    <div className="leave-view">
      <div className="view-header">
        <div>
          <h2>Leave Requests</h2>
          <p className="view-subtitle">Manage leave and vacation requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> New Request
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading leave requests...</div>
      ) : (
        <div className="leave-sections">
          {['pending', 'approved', 'rejected'].map(status => (
            <div key={status} className="leave-section">
              <h3 className="section-title">
                {status.charAt(0).toUpperCase() + status.slice(1)} Requests
              </h3>
              {leaves.filter(l => l.status === status).length === 0 ? (
                <div className="empty-state">
                  <p>No {status} leave requests</p>
                </div>
              ) : (
                <div className="leave-cards">
                  {leaves.filter(l => l.status === status).map(leave => {
                    const start = new Date(leave.start_date)
                    const end = new Date(leave.end_date)
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

                    return (
                      <div key={leave.id} className="leave-card">
                        <div className="leave-card-header">
                          <div>
                            <h4>
                              {leave.employees?.first_name} {leave.employees?.last_name}
                            </h4>
                            <p className="leave-type">
                              {getLeaveTypeLabel(leave.leave_type)}
                            </p>
                          </div>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(leave.status) }}
                          >
                            {leave.status}
                          </span>
                        </div>

                        <div className="leave-details">
                          <div className="detail-row">
                            <span className="label">Period:</span>
                            <span className="value">
                              {start.toLocaleDateString()} - {end.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Days:</span>
                            <span className="value">{days} days</span>
                          </div>
                          {leave.reason && (
                            <div className="detail-row">
                              <span className="label">Reason:</span>
                              <span className="value">{leave.reason}</span>
                            </div>
                          )}
                        </div>

                        {status === 'pending' && (
                          <div className="leave-actions">
                            <button
                              className="btn-action approve"
                              onClick={() => updateLeaveStatus(leave.id, 'approved')}
                            >
                              <Check size={16} /> Approve
                            </button>
                            <button
                              className="btn-action reject"
                              onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                            >
                              <X size={16} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Leave Request</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Employee</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal</option>
                  <option value="maternity">Maternity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
