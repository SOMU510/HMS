import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/custom.css';

const TermAndConditionMaster = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  // Form state
  const [formData, setFormData] = useState({
    TermAndCondition_Id: 0,
    Hostel_Id: '',
    TermAndCondition_Title: '',
    TermAndCondition_Code: '',
    TermAndCondition_Description: '',
    Status_Id: 1,
    Remarks: '',
    Action_Remarks: '',
  });

  // Dropdown data
  const [hostels, setHostels] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch hostels and terms & conditions on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Fetch hostels
        const hostelRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/0/1',
          { headers: { Authorization: token } }
        );
        setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);

        // Fetch all terms and conditions
        await fetchTermsConditions(token);

        setLoading(false);
      } catch (err) {
        console.error('Fetch initial data failed:', err);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [getToken]);

  const fetchTermsConditions = async (token = null) => {
    try {
      const authToken = token || getToken();
      if (!authToken) return;

      // Parameters: TermAndCondition_Id, Hostel_Id, Status_Id
      const TermAndCondition_Id = 0;
      const Hostel_Id = 0;
      const Status_Id = 0; // 0 = All statuses

      const res = await axios.get(
        `https://localhost:7291/api/BasicMaster/_GET_TERMSANDCONDITION/${TermAndCondition_Id}/${Hostel_Id}/${Status_Id}`,
        { headers: { Authorization: authToken } }
      );

      setTermsConditions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch terms and conditions failed:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      TermAndCondition_Id: 0,
      Hostel_Id: '',
      TermAndCondition_Title: '',
      TermAndCondition_Code: '',
      TermAndCondition_Description: '',
      Status_Id: 1,
      Remarks: '',
      Action_Remarks: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.TermAndCondition_Title.trim()) {
      alert('Please enter Terms & Conditions Title');
      return;
    }

    if (!formData.TermAndCondition_Code.trim()) {
      alert('Please enter Terms & Conditions Code');
      return;
    }

    if (!formData.Hostel_Id) {
      alert('Please select a Hostel');
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      if (!token) return;

      const payload = {
        TermAndCondition_Id: formData.TermAndCondition_Id,
        Hostel_Id: parseInt(formData.Hostel_Id),
        TermAndCondition_Title: formData.TermAndCondition_Title.trim(),
        TermAndCondition_Code: formData.TermAndCondition_Code.trim(),
        TermAndCondition_Description: formData.TermAndCondition_Description.trim(),
        Status_Id: parseInt(formData.Status_Id),
        Remarks: formData.Remarks,
        Action_Remarks: formData.Action_Remarks,
        CreatedBy_Login_User_Id: 1, // TODO: Get from logged-in user
        CreatedBy_Login_Session_Id: 1,
        CreatedFrom_Screen: 'TermAndConditionMaster',
        CreatedFrom_Menu_Code: 'TERM_CONDITION_MASTER',
      };

      console.log('Saving terms and conditions:', payload);

      // TODO: Replace with actual save API endpoint
      const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveTermCondition';

      await axios.post(saveUrl, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      alert(
        formData.TermAndCondition_Id > 0
          ? 'Terms & Conditions updated successfully!'
          : 'Terms & Conditions created successfully!'
      );

      resetForm();
      await fetchTermsConditions();
      setSaving(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving Terms & Conditions. Please try again.');
      setSaving(false);
    }
  };

  const handleEdit = (term) => {
    setFormData({
      TermAndCondition_Id: term.termAndCondition_Id || 0,
      Hostel_Id: term.hostel_Id || '',
      TermAndCondition_Title: term.termAndCondition_Title || '',
      TermAndCondition_Code: term.termAndCondition_Code || '',
      TermAndCondition_Description: term.termAndCondition_Description || '',
      Status_Id: term.status_Id || 1,
      Remarks: term.remarks || '',
      Action_Remarks: term.action_Remarks || '',
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (termId) => {
    if (!window.confirm('Are you sure you want to delete this Terms & Conditions?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual delete API endpoint
      await axios.delete(
        `https://localhost:7291/api/BasicMaster/DeleteTermCondition/${termId}`,
        { headers: { Authorization: token } }
      );

      alert('Terms & Conditions deleted successfully!');
      await fetchTermsConditions();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Error deleting Terms & Conditions. Please try again.');
    }
  };

  // Filter terms and conditions
  const filteredTermsConditions = termsConditions.filter(term => {
    const matchesSearch =
      term.termAndCondition_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.termAndCondition_Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.termAndCondition_Description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHostel = !filterHostel || term.hostel_Id === parseInt(filterHostel);
    const matchesStatus = !filterStatus || term.status_Id === parseInt(filterStatus);

    return matchesSearch && matchesHostel && matchesStatus;
  });

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

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Terms & Conditions Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Terms & Conditions</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          {/* Form Card */}
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-file-text me-2"></i>
                  {formData.TermAndCondition_Id > 0 ? 'Edit' : 'Add New'} Terms & Conditions
                </h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Basic Information */}
                    <div className="col-12">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        Basic Information
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Id" className="form-label fw-semibold">
                        Hostel *
                      </label>
                      <select
                        id="Hostel_Id"
                        name="Hostel_Id"
                        className="form-select"
                        value={formData.Hostel_Id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Hostel</option>
                        {hostels.map(hostel => (
                          <option key={hostel.hostel_Id} value={hostel.hostel_Id}>
                            {hostel.hostel_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="TermAndCondition_Title" className="form-label fw-semibold">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="TermAndCondition_Title"
                        name="TermAndCondition_Title"
                        className="form-control"
                        value={formData.TermAndCondition_Title}
                        onChange={handleInputChange}
                        placeholder="Enter title"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="TermAndCondition_Code" className="form-label fw-semibold">
                        Code *
                      </label>
                      <input
                        type="text"
                        id="TermAndCondition_Code"
                        name="TermAndCondition_Code"
                        className="form-control"
                        value={formData.TermAndCondition_Code}
                        onChange={handleInputChange}
                        placeholder="Enter code (e.g., TC001)"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-card-text me-2"></i>
                        Description
                      </h6>
                    </div>

                    <div className="col-12">
                      <label htmlFor="TermAndCondition_Description" className="form-label fw-semibold">
                        Terms & Conditions Description
                      </label>
                      <textarea
                        id="TermAndCondition_Description"
                        name="TermAndCondition_Description"
                        className="form-control"
                        rows="8"
                        value={formData.TermAndCondition_Description}
                        onChange={handleInputChange}
                        placeholder="Enter detailed terms and conditions..."
                      ></textarea>
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Write comprehensive terms and conditions that hostlers must agree to
                      </small>
                    </div>

                    {/* Status and Remarks */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-gear me-2"></i>
                        Status & Additional Information
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Status_Id" className="form-label fw-semibold">
                        Status *
                      </label>
                      <select
                        id="Status_Id"
                        name="Status_Id"
                        className="form-select"
                        value={formData.Status_Id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Remarks" className="form-label fw-semibold">
                        Remarks
                      </label>
                      <textarea
                        id="Remarks"
                        name="Remarks"
                        className="form-control"
                        rows="3"
                        value={formData.Remarks}
                        onChange={handleInputChange}
                        placeholder="Enter remarks..."
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Action_Remarks" className="form-label fw-semibold">
                        Action Remarks
                      </label>
                      <textarea
                        id="Action_Remarks"
                        name="Action_Remarks"
                        className="form-control"
                        rows="3"
                        value={formData.Action_Remarks}
                        onChange={handleInputChange}
                        placeholder="Enter action remarks..."
                      ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary me-2"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            {formData.TermAndCondition_Id > 0 ? 'Update' : 'Save'} Terms & Conditions
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-table me-2"></i>
                  Terms & Conditions List
                </h5>

                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by title, code, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterHostel}
                      onChange={(e) => setFilterHostel(e.target.value)}
                    >
                      <option value="">All Hostels</option>
                      {hostels.map(hostel => (
                        <option key={hostel.hostel_Id} value={hostel.hostel_Id}>
                          {hostel.hostel_Name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterHostel('');
                        setFilterStatus('');
                      }}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Total Records:</strong> {filteredTermsConditions.length}
                  </div>
                  <div>
                    <span className="badge bg-success me-2">
                      Active: {filteredTermsConditions.filter(t => t.status_Id === 1).length}
                    </span>
                    <span className="badge bg-secondary">
                      Inactive: {filteredTermsConditions.filter(t => t.status_Id === 0).length}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Sr No</th>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Hostel</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTermsConditions.length > 0 ? (
                        filteredTermsConditions.map((term, index) => (
                          <tr key={term.termAndCondition_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge bg-info">
                                {term.termAndCondition_Code}
                              </span>
                            </td>
                            <td>
                              <strong>{term.termAndCondition_Title}</strong>
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {term.hostel_Name || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  maxWidth: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={term.termAndCondition_Description}
                              >
                                {term.termAndCondition_Description || '-'}
                              </div>
                            </td>
                            <td>
                              {term.status_Id === 1 ? (
                                <span className="badge bg-success">Active</span>
                              ) : (
                                <span className="badge bg-secondary">Inactive</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleEdit(term)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(term.termAndCondition_Id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {searchTerm || filterHostel || filterStatus
                                ? 'No records match your filters'
                                : 'No terms and conditions found. Add one to get started!'}
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

export default TermAndConditionMaster;

