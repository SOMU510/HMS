import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import '../style/custom.css';

const FeeDeposit = () => {
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
    Fee_Deposit_Id: 0,
    Hostler_Id: '',
    Room_Allotment_Vacate_Transfer_Id: '',
    Hostel_Fee_Room_Linking_Id: '',
    Total_Fee: 0,
    Fee_Discount: 0,
    Deposit_Fee: 0,
    Dues_Fee: 0,
    Late_Fee_Penalty: 0,
    Fee_Deposit_Date_Time: dayjs(),
    Fee_Deposit_From_Date_Time: dayjs().startOf('month'),
    Fee_Deposit_To_Date_Time: dayjs().endOf('month'),
    MonthYear: dayjs().format('MMMM YYYY'),
    Payment_Mode_Enum_Id: '',
    Payment_Details_Id: '',
    Account_No: '',
    IFSC_Code: '',
    Mobile_No: '',
    Payment_Hold_By_Employee_Id: '',
    Payment_Hold_By_Role_Id: '',
    Payment_Hold_On_Date: null,
    Attachment: null,
    IsFeePaid: false,
    Status_Id: 1,
    Remarks: '',
    Action_Remarks: '',
  });

  // Dropdown data
  const [hostlers, setHostlers] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [feeDeposits, setFeeDeposits] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [hostlerDetails, setHostlerDetails] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Fetch hostlers
        const hostlerRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch hostlers failed:', err);
          return { data: [] };
        });
        setHostlers(Array.isArray(hostlerRes.data) ? hostlerRes.data : []);

        // Fetch payment modes enum
        const paymentModeRes = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: "Payment_Mode",
            status_Id: 1,
            is_Visible: true
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json'
            }
          }
        ).catch(err => {
          console.error('Fetch payment modes failed:', err);
          return { data: [] };
        });
        setPaymentModes(Array.isArray(paymentModeRes.data) ? paymentModeRes.data : []);

        // Fetch employees
        const employeeRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_EMPLOYEE/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch employees failed:', err);
          return { data: [] };
        });
        setEmployees(Array.isArray(employeeRes.data) ? employeeRes.data : []);

        // Fetch roles
        const roleRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_ROLE/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch roles failed:', err);
          return { data: [] };
        });
        setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);

        setLoading(false);
      } catch (err) {
        console.error('Fetch initial data failed:', err);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [getToken]);

  // Fetch allotments when hostler changes
  useEffect(() => {
    const fetchAllotments = async () => {
      if (!formData.Hostler_Id) {
        setAllotments([]);
        setHostlerDetails(null);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        // Get hostler details
        const hostler = hostlers.find(h => h.hostler_Id === parseInt(formData.Hostler_Id));
        setHostlerDetails(hostler);

        // Fetch allotments for this hostler
        const res = await axios.get(
          `https://localhost:7291/api/BasicMaster/_GET_ROOM_ALLOTMENT_VACATE_TRANSFER/${formData.Hostler_Id}/1`,
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setAllotments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch allotments failed:', err);
      }
    };

    fetchAllotments();
  }, [formData.Hostler_Id, getToken, hostlers]);

  // Fetch fee structure when allotment changes
  useEffect(() => {
    const fetchFeeStructure = async () => {
      if (!formData.Room_Allotment_Vacate_Transfer_Id) {
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        const allotment = allotments.find(a => a.room_Allotment_Vacate_Transfer_Id === parseInt(formData.Room_Allotment_Vacate_Transfer_Id));
        
        if (allotment) {
          // Auto-fill fee linking ID if available
          if (allotment.hostel_Fee_Room_Linking_Id) {
            setFormData(prev => ({
              ...prev,
              Hostel_Fee_Room_Linking_Id: allotment.hostel_Fee_Room_Linking_Id,
            }));
          }

          // Fetch fee structure details
          const res = await axios.get(
            `https://localhost:7291/api/BasicMaster/_GET_FEE_MASTER/${allotment.hostel_Fee_Room_Linking_Id || 0}/1`,
            { headers: { Authorization: token } }
          ).catch(() => ({ data: [] }));

          const feeData = Array.isArray(res.data) ? res.data : [];

          // Auto-calculate total fee
          if (feeData.length > 0) {
            const totalFee = feeData[0].fee_Amount || 0;
            const discount = allotment.fee_Discount || 0;
            const netFee = totalFee - discount;

            setFormData(prev => ({
              ...prev,
              Total_Fee: totalFee,
              Fee_Discount: discount,
              Deposit_Fee: netFee,
              Dues_Fee: 0,
            }));
          }
        }
      } catch (err) {
        console.error('Fetch fee structure failed:', err);
      }
    };

    fetchFeeStructure();
  }, [formData.Room_Allotment_Vacate_Transfer_Id, allotments, getToken]);

  // Auto-calculate dues fee
  useEffect(() => {
    const totalFee = parseFloat(formData.Total_Fee) || 0;
    const discount = parseFloat(formData.Fee_Discount) || 0;
    const depositFee = parseFloat(formData.Deposit_Fee) || 0;
    const lateFee = parseFloat(formData.Late_Fee_Penalty) || 0;

    const netPayable = totalFee - discount + lateFee;
    const dues = netPayable - depositFee;

    setFormData(prev => ({
      ...prev,
      Dues_Fee: dues > 0 ? dues : 0,
      IsFeePaid: dues <= 0,
    }));
  }, [formData.Total_Fee, formData.Fee_Discount, formData.Deposit_Fee, formData.Late_Fee_Penalty]);

  // Fetch fee deposits for table
  useEffect(() => {
    const fetchFeeDeposits = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_FEE_DEPOSIT/0/0',
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setFeeDeposits(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch fee deposits failed:', err);
      }
    };

    fetchFeeDeposits();
  }, [getToken]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-update MonthYear when from date changes
    if (name === 'Fee_Deposit_From_Date_Time' && value) {
      setFormData(prev => ({
        ...prev,
        MonthYear: value.format('MMMM YYYY'),
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setFormData(prev => ({
        ...prev,
        Attachment: file.name,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      Fee_Deposit_Id: 0,
      Hostler_Id: '',
      Room_Allotment_Vacate_Transfer_Id: '',
      Hostel_Fee_Room_Linking_Id: '',
      Total_Fee: 0,
      Fee_Discount: 0,
      Deposit_Fee: 0,
      Dues_Fee: 0,
      Late_Fee_Penalty: 0,
      Fee_Deposit_Date_Time: dayjs(),
      Fee_Deposit_From_Date_Time: dayjs().startOf('month'),
      Fee_Deposit_To_Date_Time: dayjs().endOf('month'),
      MonthYear: dayjs().format('MMMM YYYY'),
      Payment_Mode_Enum_Id: '',
      Payment_Details_Id: '',
      Account_No: '',
      IFSC_Code: '',
      Mobile_No: '',
      Payment_Hold_By_Employee_Id: '',
      Payment_Hold_By_Role_Id: '',
      Payment_Hold_On_Date: null,
      Attachment: null,
      IsFeePaid: false,
      Status_Id: 1,
      Remarks: '',
      Action_Remarks: '',
    });
    setSelectedFile(null);
    setHostlerDetails(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.Hostler_Id || !formData.Room_Allotment_Vacate_Transfer_Id) {
      alert('Please select Hostler and Room Allotment');
      return;
    }

    if (!formData.Payment_Mode_Enum_Id) {
      alert('Please select Payment Mode');
      return;
    }

    if (parseFloat(formData.Deposit_Fee) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      if (!token) return;

      const payload = {
        Fee_Deposit_Id: formData.Fee_Deposit_Id,
        Hostler_Id: parseInt(formData.Hostler_Id),
        Room_Allotment_Vacate_Transfer_Id: parseInt(formData.Room_Allotment_Vacate_Transfer_Id),
        Hostel_Fee_Room_Linking_Id: formData.Hostel_Fee_Room_Linking_Id ? parseInt(formData.Hostel_Fee_Room_Linking_Id) : 0,
        Total_Fee: parseFloat(formData.Total_Fee) || 0,
        Fee_Discount: parseFloat(formData.Fee_Discount) || 0,
        Deposit_Fee: parseFloat(formData.Deposit_Fee) || 0,
        Dues_Fee: parseFloat(formData.Dues_Fee) || 0,
        Late_Fee_Penalty: parseFloat(formData.Late_Fee_Penalty) || 0,
        Fee_Deposit_Date_Time: formData.Fee_Deposit_Date_Time ? formData.Fee_Deposit_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        Fee_Deposit_From_Date_Time: formData.Fee_Deposit_From_Date_Time ? formData.Fee_Deposit_From_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        Fee_Deposit_To_Date_Time: formData.Fee_Deposit_To_Date_Time ? formData.Fee_Deposit_To_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        MonthYear: formData.MonthYear,
        Payment_Mode_Enum_Id: parseInt(formData.Payment_Mode_Enum_Id),
        Payment_Details_Id: formData.Payment_Details_Id ? parseInt(formData.Payment_Details_Id) : 0,
        Account_No: formData.Account_No,
        IFSC_Code: formData.IFSC_Code,
        Mobile_No: formData.Mobile_No,
        Payment_Hold_By_Employee_Id: formData.Payment_Hold_By_Employee_Id ? parseInt(formData.Payment_Hold_By_Employee_Id) : null,
        Payment_Hold_By_Role_Id: formData.Payment_Hold_By_Role_Id ? parseInt(formData.Payment_Hold_By_Role_Id) : null,
        Payment_Hold_On_Date: formData.Payment_Hold_On_Date ? formData.Payment_Hold_On_Date.format('YYYY-MM-DDTHH:mm:ss') : null,
        Attachment: formData.Attachment,
        IsFeePaid: formData.IsFeePaid,
        Status_Id: parseInt(formData.Status_Id),
        Remarks: formData.Remarks,
        Action_Remarks: formData.Action_Remarks,
        CreatedBy_Login_User_Id: 1,
        CreatedBy_Login_Session_Id: 1,
        CreatedFrom_Screen: 'FeeDeposit',
        CreatedFrom_Menu_Code: 'FEE_DEPOSIT',
      };

      console.log('Saving fee deposit:', payload);

      // TODO: Replace with actual save API endpoint
      const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveFeeDeposit';

      await axios.post(saveUrl, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      // TODO: Upload file if selected
      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', selectedFile);
        // await uploadFile(formDataFile);
      }

      alert('Fee deposit saved successfully!');
      resetForm();
      
      // Refresh fee deposits table
      const res = await axios.get(
        'https://localhost:7291/api/BasicMaster/_GET_FEE_DEPOSIT/0/0',
        { headers: { Authorization: token } }
      ).catch(() => ({ data: [] }));
      setFeeDeposits(Array.isArray(res.data) ? res.data : []);

      setSaving(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving fee deposit. Please try again.');
      setSaving(false);
    }
  };

  const handleEdit = (deposit) => {
    setFormData({
      Fee_Deposit_Id: deposit.fee_Deposit_Id || 0,
      Hostler_Id: deposit.hostler_Id || '',
      Room_Allotment_Vacate_Transfer_Id: deposit.room_Allotment_Vacate_Transfer_Id || '',
      Hostel_Fee_Room_Linking_Id: deposit.hostel_Fee_Room_Linking_Id || '',
      Total_Fee: deposit.total_Fee || 0,
      Fee_Discount: deposit.fee_Discount || 0,
      Deposit_Fee: deposit.deposit_Fee || 0,
      Dues_Fee: deposit.dues_Fee || 0,
      Late_Fee_Penalty: deposit.late_Fee_Penalty || 0,
      Fee_Deposit_Date_Time: deposit.fee_Deposit_Date_Time ? dayjs(deposit.fee_Deposit_Date_Time) : dayjs(),
      Fee_Deposit_From_Date_Time: deposit.fee_Deposit_From_Date_Time ? dayjs(deposit.fee_Deposit_From_Date_Time) : null,
      Fee_Deposit_To_Date_Time: deposit.fee_Deposit_To_Date_Time ? dayjs(deposit.fee_Deposit_To_Date_Time) : null,
      MonthYear: deposit.monthYear || '',
      Payment_Mode_Enum_Id: deposit.payment_Mode_Enum_Id || '',
      Payment_Details_Id: deposit.payment_Details_Id || '',
      Account_No: deposit.account_No || '',
      IFSC_Code: deposit.ifsc_Code || '',
      Mobile_No: deposit.mobile_No || '',
      Payment_Hold_By_Employee_Id: deposit.payment_Hold_By_Employee_Id || '',
      Payment_Hold_By_Role_Id: deposit.payment_Hold_By_Role_Id || '',
      Payment_Hold_On_Date: deposit.payment_Hold_On_Date ? dayjs(deposit.payment_Hold_On_Date) : null,
      Attachment: deposit.attachment || null,
      IsFeePaid: deposit.isFeePaid || false,
      Status_Id: deposit.status_Id || 1,
      Remarks: deposit.remarks || '',
      Action_Remarks: deposit.action_Remarks || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter fee deposits
  const filteredFeeDeposits = feeDeposits.filter(deposit => {
    const matchesSearch =
      deposit.hostler_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.monthYear?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || deposit.status_Id === parseInt(filterStatus);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalDeposited = filteredFeeDeposits.reduce((sum, d) => sum + (d.deposit_Fee || 0), 0);
  const totalDues = filteredFeeDeposits.reduce((sum, d) => sum + (d.dues_Fee || 0), 0);
  const paidCount = filteredFeeDeposits.filter(d => d.isFeePaid).length;

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
        <h1>Fee Deposit Management</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Finance</li>
            <li className="breadcrumb-item active">Fee Deposit</li>
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
                  <i className="bi bi-currency-rupee me-2"></i>
                  {formData.Fee_Deposit_Id > 0 ? 'Edit' : 'Add'} Fee Deposit
                </h5>

                {/* Hostler Info Card */}
                {hostlerDetails && (
                  <div className="alert alert-info d-flex align-items-start">
                    <i className="bi bi-person-circle fs-4 me-3"></i>
                    <div>
                      <h6 className="mb-1">{hostlerDetails.hostler_Name}</h6>
                      <small className="text-muted">
                        <strong>Code:</strong> {hostlerDetails.hostler_Code} | 
                        <strong> Mobile:</strong> {hostlerDetails.hostler_Mobile_No} | 
                        <strong> Email:</strong> {hostlerDetails.hostler_Email_Id}
                      </small>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Hostler Information */}
                    <div className="col-12">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-person-badge me-2"></i>
                        Hostler & Allotment Details
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostler_Id" className="form-label fw-semibold">
                        Hostler *
                      </label>
                      <select
                        id="Hostler_Id"
                        name="Hostler_Id"
                        className="form-select"
                        value={formData.Hostler_Id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Hostler</option>
                        {hostlers.map(hostler => (
                          <option key={hostler.hostler_Id} value={hostler.hostler_Id}>
                            {hostler.hostler_Name} ({hostler.hostler_Code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Room_Allotment_Vacate_Transfer_Id" className="form-label fw-semibold">
                        Room Allotment *
                      </label>
                      <select
                        id="Room_Allotment_Vacate_Transfer_Id"
                        name="Room_Allotment_Vacate_Transfer_Id"
                        className="form-select"
                        value={formData.Room_Allotment_Vacate_Transfer_Id}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.Hostler_Id}
                      >
                        <option value="">Select Room Allotment</option>
                        {allotments.map(allotment => (
                          <option key={allotment.room_Allotment_Vacate_Transfer_Id} value={allotment.room_Allotment_Vacate_Transfer_Id}>
                            {allotment.room_Name} - {allotment.hostel_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="MonthYear" className="form-label fw-semibold">
                        Fee Month/Year *
                      </label>
                      <input
                        type="text"
                        id="MonthYear"
                        name="MonthYear"
                        className="form-control"
                        value={formData.MonthYear}
                        onChange={handleInputChange}
                        placeholder="e.g., November 2025"
                        required
                      />
                    </div>

                    {/* Fee Details */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-cash-stack me-2"></i>
                        Fee Details
                      </h6>
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Total_Fee" className="form-label fw-semibold">
                        Total Fee (₹)
                      </label>
                      <input
                        type="number"
                        id="Total_Fee"
                        name="Total_Fee"
                        className="form-control"
                        value={formData.Total_Fee}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Fee_Discount" className="form-label fw-semibold">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        id="Fee_Discount"
                        name="Fee_Discount"
                        className="form-control"
                        value={formData.Fee_Discount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Late_Fee_Penalty" className="form-label fw-semibold">
                        Late Fee Penalty (₹)
                      </label>
                      <input
                        type="number"
                        id="Late_Fee_Penalty"
                        name="Late_Fee_Penalty"
                        className="form-control"
                        value={formData.Late_Fee_Penalty}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        Net Payable (₹)
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={(parseFloat(formData.Total_Fee) - parseFloat(formData.Fee_Discount) + parseFloat(formData.Late_Fee_Penalty)).toFixed(2)}
                        readOnly
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Deposit_Fee" className="form-label fw-semibold">
                        Deposit Amount (₹) *
                      </label>
                      <input
                        type="number"
                        id="Deposit_Fee"
                        name="Deposit_Fee"
                        className="form-control"
                        value={formData.Deposit_Fee}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Dues_Fee" className="form-label fw-semibold">
                        Dues Remaining (₹)
                      </label>
                      <input
                        type="number"
                        id="Dues_Fee"
                        name="Dues_Fee"
                        className="form-control bg-light"
                        value={formData.Dues_Fee}
                        readOnly
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Payment Status
                      </label>
                      <div className="form-control bg-light d-flex align-items-center">
                        {formData.IsFeePaid ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Fully Paid
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            Partial/Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-calendar-event me-2"></i>
                        Date Information
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Deposit Date Time *
                      </label>
                      <DateTimePicker
                        value={formData.Fee_Deposit_Date_Time}
                        onChange={(newValue) => handleDateChange('Fee_Deposit_Date_Time', newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Fee Period From
                      </label>
                      <DateTimePicker
                        value={formData.Fee_Deposit_From_Date_Time}
                        onChange={(newValue) => handleDateChange('Fee_Deposit_From_Date_Time', newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Fee Period To
                      </label>
                      <DateTimePicker
                        value={formData.Fee_Deposit_To_Date_Time}
                        onChange={(newValue) => handleDateChange('Fee_Deposit_To_Date_Time', newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                      />
                    </div>

                    {/* Payment Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-credit-card me-2"></i>
                        Payment Information
                      </h6>
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Payment_Mode_Enum_Id" className="form-label fw-semibold">
                        Payment Mode *
                      </label>
                      <select
                        id="Payment_Mode_Enum_Id"
                        name="Payment_Mode_Enum_Id"
                        className="form-select"
                        value={formData.Payment_Mode_Enum_Id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Payment Mode</option>
                        {paymentModes.map(mode => (
                          <option key={mode.id} value={mode.id}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Account_No" className="form-label fw-semibold">
                        Account Number
                      </label>
                      <input
                        type="text"
                        id="Account_No"
                        name="Account_No"
                        className="form-control"
                        value={formData.Account_No}
                        onChange={handleInputChange}
                        placeholder="Enter account number"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="IFSC_Code" className="form-label fw-semibold">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        id="IFSC_Code"
                        name="IFSC_Code"
                        className="form-control"
                        value={formData.IFSC_Code}
                        onChange={handleInputChange}
                        placeholder="e.g., SBIN0001234"
                        maxLength="20"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Mobile_No" className="form-label fw-semibold">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        id="Mobile_No"
                        name="Mobile_No"
                        className="form-control"
                        value={formData.Mobile_No}
                        onChange={handleInputChange}
                        placeholder="Enter mobile number"
                        maxLength="16"
                      />
                    </div>

                    {/* Payment Hold Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-pause-circle me-2"></i>
                        Payment Hold Information (Optional)
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Hold_By_Employee_Id" className="form-label fw-semibold">
                        Hold By Employee
                      </label>
                      <select
                        id="Payment_Hold_By_Employee_Id"
                        name="Payment_Hold_By_Employee_Id"
                        className="form-select"
                        value={formData.Payment_Hold_By_Employee_Id}
                        onChange={handleInputChange}
                      >
                        <option value="">Not On Hold</option>
                        {employees.map(emp => (
                          <option key={emp.employee_Id} value={emp.employee_Id}>
                            {emp.employee_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Hold_By_Role_Id" className="form-label fw-semibold">
                        Hold By Role
                      </label>
                      <select
                        id="Payment_Hold_By_Role_Id"
                        name="Payment_Hold_By_Role_Id"
                        className="form-select"
                        value={formData.Payment_Hold_By_Role_Id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.role_Id} value={role.role_Id}>
                            {role.role_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Payment Hold Date
                      </label>
                      <DateTimePicker
                        value={formData.Payment_Hold_On_Date}
                        onChange={(newValue) => handleDateChange('Payment_Hold_On_Date', newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                      />
                    </div>

                    {/* Attachment & Status */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-paperclip me-2"></i>
                        Attachment & Status
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Attachment" className="form-label fw-semibold">
                        Upload Receipt/Attachment
                      </label>
                      <input
                        type="file"
                        id="Attachment"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                      {formData.Attachment && (
                        <small className="text-muted">
                          <i className="bi bi-file-earmark-check me-1"></i>
                          {formData.Attachment}
                        </small>
                      )}
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

                    {/* Remarks */}
                    <div className="col-md-6">
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

                    <div className="col-md-6">
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
                            {formData.Fee_Deposit_Id > 0 ? 'Update' : 'Save'} Deposit
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

          {/* Statistics Cards */}
          <div className="col-lg-12">
            <div className="row">
              <div className="col-md-4">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Deposited</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-cash-coin"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totalDeposited.toFixed(2)}</h6>
                        <span className="text-success small pt-1 fw-bold">{filteredFeeDeposits.length}</span>
                        <span className="text-muted small pt-2 ps-1">deposits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Dues</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-exclamation-triangle"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totalDues.toFixed(2)}</h6>
                        <span className="text-danger small pt-1 fw-bold">{filteredFeeDeposits.length - paidCount}</span>
                        <span className="text-muted small pt-2 ps-1">pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Fully Paid</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-check-circle"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{paidCount}</h6>
                        <span className="text-muted small pt-2">
                          {filteredFeeDeposits.length > 0 ? ((paidCount / filteredFeeDeposits.length) * 100).toFixed(0) : 0}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-table me-2"></i>
                  Fee Deposit Records
                </h5>

                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by hostler name or month/year..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('');
                      }}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Sr No</th>
                        <th>Hostler</th>
                        <th>Month/Year</th>
                        <th>Total Fee</th>
                        <th>Deposited</th>
                        <th>Dues</th>
                        <th>Deposit Date</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeeDeposits.length > 0 ? (
                        filteredFeeDeposits.map((deposit, index) => (
                          <tr key={deposit.fee_Deposit_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{deposit.hostler_Name}</strong>
                              <br />
                              <small className="text-muted">{deposit.hostler_Code}</small>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {deposit.monthYear}
                              </span>
                            </td>
                            <td>₹{(deposit.total_Fee || 0).toFixed(2)}</td>
                            <td>
                              <strong className="text-success">₹{(deposit.deposit_Fee || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <strong className="text-danger">₹{(deposit.dues_Fee || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              {deposit.fee_Deposit_Date_Time ? (
                                dayjs(deposit.fee_Deposit_Date_Time).format('DD/MM/YYYY')
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              {deposit.isFeePaid ? (
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Paid
                                </span>
                              ) : (
                                <span className="badge bg-warning text-dark">
                                  <i className="bi bi-hourglass-split me-1"></i>
                                  Pending
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleEdit(deposit)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {deposit.attachment && (
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  title="View Attachment"
                                >
                                  <i className="bi bi-paperclip"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {searchTerm || filterStatus
                                ? 'No records match your filters'
                                : 'No fee deposits found. Add one to get started!'}
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

export default FeeDeposit;

