import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatusDropdown from './statusdropdown';
import '../style/custom.css';

const OtherCharges = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [formData, setFormData] = useState({
    Hostler_Caution_Money_Other_Charges_Id: 0,
    Hostler_Id: '',
    Is_Hostler_Caution_Money_Paid: false,
    Caution_Money_Paid_Amount: '',
    Caution_Money_Paid_DateTime: '',
    Is_Hostler_Caution_Money_Refunded: false,
    Caution_Money_Refunded_Amount: '',
    Hostler_Caution_Money_Refunded_DateTime: '',
    Other_Charges_Paid_Amount: '',
    Status_Id: '',
    Remarks: '',
  });

  const [charges, setCharges] = useState([]);
  const [hostlers, setHostlers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch hostlers and charges on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // Fetch hostlers
        const hostlerUrl = 'https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/1';
        const hostlerRes = await axios.get(hostlerUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        });
        setHostlers(Array.isArray(hostlerRes.data) ? hostlerRes.data : []);

        // Fetch charges records
        const chargesUrl = 'https://localhost:7291/api/BasicMaster/_GET_HOSTLER_CAUTION_MONEY_OTHER_CHARGES/0/1';
        const chargesRes = await axios.get(chargesUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));
        
        setCharges(Array.isArray(chargesRes.data) ? chargesRes.data : []);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    fetchData();
  }, [getToken, refresh]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) return;

      const payload = {
        Hostler_Caution_Money_Other_Charges_Id: formData.Hostler_Caution_Money_Other_Charges_Id,
        Hostler_Id: parseInt(formData.Hostler_Id),
        Is_Hostler_Caution_Money_Paid: formData.Is_Hostler_Caution_Money_Paid,
        Caution_Money_Paid_Amount: formData.Caution_Money_Paid_Amount ? parseFloat(formData.Caution_Money_Paid_Amount) : null,
        Caution_Money_Paid_DateTime: formData.Caution_Money_Paid_DateTime || null,
        Is_Hostler_Caution_Money_Refunded: formData.Is_Hostler_Caution_Money_Refunded,
        Caution_Money_Refunded_Amount: formData.Caution_Money_Refunded_Amount ? parseFloat(formData.Caution_Money_Refunded_Amount) : null,
        Hostler_Caution_Money_Refunded_DateTime: formData.Hostler_Caution_Money_Refunded_DateTime || null,
        Other_Charges_Paid_Amount: formData.Other_Charges_Paid_Amount ? parseFloat(formData.Other_Charges_Paid_Amount) : null,
        Status_Id: parseInt(formData.Status_Id),
        Remarks: formData.Remarks,
        CreatedBy_Login_User_Id: 1, // TODO: Get from logged-in user
        CreatedBy_Login_Session_Id: 1,
        CreatedFrom_Screen: 'OtherCharges',
        CreatedFrom_Menu_Code: 'OTHER_CHARGES',
      };

      const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveHostlerCautionMoneyOtherCharges';
      
      await axios.post(saveUrl, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      alert(isEditing ? 'Record Updated Successfully' : 'Record Saved Successfully');
      handleReset();
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (charge) => {
    setFormData({
      Hostler_Caution_Money_Other_Charges_Id: charge.hostler_Caution_Money_Other_Charges_Id,
      Hostler_Id: charge.hostler_Id,
      Is_Hostler_Caution_Money_Paid: charge.is_Hostler_Caution_Money_Paid || false,
      Caution_Money_Paid_Amount: charge.caution_Money_Paid_Amount || '',
      Caution_Money_Paid_DateTime: charge.caution_Money_Paid_DateTime ? 
        new Date(charge.caution_Money_Paid_DateTime).toISOString().slice(0, 16) : '',
      Is_Hostler_Caution_Money_Refunded: charge.is_Hostler_Caution_Money_Refunded || false,
      Caution_Money_Refunded_Amount: charge.caution_Money_Refunded_Amount || '',
      Hostler_Caution_Money_Refunded_DateTime: charge.hostler_Caution_Money_Refunded_DateTime ?
        new Date(charge.hostler_Caution_Money_Refunded_DateTime).toISOString().slice(0, 16) : '',
      Other_Charges_Paid_Amount: charge.other_Charges_Paid_Amount || '',
      Status_Id: charge.status_Id,
      Remarks: charge.remarks || '',
    });
    setIsEditing(true);
  };

  const handleReset = () => {
    setFormData({
      Hostler_Caution_Money_Other_Charges_Id: 0,
      Hostler_Id: '',
      Is_Hostler_Caution_Money_Paid: false,
      Caution_Money_Paid_Amount: '',
      Caution_Money_Paid_DateTime: '',
      Is_Hostler_Caution_Money_Refunded: false,
      Caution_Money_Refunded_Amount: '',
      Hostler_Caution_Money_Refunded_DateTime: '',
      Other_Charges_Paid_Amount: '',
      Status_Id: '',
      Remarks: '',
    });
    setIsEditing(false);
  };

  const filteredCharges = charges.filter((charge) => {
    const hostlerName = charge.hostler_Name ?? '';
    const search = searchTerm.toLowerCase();
    return hostlerName.toLowerCase().includes(search);
  });

  const calculateTotals = () => {
    const totalCautionPaid = filteredCharges.reduce((sum, c) => sum + (parseFloat(c.caution_Money_Paid_Amount) || 0), 0);
    const totalCautionRefunded = filteredCharges.reduce((sum, c) => sum + (parseFloat(c.caution_Money_Refunded_Amount) || 0), 0);
    const totalOtherCharges = filteredCharges.reduce((sum, c) => sum + (parseFloat(c.other_Charges_Paid_Amount) || 0), 0);
    return { totalCautionPaid, totalCautionRefunded, totalOtherCharges };
  };

  const totals = calculateTotals();

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Caution Money & Other Charges</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Financial</li>
            <li className="breadcrumb-item active">Other Charges</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-cash-coin me-2"></i>
                  {isEditing ? 'Edit Charges Record' : 'Add New Charges Record'}
                </h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Hostler Selection */}
                    <div className="col-md-6">
                      <label htmlFor="Hostler_Id" className="form-label">
                        <i className="bi bi-person me-1"></i>Select Hostler *
                      </label>
                      <select
                        className="form-select"
                        id="Hostler_Id"
                        name="Hostler_Id"
                        value={formData.Hostler_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Hostler</option>
                        {hostlers.map((hostler) => (
                          <option key={hostler.hostler_Id} value={hostler.hostler_Id}>
                            {hostler.hostler_Name} - {hostler.hostler_Code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label htmlFor="Status_Id" className="form-label">
                        <i className="bi bi-check-circle me-1"></i>Status *
                      </label>
                      <StatusDropdown
                        name="Status_Id"
                        value={formData.Status_Id}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Caution Money Payment Section */}
                    <div className="col-12">
                      <div className="alert alert-primary">
                        <h6 className="alert-heading">
                          <i className="bi bi-wallet2 me-2"></i>Caution Money Payment Details
                        </h6>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="Is_Hostler_Caution_Money_Paid"
                          name="Is_Hostler_Caution_Money_Paid"
                          checked={formData.Is_Hostler_Caution_Money_Paid}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="Is_Hostler_Caution_Money_Paid">
                          <i className="bi bi-check-circle me-1"></i>Caution Money Paid
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Caution_Money_Paid_Amount" className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>Amount Paid
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Caution_Money_Paid_Amount"
                        name="Caution_Money_Paid_Amount"
                        value={formData.Caution_Money_Paid_Amount}
                        onChange={handleChange}
                        step="0.01"
                        disabled={!formData.Is_Hostler_Caution_Money_Paid}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Caution_Money_Paid_DateTime" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>Payment Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="Caution_Money_Paid_DateTime"
                        name="Caution_Money_Paid_DateTime"
                        value={formData.Caution_Money_Paid_DateTime}
                        onChange={handleChange}
                        disabled={!formData.Is_Hostler_Caution_Money_Paid}
                      />
                    </div>

                    {/* Caution Money Refund Section */}
                    <div className="col-12">
                      <div className="alert alert-warning">
                        <h6 className="alert-heading">
                          <i className="bi bi-arrow-return-left me-2"></i>Caution Money Refund Details
                        </h6>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="Is_Hostler_Caution_Money_Refunded"
                          name="Is_Hostler_Caution_Money_Refunded"
                          checked={formData.Is_Hostler_Caution_Money_Refunded}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="Is_Hostler_Caution_Money_Refunded">
                          <i className="bi bi-arrow-clockwise me-1"></i>Caution Money Refunded
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Caution_Money_Refunded_Amount" className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>Amount Refunded
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Caution_Money_Refunded_Amount"
                        name="Caution_Money_Refunded_Amount"
                        value={formData.Caution_Money_Refunded_Amount}
                        onChange={handleChange}
                        step="0.01"
                        disabled={!formData.Is_Hostler_Caution_Money_Refunded}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostler_Caution_Money_Refunded_DateTime" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>Refund Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="Hostler_Caution_Money_Refunded_DateTime"
                        name="Hostler_Caution_Money_Refunded_DateTime"
                        value={formData.Hostler_Caution_Money_Refunded_DateTime}
                        onChange={handleChange}
                        disabled={!formData.Is_Hostler_Caution_Money_Refunded}
                      />
                    </div>

                    {/* Other Charges Section */}
                    <div className="col-12">
                      <div className="alert alert-info">
                        <h6 className="alert-heading">
                          <i className="bi bi-receipt me-2"></i>Other Charges
                        </h6>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Other_Charges_Paid_Amount" className="form-label">
                        <i className="bi bi-cash-stack me-1"></i>Other Charges Amount
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Other_Charges_Paid_Amount"
                        name="Other_Charges_Paid_Amount"
                        value={formData.Other_Charges_Paid_Amount}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="Enter any other charges amount"
                      />
                    </div>

                    {/* Remarks */}
                    <div className="col-md-6">
                      <label htmlFor="Remarks" className="form-label">
                        <i className="bi bi-chat-left-text me-1"></i>Remarks
                      </label>
                      <textarea
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        rows="2"
                        value={formData.Remarks}
                        onChange={handleChange}
                        placeholder="Enter any remarks or notes..."
                      ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle me-1"></i>
                        {isEditing ? 'Update Record' : 'Save Record'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={handleReset}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        {isEditing ? 'Cancel' : 'Reset'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Caution Paid</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-wallet2"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totals.totalCautionPaid.toFixed(2)}</h6>
                        <span className="text-success small pt-2">Received</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Caution Refunded</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-arrow-return-left"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totals.totalCautionRefunded.toFixed(2)}</h6>
                        <span className="text-warning small pt-2">Returned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Other Charges</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-receipt"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totals.totalOtherCharges.toFixed(2)}</h6>
                        <span className="text-info small pt-2">Collected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Records List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-list-ul me-2"></i>Charges Records
                  </h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Hostler Name"
                        title="Enter search keyword"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button type="button" title="Search">
                        <i className="bi bi-search"></i>
                      </button>
                    </form>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Hostler Name</th>
                        <th scope="col">Caution Paid</th>
                        <th scope="col">Payment Date</th>
                        <th scope="col">Caution Refunded</th>
                        <th scope="col">Refund Date</th>
                        <th scope="col">Other Charges</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCharges.length > 0 ? (
                        filteredCharges.map((charge, index) => (
                          <tr key={charge.hostler_Caution_Money_Other_Charges_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{charge.hostler_Name}</strong>
                              <div className="text-muted small">{charge.hostler_Code}</div>
                            </td>
                            <td>
                              {charge.is_Hostler_Caution_Money_Paid ? (
                                <span className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  ₹{parseFloat(charge.caution_Money_Paid_Amount || 0).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-muted">Not Paid</span>
                              )}
                            </td>
                            <td>
                              {charge.caution_Money_Paid_DateTime ? (
                                <small>{new Date(charge.caution_Money_Paid_DateTime).toLocaleString()}</small>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {charge.is_Hostler_Caution_Money_Refunded ? (
                                <span className="text-warning">
                                  <i className="bi bi-arrow-return-left me-1"></i>
                                  ₹{parseFloat(charge.caution_Money_Refunded_Amount || 0).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-muted">Not Refunded</span>
                              )}
                            </td>
                            <td>
                              {charge.hostler_Caution_Money_Refunded_DateTime ? (
                                <small>{new Date(charge.hostler_Caution_Money_Refunded_DateTime).toLocaleString()}</small>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <strong className="text-info">
                                ₹{parseFloat(charge.other_Charges_Paid_Amount || 0).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <span className={`badge ${charge.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {charge.status_Id === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(charge)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center">
                            <div className="py-4">
                              <i className="bi bi-inbox fs-1 text-muted"></i>
                              <p className="text-muted mt-2">No records found.</p>
                            </div>
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

export default OtherCharges;

