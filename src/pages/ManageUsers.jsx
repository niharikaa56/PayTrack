import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving client registry files..." />;
  }

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.company && u.company.toLowerCase().includes(term))
    );
  });

  return (
    <div className="container py-4">
      {/* Breadcrumb row */}
      <div className="mb-4 border-bottom pb-3">
        <Link to="/admin" className="btn btn-sm btn-outline-danger rounded-pill px-3 mb-3 text-decoration-none">
          <i className="fa-solid fa-arrow-left me-1"></i>Back to Admin Dashboard
        </Link>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="fw-bold mb-1 text-danger">Manage Client Directory</h1>
            <p className="text-muted mb-0">Review profiles, company affiliations, and registration timestamps.</p>
          </div>
          
          {/* Search bar */}
          <div className="position-relative" style={{ minWidth: '280px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-white shadow-sm border"
              placeholder="Search by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 bg-white rounded-4 shadow-sm">
        <div className="card-body p-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-user-slash fs-1 mb-3 opacity-50 text-danger"></i>
              <p className="mb-0 fw-semibold">No clients match your filter parameters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted border-bottom">
                    <th className="py-3 ps-3">Client Profile</th>
                    <th className="py-3">E-Mail Address</th>
                    <th className="py-3">Affiliation / Company</th>
                    <th className="py-3">Account Security Role</th>
                    <th className="py-3 pe-3 text-end">Onboarded On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td className="py-3.5 ps-3">
                        <div className="d-flex align-items-center gap-2.5">
                          <div className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}>
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">{u.name}</span>
                            {u.phone && <small className="text-muted font-mono">{u.phone}</small>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 fw-medium text-dark">{u.email}</td>
                      <td className="py-3.5 text-muted fw-semibold">{u.company || <span className="opacity-50">N/A</span>}</td>
                      <td className="py-3.5">
                        <span className={`badge rounded-pill px-3 py-1.5 fw-bold ${u.role === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 pe-3 text-end text-muted small">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
