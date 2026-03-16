import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/custom.css';

const HostelEmployeeLinking = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [employees, setEmployees] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedHostels, setCheckedHostels] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const Employee_Id = 0;
        const Status_Id = 1;
        const url = `https://localhost:7291/api/BasicMaster/_GET_EMPLOYEE/${Employee_Id}/${Status_Id}`;
        
        const res = await axios.get(url, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        });

        setEmployees(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
        if (res.data.length > 0) {
          setSelectedEmployeeId(res.data[0].employee_Id);
        }
      } catch (err) {
        console.error('Fetch employees failed:', err);
        setError('Failed to load employees');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [getToken]);

  // Fetch hostels and employee's linked hostels when employee changes
  useEffect(() => {
    const fetchHostelsAndLinking = async () => {
      try {
        if (!selectedEmployeeId) return;

        const token = getToken();
        if (!token) return;

        // Fetch all hostels for the selected employee
        const Hostel_Id = 0;
        const Employee_Id = selectedEmployeeId;
        const Status_Id = 0;
        const hostelUrl = `https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/${Hostel_Id}/${Employee_Id}/${Status_Id}`;
        
        const hostelRes = await axios.get(hostelUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        });

        const hostelData = Array.isArray(hostelRes.data) ? hostelRes.data : [];
        setHostels(hostelData);

        // Fetch employee's linked hostels
        const linkingUrl = `https://localhost:7291/api/BasicMaster/_GET_HOSTEL_EMPLOYEE_LINK/${selectedEmployeeId}/${Status_Id}`;
        
        const linkingRes = await axios.get(linkingUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] })); // If endpoint doesn't exist yet, default to empty

        // Set checked hostels based on linking data
        const initialChecked = {};
        const linkedData = Array.isArray(linkingRes.data) ? linkingRes.data : [];
        
        linkedData.forEach(link => {
          initialChecked[link.hostel_Id] = true;
        });
        
        setCheckedHostels(initialChecked);

      } catch (error) {
        console.error('Fetch failed:', error);
        // Don't set error state here, just log it
      }
    };

    if (selectedEmployeeId) {
      fetchHostelsAndLinking();
    }
  }, [selectedEmployeeId, getToken]);

  const handleEmployeeChange = (event) => {
    setSelectedEmployeeId(event.target.value);
    setCheckedHostels({}); // Reset selections when changing employee
  };

  const handleCheckboxChange = (hostelId) => {
    setCheckedHostels((prev) => ({
      ...prev,
      [hostelId]: !prev[hostelId],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();
      if (!token) return;

      // Get list of checked hostel IDs
      const linkedHostelIds = Object.keys(checkedHostels)
        .filter(hostelId => checkedHostels[hostelId])
        .map(hostelId => parseInt(hostelId));

      // Prepare payload for API
      const payload = {
        Employee_Id: parseInt(selectedEmployeeId),
        Hostel_Ids: linkedHostelIds,
        Status_Id: 1,
        Remarks: 'Updated via Hostel Employee Linking',
        CreatedBy_Login_User_Id: 1, // TODO: Get from logged-in user
        CreatedBy_Login_Session_Id: 1, // TODO: Get from session
        CreatedFrom_Screen: 'HostelEmployeeLinking',
        CreatedFrom_Menu_Code: 'HOSTEL_EMP_LINK',
      };

      console.log('Saving hostel-employee linking:', payload);

      // TODO: Replace with actual API endpoint
      const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveHostelEmployeeLink';
      
      await axios.post(saveUrl, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      alert('Hostel assignments saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving hostel assignments. Please try again.');
      setSaving(false);
    }
  };

  // Filter hostels based on search
  const filteredHostels = hostels.filter(hostel =>
    hostel.hostel_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.hostel_Code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if all visible hostels are selected
  const allSelected = filteredHostels.length > 0 && filteredHostels.every(hostel => checkedHostels[hostel.hostel_Id]);

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    const newCheckedHostels = { ...checkedHostels };

    filteredHostels.forEach(hostel => {
      newCheckedHostels[hostel.hostel_Id] = checked;
    });

    setCheckedHostels(newCheckedHostels);
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  const selectedEmployee = employees.find(e => e.employee_Id === parseInt(selectedEmployeeId));
  const linkedCount = Object.values(checkedHostels).filter(Boolean).length;

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Hostel Employee Linking</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Configuration</li>
            <li className="breadcrumb-item active">Hostel Employee Linking</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-person-badge me-2"></i>
                  Assign Hostels to Employee
                </h5>

                {/* Employee Selection */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <label htmlFor="employeeSelect" className="form-label fw-semibold">
                      <i className="bi bi-person-circle me-1"></i>Select Employee *
                    </label>
                    <select
                      id="employeeSelect"
                      className="form-select"
                      value={selectedEmployeeId}
                      onChange={handleEmployeeChange}
                    >
                      {employees.map((employee) => (
                        <option key={employee.employee_Id} value={employee.employee_Id}>
                          {employee.employee_Name} ({employee.employee_Code})
                        </option>
                      ))}
                    </select>
                    {selectedEmployee && (
                      <small className="text-muted">
                        <i className="bi bi-envelope me-1"></i>
                        {selectedEmployee.employee_Email_Id || 'No email'}
                      </small>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="searchHostel" className="form-label fw-semibold">
                      <i className="bi bi-search me-1"></i>Search Hostel
                    </label>
                    <input
                      type="text"
                      id="searchHostel"
                      className="form-control"
                      placeholder="Type to search by name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4 d-flex align-items-end">
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleSave}
                      disabled={saving || !selectedEmployeeId}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Assignments
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <i className="bi bi-info-circle fs-5 me-2"></i>
                  <div>
                    <strong>Info:</strong> Select which hostels <strong>
                      {selectedEmployee?.employee_Name}
                    </strong> can access and manage. The employee will have permissions for checked hostels only.
                  </div>
                </div>

                {/* Statistics Card */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="card info-card sales-card">
                      <div className="card-body">
                        <h5 className="card-title">Total Hostels</h5>
                        <div className="d-flex align-items-center">
                          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                            <i className="bi bi-building"></i>
                          </div>
                          <div className="ps-3">
                            <h6>{hostels.length}</h6>
                            <span className="text-muted small pt-2">Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card info-card revenue-card">
                      <div className="card-body">
                        <h5 className="card-title">Assigned Hostels</h5>
                        <div className="d-flex align-items-center">
                          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                            <i className="bi bi-check-circle"></i>
                          </div>
                          <div className="ps-3">
                            <h6>{linkedCount}</h6>
                            <span className="text-success small pt-2">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card info-card customers-card">
                      <div className="card-body">
                        <h5 className="card-title">Coverage</h5>
                        <div className="d-flex align-items-center">
                          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                            <i className="bi bi-percent"></i>
                          </div>
                          <div className="ps-3">
                            <h6>{hostels.length > 0 ? ((linkedCount / hostels.length) * 100).toFixed(0) : 0}%</h6>
                            <span className="text-muted small pt-2">Of total</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hostels Table */}
                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th scope="col" style={{ width: '80px' }}>Sr No</th>
                        <th scope="col">Hostel Name</th>
                        <th scope="col" style={{ width: '150px' }}>Hostel Code</th>
                        <th scope="col" style={{ width: '150px' }}>Type</th>
                        <th scope="col" style={{ width: '120px' }}>Total Rooms</th>
                        <th scope="col" style={{ width: '180px' }}>Contact Person</th>
                        <th scope="col" className="text-center" style={{ width: '150px' }}>
                          <div className="form-check d-inline-block">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="selectAll"
                              checked={allSelected}
                              onChange={handleSelectAllChange}
                            />
                            <label className="form-check-label ms-2" htmlFor="selectAll">
                              Assign
                            </label>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHostels.length > 0 ? (
                        filteredHostels.map((hostel, index) => (
                          <tr key={hostel.hostel_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-building-fill me-2 text-primary"></i>
                                <div>
                                  <strong>{hostel.hostel_Name}</strong>
                                  {hostel.hostel_Address && (
                                    <div className="text-muted small">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {hostel.hostel_Address.substring(0, 30)}...
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {hostel.hostel_Code}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {hostel.hostel_Type_Name || 'N/A'}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-primary">
                                {hostel.hostel_Total_Room || 0} rooms
                              </span>
                            </td>
                            <td>
                              {hostel.hostel_Contact_Person_Name && (
                                <>
                                  <div>{hostel.hostel_Contact_Person_Name}</div>
                                  {hostel.hostel_Contact_Person_Mobile_No && (
                                    <small className="text-muted">
                                      <i className="bi bi-telephone me-1"></i>
                                      {hostel.hostel_Contact_Person_Mobile_No}
                                    </small>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="form-check d-inline-block">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`hostel-${hostel.hostel_Id}`}
                                  checked={!!checkedHostels[hostel.hostel_Id]}
                                  onChange={() => handleCheckboxChange(hostel.hostel_Id)}
                                />
                                <label className="form-check-label" htmlFor={`hostel-${hostel.hostel_Id}`}>
                                  {checkedHostels[hostel.hostel_Id] ? (
                                    <span className="badge bg-success ms-2">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Assigned
                                    </span>
                                  ) : (
                                    <span className="badge bg-light text-dark ms-2">
                                      <i className="bi bi-circle me-1"></i>
                                      Not Assigned
                                    </span>
                                  )}
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {searchTerm ? 'No hostels match your search' : 'No hostels available'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Footer */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-light d-flex justify-content-between align-items-center mb-0">
                      <div>
                        <strong>Summary:</strong> 
                        <span className="ms-2">
                          <i className="bi bi-check-circle-fill text-success me-1"></i>
                          {linkedCount} of {hostels.length} hostels assigned to <strong>{selectedEmployee?.employee_Name}</strong>
                        </span>
                      </div>
                      <button
                        className="btn btn-success"
                        onClick={handleSave}
                        disabled={saving || !selectedEmployeeId}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HostelEmployeeLinking;

