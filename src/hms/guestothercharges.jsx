import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatusDropdown from './statusdropdown';
import '../style/custom.css';

const GuestOtherCharges = () => {
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
    Hostler_Guest_Other_Charges_Id: 0,
    Hostler_Id: '',
    Is_Hostler_Guest_Other_Charges_Paid: false,
    Guest_Other_Charges_Paid_Amount: '',
    Payment_Mode_Enum_Id: '',
    Payment_Details_Id: '',
    Account_No: '',
    IFSC_Code: '',
    Mobile_No: '',
    Payment_Hold_By_Employee_Id: '',
    Payment_Hold_By_Role_Id: '',
    Payment_Hold_On_Date: '',
    Attachment: '',
    Status_Id: 1,
    Remarks: '',
  });

  const [charges, setCharges] = useState([]);
  const [hostlers, setHostlers] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch hostlers (guests)
  useEffect(() => {
    const fetchHostlers = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const hostlerUrl = 'https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/1';
        const hostlerRes = await axios.get(hostlerUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));

        setHostlers(Array.isArray(hostlerRes.data) ? hostlerRes.data : []);
      } catch (error) {
        console.error('Error fetching hostlers:', error);
        setHostlers([]);
      }
    };

    fetchHostlers();
  }, [getToken]);

  // Fetch payment modes enum
  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'Payment_Mode',
            status_Id: 1,
            is_Visible: true
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json'
            }
          }
        ).catch(() => ({ data: [] }));

        setPaymentModes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching payment modes:', error);
        setPaymentModes([]);
      }
    };

    fetchPaymentModes();
  }, [getToken]);

  // Fetch payment details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // TODO: Replace with actual API endpoint when available
        // const paymentDetailsUrl = 'https://localhost:7291/api/BasicMaster/_GET_PAYMENT_DETAILS/0/1';
        // const paymentDetailsRes = await axios.get(paymentDetailsUrl, {
        //   headers: { Authorization: token }
        // }).catch(() => ({ data: [] }));
        // setPaymentDetails(Array.isArray(paymentDetailsRes.data) ? paymentDetailsRes.data : []);

        // Temporary dummy data
        setPaymentDetails([
          { payment_Details_Id: 1, payment_Details_Name: 'Payment Detail 1' },
          { payment_Details_Id: 2, payment_Details_Name: 'Payment Detail 2' },
        ]);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setPaymentDetails([]);
      }
    };

    fetchPaymentDetails();
  }, [getToken]);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const employeeUrl = 'https://localhost:7291/api/BasicMaster/_GET_EMPLOYEE_MASTER/0/1';
        const employeeRes = await axios.get(employeeUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));

        setEmployees(Array.isArray(employeeRes.data) ? employeeRes.data : []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [getToken]);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const roleUrl = 'https://localhost:7291/api/BasicMaster/_GET_ROLE/0/1';
        const roleRes = await axios.get(roleUrl, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));

        setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      }
    };

    fetchRoles();
  }, [getToken]);

  // Fetch charges records
  const fetchCharges = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const chargesUrl = 'https://localhost:7291/api/BasicMaster/_GET_HOSTLER_GUEST_OTHER_CHARGES/0/1';
      // const chargesRes = await axios.get(chargesUrl, {
      //   headers: {
      //     Authorization: token,
      //     Accept: 'application/json',
      //   },
      // }).catch(() => ({ data: [] }));
      // setCharges(Array.isArray(chargesRes.data) ? chargesRes.data : []);

      // Temporary dummy data
      const dummyCharges = [
        {
          hostler_Guest_Other_Charges_Id: 1,
          hostler_Id: 1,
          hostler_Name: 'John Doe',
          hostler_Code: 'H001',
          is_Hostler_Guest_Other_Charges_Paid: true,
          guest_Other_Charges_Paid_Amount: 2000.00,
          payment_Mode_Enum_Id: 1,
          payment_Mode_Name: 'Cash',
          payment_Details_Id: 1,
          account_No: '1234567890',
          ifsc_Code: 'ABCD0123456',
          mobile_No: '9876543210',
          payment_Hold_By_Employee_Id: null,
          payment_Hold_By_Role_Id: null,
          payment_Hold_On_Date: null,
          attachment: '',
          status_Id: 1,
          remarks: 'Guest charges paid'
        }
      ];
      setCharges(dummyCharges);
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges, refresh]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({
        ...prev,
        Attachment: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) return;

      const payload = {
        Hostler_Guest_Other_Charges_Id: formData.Hostler_Guest_Other_Charges_Id,
        Hostler_Id: parseInt(formData.Hostler_Id),
        Is_Hostler_Guest_Other_Charges_Paid: formData.Is_Hostler_Guest_Other_Charges_Paid,
        Guest_Other_Charges_Paid_Amount: formData.Guest_Other_Charges_Paid_Amount
          ? parseFloat(formData.Guest_Other_Charges_Paid_Amount)
          : null,
        Payment_Mode_Enum_Id: parseInt(formData.Payment_Mode_Enum_Id) || 0,
        Payment_Details_Id: parseInt(formData.Payment_Details_Id) || 0,
        Account_No: formData.Account_No || null,
        IFSC_Code: formData.IFSC_Code || null,
        Mobile_No: formData.Mobile_No || null,
        Payment_Hold_By_Employee_Id: formData.Payment_Hold_By_Employee_Id
          ? parseInt(formData.Payment_Hold_By_Employee_Id)
          : null,
        Payment_Hold_By_Role_Id: formData.Payment_Hold_By_Role_Id
          ? parseInt(formData.Payment_Hold_By_Role_Id)
          : null,
        Payment_Hold_On_Date: formData.Payment_Hold_On_Date || null,
        Attachment: formData.Attachment || null,
        Status_Id: parseInt(formData.Status_Id),
        Remarks: formData.Remarks || null,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 1,
        CreatedBy_Login_Session_Id: 1,
        CreatedFrom_Screen: 'GuestOtherCharges',
        CreatedFrom_Menu_Code: 'GUEST_CHARGES',
      };

      // TODO: Replace with actual API endpoint when available
      // const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveHostlerGuestOtherCharges';
      // await axios.post(saveUrl, payload, {
      //   headers: {
      //     Authorization: token,
      //     'Content-Type': 'application/json',
      //   },
      // });

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
      Hostler_Guest_Other_Charges_Id: charge.hostler_Guest_Other_Charges_Id,
      Hostler_Id: charge.hostler_Id,
      Is_Hostler_Guest_Other_Charges_Paid: charge.is_Hostler_Guest_Other_Charges_Paid || false,
      Guest_Other_Charges_Paid_Amount: charge.guest_Other_Charges_Paid_Amount || '',
      Payment_Mode_Enum_Id: charge.payment_Mode_Enum_Id || '',
      Payment_Details_Id: charge.payment_Details_Id || '',
      Account_No: charge.account_No || '',
      IFSC_Code: charge.ifsc_Code || '',
      Mobile_No: charge.mobile_No || '',
      Payment_Hold_By_Employee_Id: charge.payment_Hold_By_Employee_Id || '',
      Payment_Hold_By_Role_Id: charge.payment_Hold_By_Role_Id || '',
      Payment_Hold_On_Date: charge.payment_Hold_On_Date
        ? new Date(charge.payment_Hold_On_Date).toISOString().slice(0, 16)
        : '',
      Attachment: charge.attachment || '',
      Status_Id: charge.status_Id || 1,
      Remarks: charge.remarks || '',
    });
    setIsEditing(true);
  };

  const handleReset = () => {
    setFormData({
      Hostler_Guest_Other_Charges_Id: 0,
      Hostler_Id: '',
      Is_Hostler_Guest_Other_Charges_Paid: false,
      Guest_Other_Charges_Paid_Amount: '',
      Payment_Mode_Enum_Id: '',
      Payment_Details_Id: '',
      Account_No: '',
      IFSC_Code: '',
      Mobile_No: '',
      Payment_Hold_By_Employee_Id: '',
      Payment_Hold_By_Role_Id: '',
      Payment_Hold_On_Date: '',
      Attachment: '',
      Status_Id: 1,
      Remarks: '',
    });
    setSelectedFile(null);
    setIsEditing(false);
  };

  const filteredCharges = charges.filter((charge) => {
    const hostlerName = charge.hostler_Name ?? '';
    const accountNo = charge.account_No ?? '';
    const mobileNo = charge.mobile_No ?? '';
    const search = searchTerm.toLowerCase();

    return (
      hostlerName.toLowerCase().includes(search) ||
      accountNo.toLowerCase().includes(search) ||
      mobileNo.toLowerCase().includes(search)
    );
  });

  const calculateTotals = () => {
    const totalPaid = filteredCharges.reduce(
      (sum, c) => sum + (parseFloat(c.guest_Other_Charges_Paid_Amount) || 0),
      0
    );
    const paidCount = filteredCharges.filter((c) => c.is_Hostler_Guest_Other_Charges_Paid).length;
    const pendingCount = filteredCharges.length - paidCount;
    return { totalPaid, paidCount, pendingCount };
  };

  const totals = calculateTotals();

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Guest Other Charges</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Financial</li>
            <li className="breadcrumb-item active">Guest Other Charges</li>
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
                  <i className="bi bi-person-badge me-2"></i>
                  {isEditing ? 'Edit Guest Charges Payment' : 'Add Guest Charges Payment'}
                </h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Hostler/Guest Selection */}
                    <div className="col-md-6">
                      <label htmlFor="Hostler_Id" className="form-label">
                        <i className="bi bi-person me-1"></i>Select Guest/Hostler <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Hostler_Id"
                        name="Hostler_Id"
                        value={formData.Hostler_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Guest/Hostler</option>
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
                        <i className="bi bi-check-circle me-1"></i>Status <span className="text-danger">*</span>
                      </label>
                      <StatusDropdown
                        name="Status_Id"
                        value={formData.Status_Id}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Payment Status Section */}
                    <div className="col-12">
                      <div className="alert alert-primary">
                        <h6 className="alert-heading">
                          <i className="bi bi-cash-coin me-2"></i>Payment Status
                        </h6>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="Is_Hostler_Guest_Other_Charges_Paid"
                          name="Is_Hostler_Guest_Other_Charges_Paid"
                          checked={formData.Is_Hostler_Guest_Other_Charges_Paid}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="Is_Hostler_Guest_Other_Charges_Paid">
                          <i className="bi bi-check-circle me-1"></i>Guest Other Charges Paid
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Guest_Other_Charges_Paid_Amount" className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>Paid Amount
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Guest_Other_Charges_Paid_Amount"
                        name="Guest_Other_Charges_Paid_Amount"
                        value={formData.Guest_Other_Charges_Paid_Amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="Enter paid amount"
                        disabled={!formData.Is_Hostler_Guest_Other_Charges_Paid}
                      />
                    </div>

                    {/* Payment Details Section */}
                    <div className="col-12">
                      <div className="alert alert-info">
                        <h6 className="alert-heading">
                          <i className="bi bi-credit-card me-2"></i>Payment Details
                        </h6>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Payment_Mode_Enum_Id" className="form-label">
                        <i className="bi bi-wallet2 me-1"></i>Payment Mode <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Mode_Enum_Id"
                        name="Payment_Mode_Enum_Id"
                        value={formData.Payment_Mode_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Payment Mode</option>
                        {paymentModes.map((mode) => (
                          <option key={mode.id || mode.enum_Id} value={mode.id || mode.enum_Id}>
                            {mode.name || mode.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Payment_Details_Id" className="form-label">
                        <i className="bi bi-receipt me-1"></i>Payment Details <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Details_Id"
                        name="Payment_Details_Id"
                        value={formData.Payment_Details_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Payment Details</option>
                        {paymentDetails.map((detail) => (
                          <option key={detail.payment_Details_Id} value={detail.payment_Details_Id}>
                            {detail.payment_Details_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Account_No" className="form-label">
                        <i className="bi bi-bank me-1"></i>Account Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Account_No"
                        name="Account_No"
                        value={formData.Account_No}
                        onChange={handleChange}
                        placeholder="Enter account number"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="IFSC_Code" className="form-label">
                        <i className="bi bi-code-square me-1"></i>IFSC Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="IFSC_Code"
                        name="IFSC_Code"
                        value={formData.IFSC_Code}
                        onChange={handleChange}
                        placeholder="Enter IFSC code"
                        maxLength="11"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Mobile_No" className="form-label">
                        <i className="bi bi-phone me-1"></i>Mobile Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Mobile_No"
                        name="Mobile_No"
                        value={formData.Mobile_No}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        maxLength="16"
                      />
                    </div>

                    {/* Payment Hold Section */}
                    <div className="col-12">
                      <div className="alert alert-warning">
                        <h6 className="alert-heading">
                          <i className="bi bi-pause-circle me-2"></i>Payment Hold Details (Optional)
                        </h6>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Hold_By_Employee_Id" className="form-label">
                        <i className="bi bi-person-badge me-1"></i>Hold By Employee
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Hold_By_Employee_Id"
                        name="Payment_Hold_By_Employee_Id"
                        value={formData.Payment_Hold_By_Employee_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.employee_Id} value={emp.employee_Id}>
                            {emp.employee_Name} ({emp.employee_Code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Hold_By_Role_Id" className="form-label">
                        <i className="bi bi-shield-check me-1"></i>Hold By Role
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Hold_By_Role_Id"
                        name="Payment_Hold_By_Role_Id"
                        value={formData.Payment_Hold_By_Role_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.role_Id} value={role.role_Id}>
                            {role.role_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Hold_On_Date" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>Hold On Date
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="Payment_Hold_On_Date"
                        name="Payment_Hold_On_Date"
                        value={formData.Payment_Hold_On_Date}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Attachment */}
                    <div className="col-md-6">
                      <label htmlFor="Attachment" className="form-label">
                        <i className="bi bi-paperclip me-1"></i>Attachment (Receipt/Payment Proof)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="Attachment"
                        name="Attachment"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {formData.Attachment && (
                        <small className="text-muted">Selected: {formData.Attachment}</small>
                      )}
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
                      />
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
                    <h5 className="card-title">Total Paid</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-check-circle"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totals.totalPaid.toFixed(2)}</h6>
                        <span className="text-success small pt-2">Total Amount</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Paid Records</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-check-circle-fill"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{totals.paidCount}</h6>
                        <span className="text-success small pt-2">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Pending Records</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-clock-history"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{totals.pendingCount}</h6>
                        <span className="text-warning small pt-2">Awaiting</span>
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
                    <i className="bi bi-list-ul me-2"></i>Guest Charges Payment Records
                  </h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Guest Name, Account No or Mobile No"
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

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Guest Name</th>
                          <th scope="col">Paid Status</th>
                          <th scope="col">Paid Amount</th>
                          <th scope="col">Payment Mode</th>
                          <th scope="col">Account No</th>
                          <th scope="col">IFSC Code</th>
                          <th scope="col">Mobile No</th>
                          <th scope="col">Hold By</th>
                          <th scope="col">Hold Date</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCharges.length > 0 ? (
                          filteredCharges.map((charge, index) => (
                            <tr key={charge.hostler_Guest_Other_Charges_Id}>
                              <td>{index + 1}</td>
                              <td>
                                <strong>{charge.hostler_Name}</strong>
                                <div className="text-muted small">{charge.hostler_Code}</div>
                              </td>
                              <td>
                                {charge.is_Hostler_Guest_Other_Charges_Paid ? (
                                  <span className="badge bg-success">
                                    <i className="bi bi-check-circle me-1"></i>Paid
                                  </span>
                                ) : (
                                  <span className="badge bg-warning">
                                    <i className="bi bi-clock me-1"></i>Pending
                                  </span>
                                )}
                              </td>
                              <td>
                                <strong className="text-primary">
                                  ₹{parseFloat(charge.guest_Other_Charges_Paid_Amount || 0).toFixed(2)}
                                </strong>
                              </td>
                              <td>{charge.payment_Mode_Name || 'N/A'}</td>
                              <td>{charge.account_No || 'N/A'}</td>
                              <td>{charge.ifsc_Code || 'N/A'}</td>
                              <td>{charge.mobile_No || 'N/A'}</td>
                              <td>
                                {charge.payment_Hold_By_Employee_Id || charge.payment_Hold_By_Role_Id
                                  ? `${charge.employee_Name || ''} ${charge.role_Name || ''}`.trim() || 'N/A'
                                  : 'N/A'}
                              </td>
                              <td>
                                {charge.payment_Hold_On_Date ? (
                                  <small>{new Date(charge.payment_Hold_On_Date).toLocaleString()}</small>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
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
                            <td colSpan="12" className="text-center">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GuestOtherCharges;
