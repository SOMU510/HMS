import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/custom.css';

const DailyExpensePayment = () => {
  const navigate = useNavigate();

  // Memoized getToken function
  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [paymentData, setPaymentData] = useState({
    Daily_Expense_Payment_Id: 0,
    Daily_Expense_Id: 0,
    Hostel_Id: 0,
    Payment_Date: new Date().toISOString().slice(0, 10),
    Payment_Amount: '',
    Payment_Mode_Enum_Id: 0,
    Payment_Details_Id: 0,
    Transaction_Id: '',
    Receipt_Number: '',
    Account_No: '',
    IFSC_Code: '',
    Mobile_No: '',
    Payment_Status_Enum_Id: 0,
    Attachment: '',
    Status_Id: 1,
    Remarks: '',
  });

  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Fetch hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const url = 'https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/0/1';
        const res = await axios.get(url, {
          headers: {
            Authorization: token,
            Accept: 'application/json',
          },
        }).catch(() => ({ data: [] }));

        setHostels(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error fetching hostels:', error);
        setHostels([]);
      }
    };

    fetchHostels();
  }, [getToken]);

  // Fetch expenses when hostel is selected
  useEffect(() => {
    const fetchExpenses = async () => {
      if (paymentData.Hostel_Id) {
        try {
          const token = getToken();
          if (!token) return;

          // TODO: Replace with actual API endpoint when available
          // const url = `https://localhost:7291/api/BasicMaster/_GET_DAILY_EXPENSE_MASTER/0/${paymentData.Hostel_Id}/1`;
          // const res = await axios.get(url, {
          //   headers: { Authorization: token }
          // });
          // setExpenses(Array.isArray(res.data) ? res.data : []);

          // Temporary dummy data
          const dummyExpenses = [
            {
              daily_Expense_Id: 1,
              expense_Date: '2024-01-15',
              expense_Description: 'Monthly grocery purchase',
              expense_Amount: 5000.00,
              expense_Category_Name: 'Food',
              vendor_Name: 'ABC Store',
              bill_Number: 'BL001',
            }
          ];
          setExpenses(dummyExpenses);
        } catch (error) {
          console.error('Error fetching expenses:', error);
          setExpenses([]);
        }
      } else {
        setExpenses([]);
        setSelectedExpense(null);
      }
    };

    fetchExpenses();
  }, [paymentData.Hostel_Id, getToken]);

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

  // Fetch payment statuses enum
  useEffect(() => {
    const fetchPaymentStatuses = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'Payment_Status',
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

        setPaymentStatuses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching payment statuses:', error);
        setPaymentStatuses([]);
      }
    };

    fetchPaymentStatuses();
  }, [getToken]);

  // Memoized fetchPayments function
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const url = `https://localhost:7291/api/BasicMaster/_GET_DAILY_EXPENSE_PAYMENT/${Daily_Expense_Payment_Id}/${Daily_Expense_Id}/${Status_Id}`;
      // const res = await axios.get(url, {
      //   headers: {
      //     Authorization: token,
      //     Accept: 'application/json',
      //   },
      // });
      // setPayments(Array.isArray(res.data) ? res.data : []);

      // Temporary dummy data
      const dummyPayments = [
        {
          daily_Expense_Payment_Id: 1,
          daily_Expense_Id: 1,
          expense_Description: 'Monthly grocery purchase',
          hostel_Name: 'Boys Hostel A',
          payment_Date: '2024-01-16',
          payment_Amount: 5000.00,
          payment_Mode_Name: 'Online',
          transaction_Id: 'TXN123456',
          receipt_Number: 'RCP001',
          payment_Status_Name: 'Paid',
          status_Id: 1,
        }
      ];
      setPayments(dummyPayments);
    } catch (error) {
      console.error('Fetch failed:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When expense is selected, auto-fill amount
    if (name === 'Daily_Expense_Id') {
      const expense = expenses.find(exp => exp.daily_Expense_Id === parseInt(value));
      if (expense) {
        setSelectedExpense(expense);
        setPaymentData((prev) => ({
          ...prev,
          Payment_Amount: expense.expense_Amount || '',
        }));
      } else {
        setSelectedExpense(null);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentData((prev) => ({
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
        Daily_Expense_Payment_Id: paymentData.Daily_Expense_Payment_Id,
        Daily_Expense_Id: paymentData.Daily_Expense_Id,
        Hostel_Id: paymentData.Hostel_Id,
        Payment_Date: paymentData.Payment_Date,
        Payment_Amount: parseFloat(paymentData.Payment_Amount) || 0,
        Payment_Mode_Enum_Id: paymentData.Payment_Mode_Enum_Id,
        Payment_Details_Id: paymentData.Payment_Details_Id || 0,
        Transaction_Id: paymentData.Transaction_Id,
        Receipt_Number: paymentData.Receipt_Number,
        Account_No: paymentData.Account_No,
        IFSC_Code: paymentData.IFSC_Code,
        Mobile_No: paymentData.Mobile_No,
        Payment_Status_Enum_Id: paymentData.Payment_Status_Enum_Id,
        Attachment: paymentData.Attachment,
        Status_Id: paymentData.Status_Id,
        Remarks: paymentData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'DailyExpensePayment',
        CreatedFrom_Menu_Code: 'EXPENSE_PAYMENT',
      };

      // TODO: Replace with actual API endpoint when available
      // const response = await fetch('https://localhost:7291/api/BasicMaster/SaveDailyExpensePayment', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: token,
      //   },
      //   body: JSON.stringify(payload),
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result?.Message || 'Failed to save');
      // }

      alert('Payment saved successfully!');
      setPaymentData({
        Daily_Expense_Payment_Id: 0,
        Daily_Expense_Id: 0,
        Hostel_Id: 0,
        Payment_Date: new Date().toISOString().slice(0, 10),
        Payment_Amount: '',
        Payment_Mode_Enum_Id: 0,
        Payment_Details_Id: 0,
        Transaction_Id: '',
        Receipt_Number: '',
        Account_No: '',
        IFSC_Code: '',
        Mobile_No: '',
        Payment_Status_Enum_Id: 0,
        Attachment: '',
        Status_Id: 1,
        Remarks: '',
      });
      setSelectedExpense(null);
      setIsEditing(false);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
      if (err.message.toLowerCase().includes('401')) {
        navigate('/login', { replace: true });
      }
    }
  };

  const handleEdit = (payment) => {
    setPaymentData({
      Daily_Expense_Payment_Id: payment.daily_Expense_Payment_Id,
      Daily_Expense_Id: payment.daily_Expense_Id || 0,
      Hostel_Id: payment.hostel_Id || 0,
      Payment_Date: payment.payment_Date || new Date().toISOString().slice(0, 10),
      Payment_Amount: payment.payment_Amount || '',
      Payment_Mode_Enum_Id: payment.payment_Mode_Enum_Id || 0,
      Payment_Details_Id: payment.payment_Details_Id || 0,
      Transaction_Id: payment.transaction_Id || '',
      Receipt_Number: payment.receipt_Number || '',
      Account_No: payment.account_No || '',
      IFSC_Code: payment.ifsc_Code || '',
      Mobile_No: payment.mobile_No || '',
      Payment_Status_Enum_Id: payment.payment_Status_Enum_Id || 0,
      Attachment: payment.attachment || '',
      Status_Id: payment.status_Id || 1,
      Remarks: payment.remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setPaymentData({
      Daily_Expense_Payment_Id: 0,
      Daily_Expense_Id: 0,
      Hostel_Id: 0,
      Payment_Date: new Date().toISOString().slice(0, 10),
      Payment_Amount: '',
      Payment_Mode_Enum_Id: 0,
      Payment_Details_Id: 0,
      Transaction_Id: '',
      Receipt_Number: '',
      Account_No: '',
      IFSC_Code: '',
      Mobile_No: '',
      Payment_Status_Enum_Id: 0,
      Attachment: '',
      Status_Id: 1,
      Remarks: '',
    });
    setSelectedExpense(null);
    setIsEditing(false);
  };

  const filteredPayments = payments.filter((payment) => {
    const description = payment.expense_Description ?? '';
    const transactionId = payment.transaction_Id ?? '';
    const receiptNumber = payment.receipt_Number ?? '';
    const hostelName = payment.hostel_Name ?? '';
    const search = searchTerm.toLowerCase();

    return (
      description.toLowerCase().includes(search) ||
      transactionId.toLowerCase().includes(search) ||
      receiptNumber.toLowerCase().includes(search) ||
      hostelName.toLowerCase().includes(search)
    );
  });

  // Calculate statistics
  const totalPayments = filteredPayments.reduce((sum, payment) => {
    return sum + (parseFloat(payment.payment_Amount) || 0);
  }, 0);

  const paidPayments = filteredPayments.filter(p => p.payment_Status_Name === 'Paid' || p.payment_Status_Enum_Id === 1);
  const pendingPayments = filteredPayments.filter(p => p.payment_Status_Name === 'Pending' || p.payment_Status_Enum_Id === 2);

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Daily Expense Payment</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Expenses</li>
            <li className="breadcrumb-item active">Daily Expense Payment</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Payments</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary">
                        <i className="bi bi-currency-rupee"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h6>
                        <span className="text-muted small pt-1">Total Amount</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Paid Payments</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success">
                        <i className="bi bi-check-circle"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{paidPayments.length}</h6>
                        <span className="text-muted small pt-1">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Pending Payments</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-warning">
                        <i className="bi bi-clock-history"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{pendingPayments.length}</h6>
                        <span className="text-muted small pt-1">Awaiting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Records</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-info">
                        <i className="bi bi-list-ul"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{filteredPayments.length}</h6>
                        <span className="text-muted small pt-1">Payment Records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Expense Payment' : 'Make Expense Payment'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="Hostel_Id" className="form-label">
                        Hostel <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Hostel_Id"
                        name="Hostel_Id"
                        value={paymentData.Hostel_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Hostel</option>
                        {hostels.map((hostel) => (
                          <option key={hostel.hostel_Id} value={hostel.hostel_Id}>
                            {hostel.hostel_Name} ({hostel.hostel_Code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Daily_Expense_Id" className="form-label">
                        Select Expense <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Daily_Expense_Id"
                        name="Daily_Expense_Id"
                        value={paymentData.Daily_Expense_Id}
                        onChange={handleChange}
                        required
                        disabled={!paymentData.Hostel_Id}
                      >
                        <option value="0">Select Expense</option>
                        {expenses.map((expense) => (
                          <option key={expense.daily_Expense_Id} value={expense.daily_Expense_Id}>
                            {expense.expense_Description} - ₹{parseFloat(expense.expense_Amount || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} ({expense.bill_Number || 'N/A'})
                          </option>
                        ))}
                      </select>
                      {selectedExpense && (
                        <small className="text-muted">
                          Expense Amount: ₹{parseFloat(selectedExpense.expense_Amount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </small>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Date" className="form-label">
                        Payment Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="Payment_Date"
                        name="Payment_Date"
                        value={paymentData.Payment_Date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Amount" className="form-label">
                        Payment Amount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Payment_Amount"
                        name="Payment_Amount"
                        value={paymentData.Payment_Amount}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="Enter amount"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Mode_Enum_Id" className="form-label">
                        Payment Mode <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Mode_Enum_Id"
                        name="Payment_Mode_Enum_Id"
                        value={paymentData.Payment_Mode_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Payment Mode</option>
                        {paymentModes.map((mode) => (
                          <option key={mode.id || mode.enum_Id} value={mode.id || mode.enum_Id}>
                            {mode.name || mode.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Payment_Status_Enum_Id" className="form-label">
                        Payment Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Status_Enum_Id"
                        name="Payment_Status_Enum_Id"
                        value={paymentData.Payment_Status_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Payment Status</option>
                        {paymentStatuses.map((status) => (
                          <option key={status.id || status.enum_Id} value={status.id || status.enum_Id}>
                            {status.name || status.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Transaction_Id" className="form-label">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Transaction_Id"
                        name="Transaction_Id"
                        value={paymentData.Transaction_Id}
                        onChange={handleChange}
                        placeholder="Enter transaction ID"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Receipt_Number" className="form-label">
                        Receipt Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Receipt_Number"
                        name="Receipt_Number"
                        value={paymentData.Receipt_Number}
                        onChange={handleChange}
                        placeholder="Enter receipt number"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Account_No" className="form-label">
                        Account Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Account_No"
                        name="Account_No"
                        value={paymentData.Account_No}
                        onChange={handleChange}
                        placeholder="Enter account number"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="IFSC_Code" className="form-label">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="IFSC_Code"
                        name="IFSC_Code"
                        value={paymentData.IFSC_Code}
                        onChange={handleChange}
                        placeholder="Enter IFSC code"
                        maxLength="11"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Mobile_No" className="form-label">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Mobile_No"
                        name="Mobile_No"
                        value={paymentData.Mobile_No}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        maxLength="10"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Attachment" className="form-label">
                        Attachment (Receipt/Payment Proof)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="Attachment"
                        name="Attachment"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {paymentData.Attachment && (
                        <small className="text-muted">Selected: {paymentData.Attachment}</small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Status_Id" className="form-label">
                        Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Status_Id"
                        name="Status_Id"
                        value={paymentData.Status_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label htmlFor="Remarks" className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        rows="2"
                        value={paymentData.Remarks}
                        onChange={handleChange}
                        placeholder="Enter remarks (optional)"
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle me-1"></i>
                        {isEditing ? 'Update Payment' : 'Save Payment'}
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          className="btn btn-secondary ms-2"
                          onClick={handleCancelEdit}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Payment List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Payment List</h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Description, Transaction ID, Receipt No or Hostel"
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
                          <th scope="col">Sr. No</th>
                          <th scope="col">Payment Date</th>
                          <th scope="col">Hostel</th>
                          <th scope="col">Expense Description</th>
                          <th scope="col">Amount</th>
                          <th scope="col">Payment Mode</th>
                          <th scope="col">Transaction ID</th>
                          <th scope="col">Receipt No</th>
                          <th scope="col">Payment Status</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length > 0 ? (
                          filteredPayments.map((payment, index) => (
                            <tr key={payment.daily_Expense_Payment_Id}>
                              <td>{index + 1}</td>
                              <td>
                                {payment.payment_Date
                                  ? new Date(payment.payment_Date).toLocaleDateString('en-IN')
                                  : 'N/A'}
                              </td>
                              <td>{payment.hostel_Name || 'N/A'}</td>
                              <td>
                                <span
                                  title={payment.expense_Description}
                                  style={{
                                    display: 'inline-block',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {payment.expense_Description || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <strong>
                                  ₹{parseFloat(payment.payment_Amount || 0).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </strong>
                              </td>
                              <td>{payment.payment_Mode_Name || 'N/A'}</td>
                              <td>{payment.transaction_Id || 'N/A'}</td>
                              <td>{payment.receipt_Number || 'N/A'}</td>
                              <td>
                                <span className={`badge ${
                                  payment.payment_Status_Name === 'Paid' || payment.payment_Status_Enum_Id === 1
                                    ? 'bg-success'
                                    : payment.payment_Status_Name === 'Pending' || payment.payment_Status_Enum_Id === 2
                                    ? 'bg-warning'
                                    : 'bg-danger'
                                }`}>
                                  {payment.payment_Status_Name || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${payment.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                  {payment.status_Id === 1 ? 'Active' : payment.status_Id === 2 ? 'Inactive' : 'Unknown'}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleEdit(payment)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="11" className="text-center">
                              No Record found.
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

export default DailyExpensePayment;

