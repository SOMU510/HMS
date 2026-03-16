import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/custom.css';

const PendingHostlerList = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [hostlers, setHostlers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    hostelId: '',
    searchTerm: '',
    fromDate: '',
    toDate: '',
    hostlerType: '',
  });

  const [selectedHostlers, setSelectedHostlers] = useState([]);

  // Hostler Types (example - adjust based on your enum)
  const hostlerTypes = [
    { id: 1, name: 'Regular Student' },
    { id: 2, name: 'Guest' },
    { id: 3, name: 'Staff' },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) return;

        // Fetch pending hostlers (Status_Id = 2 for pending)
        const hostlerUrl = 'https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/2';
        const hostlerRes = await axios.get(hostlerUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));

        setHostlers(Array.isArray(hostlerRes.data) ? hostlerRes.data : []);

        // Fetch hostels for filter
        const hostelUrl = 'https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/0/1';
        const hostelRes = await axios.get(hostelUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));

        setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Fetch failed:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken, refresh]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectHostler = (hostlerId) => {
    setSelectedHostlers((prev) => {
      if (prev.includes(hostlerId)) {
        return prev.filter((id) => id !== hostlerId);
      } else {
        return [...prev, hostlerId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedHostlers(filteredHostlers.map((h) => h.hostler_Id));
    } else {
      setSelectedHostlers([]);
    }
  };

  const handleApprove = async (hostlerId) => {
    try {
      const token = getToken();
      if (!token) return;

      const confirmApprove = window.confirm('Are you sure you want to approve this hostler?');
      if (!confirmApprove) return;

      const approveUrl = 'https://localhost:7291/api/BasicMaster/ApproveHostler';
      await axios.post(
        approveUrl,
        {
          Hostler_Id: hostlerId,
          Status_Id: 1, // 1 for approved/active
          Action_Remarks: 'Approved',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Hostler approved successfully!');
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Error approving hostler. Please try again.');
    }
  };

  const handleReject = async (hostlerId) => {
    try {
      const token = getToken();
      if (!token) return;

      const remarks = prompt('Enter rejection reason:');
      if (!remarks) return;

      const rejectUrl = 'https://localhost:7291/api/BasicMaster/RejectHostler';
      await axios.post(
        rejectUrl,
        {
          Hostler_Id: hostlerId,
          Status_Id: 3, // 3 for rejected
          Action_Remarks: remarks,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Hostler rejected!');
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Reject failed:', error);
      alert('Error rejecting hostler. Please try again.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedHostlers.length === 0) {
      alert('Please select at least one hostler to approve.');
      return;
    }

    const confirmBulk = window.confirm(
      `Are you sure you want to approve ${selectedHostlers.length} selected hostler(s)?`
    );
    if (!confirmBulk) return;

    try {
      const token = getToken();
      if (!token) return;

      const bulkApproveUrl = 'https://localhost:7291/api/BasicMaster/BulkApproveHostlers';
      await axios.post(
        bulkApproveUrl,
        {
          Hostler_Ids: selectedHostlers,
          Status_Id: 1,
          Action_Remarks: 'Bulk Approved',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Selected hostlers approved successfully!');
      setSelectedHostlers([]);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Bulk approve failed:', error);
      alert('Error in bulk approval. Please try again.');
    }
  };

  const handleExport = () => {
    // Convert filtered data to CSV
    const headers = ['Name', 'Code', 'Email', 'Mobile', 'Registration Date', 'Hostel', 'Status'];
    const csvData = filteredHostlers.map((h) => [
      h.hostler_Name,
      h.hostler_Code,
      h.hostler_Email_Id || '',
      h.hostler_Mobile_No || '',
      h.hostler_Registration_Date ? new Date(h.hostler_Registration_Date).toLocaleDateString() : '',
      h.hostel_Name || '',
      'Pending',
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending_hostlers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Apply filters
  const filteredHostlers = hostlers.filter((hostler) => {
    const matchesHostel = !filters.hostelId || hostler.hostel_Id === parseInt(filters.hostelId);
    const matchesSearch =
      !filters.searchTerm ||
      hostler.hostler_Name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      hostler.hostler_Code?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      hostler.hostler_Email_Id?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesType = !filters.hostlerType || hostler.hostler_Type_Enum_Id === parseInt(filters.hostlerType);

    let matchesDate = true;
    if (filters.fromDate && hostler.hostler_Registration_Date) {
      matchesDate = matchesDate && new Date(hostler.hostler_Registration_Date) >= new Date(filters.fromDate);
    }
    if (filters.toDate && hostler.hostler_Registration_Date) {
      matchesDate = matchesDate && new Date(hostler.hostler_Registration_Date) <= new Date(filters.toDate);
    }

    return matchesHostel && matchesSearch && matchesType && matchesDate;
  });

  // Statistics
  const stats = {
    total: filteredHostlers.length,
    today: filteredHostlers.filter((h) => {
      if (!h.hostler_Registration_Date) return false;
      const regDate = new Date(h.hostler_Registration_Date).toDateString();
      const today = new Date().toDateString();
      return regDate === today;
    }).length,
    thisWeek: filteredHostlers.filter((h) => {
      if (!h.hostler_Registration_Date) return false;
      const regDate = new Date(h.hostler_Registration_Date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return regDate >= weekAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Pending Hostler List</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Reports</li>
            <li className="breadcrumb-item active">Pending Hostlers</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          {/* Statistics Cards */}
          <div className="col-lg-4 col-md-6">
            <div className="card info-card sales-card">
              <div className="card-body">
                <h5 className="card-title">Total Pending</h5>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i className="bi bi-hourglass-split"></i>
                  </div>
                  <div className="ps-3">
                    <h6>{stats.total}</h6>
                    <span className="text-muted small pt-2">Awaiting Approval</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card info-card revenue-card">
              <div className="card-body">
                <h5 className="card-title">Today's Registrations</h5>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i className="bi bi-calendar-day"></i>
                  </div>
                  <div className="ps-3">
                    <h6>{stats.today}</h6>
                    <span className="text-success small pt-2">New Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card info-card customers-card">
              <div className="card-body">
                <h5 className="card-title">This Week</h5>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i className="bi bi-calendar-week"></i>
                  </div>
                  <div className="ps-3">
                    <h6>{stats.thisWeek}</h6>
                    <span className="text-info small pt-2">Last 7 Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-funnel me-2"></i>Filters
                </h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label htmlFor="hostelId" className="form-label">Hostel</label>
                    <select
                      className="form-select"
                      id="hostelId"
                      name="hostelId"
                      value={filters.hostelId}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Hostels</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.hostel_Id} value={hostel.hostel_Id}>
                          {hostel.hostel_Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="hostlerType" className="form-label">Hostler Type</label>
                    <select
                      className="form-select"
                      id="hostlerType"
                      name="hostlerType"
                      value={filters.hostlerType}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      {hostlerTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label htmlFor="fromDate" className="form-label">From Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fromDate"
                      name="fromDate"
                      value={filters.fromDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="col-md-2">
                    <label htmlFor="toDate" className="form-label">To Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="toDate"
                      name="toDate"
                      value={filters.toDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      className="btn btn-secondary w-100"
                      onClick={() =>
                        setFilters({
                          hostelId: '',
                          searchTerm: '',
                          fromDate: '',
                          toDate: '',
                          hostlerType: '',
                        })
                      }
                    >
                      <i className="bi bi-x-circle me-1"></i>Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Hostlers List */}
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Pending Hostlers ({filteredHostlers.length})
                  </h5>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, code, or email..."
                      style={{ width: '300px' }}
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    />
                    {selectedHostlers.length > 0 && (
                      <button className="btn btn-success" onClick={handleBulkApprove}>
                        <i className="bi bi-check-circle me-1"></i>
                        Approve Selected ({selectedHostlers.length})
                      </button>
                    )}
                    <button className="btn btn-info" onClick={handleExport}>
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      Export
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={handleSelectAll}
                            checked={
                              filteredHostlers.length > 0 &&
                              selectedHostlers.length === filteredHostlers.length
                            }
                          />
                        </th>
                        <th scope="col">#</th>
                        <th scope="col">Hostler Details</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Hostel</th>
                        <th scope="col">Registration Date</th>
                        <th scope="col">Type</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHostlers.length > 0 ? (
                        filteredHostlers.map((hostler, index) => (
                          <tr key={hostler.hostler_Id}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedHostlers.includes(hostler.hostler_Id)}
                                onChange={() => handleSelectHostler(hostler.hostler_Id)}
                              />
                            </td>
                            <td>{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  {hostler.hostler_Profile_Pic_Path ? (
                                    <img
                                      src={hostler.hostler_Profile_Pic_Path}
                                      alt=""
                                      className="rounded-circle"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                      style={{ width: '40px', height: '40px' }}
                                    >
                                      {hostler.hostler_Name?.charAt(0) || 'H'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <strong>{hostler.hostler_Name}</strong>
                                  <div className="text-muted small">{hostler.hostler_Code}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <i className="bi bi-envelope me-1"></i>
                                <small>{hostler.hostler_Email_Id || 'N/A'}</small>
                              </div>
                              <div>
                                <i className="bi bi-telephone me-1"></i>
                                <small>{hostler.hostler_Mobile_No || 'N/A'}</small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {hostler.hostel_Name || 'Not Assigned'}
                              </span>
                            </td>
                            <td>
                              {hostler.hostler_Registration_Date ? (
                                <small>
                                  {new Date(hostler.hostler_Registration_Date).toLocaleDateString()}
                                </small>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {hostlerTypes.find((t) => t.id === hostler.hostler_Type_Enum_Id)?.name || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-warning">
                                <i className="bi bi-hourglass-split me-1"></i>
                                Pending
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-success me-1"
                                onClick={() => handleApprove(hostler.hostler_Id)}
                                title="Approve"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleReject(hostler.hostler_Id)}
                                title="Reject"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => navigate(`/hms/hostlermaster/${hostler.hostler_Id}`)}
                                title="View Details"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-5">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {filters.searchTerm || filters.hostelId || filters.hostlerType
                                ? 'No pending hostlers match your filters.'
                                : 'No pending hostlers found.'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PendingHostlerList;

