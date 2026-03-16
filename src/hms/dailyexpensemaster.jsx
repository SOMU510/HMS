import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DailyExpenseMaster = () => {
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

  const [expenseData, setExpenseData] = useState({
    Daily_Expense_Id: 0,
    Hostel_Id: 0,
    Expense_Date: new Date().toISOString().slice(0, 10),
    Expense_Type_Enum_Id: 0,
    Expense_Category_Enum_Id: 0,
    Expense_Amount: '',
    Expense_Description: '',
    Payment_Mode_Enum_Id: 0,
    Payment_Details_Id: 0,
    Vendor_Name: '',
    Bill_Number: '',
    Bill_Date: '',
    Attachment: '',
    Status_Id: 1,
    Remarks: '',
  });

  const [expenses, setExpenses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Fetch expense types enum
  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'Expense_Type',
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

        setExpenseTypes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching expense types:', error);
        setExpenseTypes([]);
      }
    };

    fetchExpenseTypes();
  }, [getToken]);

  // Fetch expense categories enum
  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'Expense_Category',
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

        setExpenseCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        setExpenseCategories([]);
      }
    };

    fetchExpenseCategories();
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

  // Memoized fetchExpenses function
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const url = `https://localhost:7291/api/BasicMaster/_GET_DAILY_EXPENSE_MASTER/${Daily_Expense_Id}/${Hostel_Id}/${Status_Id}`;
      // const res = await axios.get(url, {
      //   headers: {
      //     Authorization: token,
      //     Accept: 'application/json',
      //   },
      // });
      // setExpenses(Array.isArray(res.data) ? res.data : []);

      // Temporary dummy data
      const dummyExpenses = [
        {
          daily_Expense_Id: 1,
          hostel_Id: 1,
          hostel_Name: 'Boys Hostel A',
          expense_Date: '2024-01-15',
          expense_Type_Enum_Id: 1,
          expense_Type_Name: 'Regular',
          expense_Category_Enum_Id: 1,
          expense_Category_Name: 'Food',
          expense_Amount: 5000.00,
          expense_Description: 'Monthly grocery purchase',
          payment_Mode_Enum_Id: 1,
          payment_Mode_Name: 'Cash',
          vendor_Name: 'ABC Store',
          bill_Number: 'BL001',
          bill_Date: '2024-01-15',
          status_Id: 1,
          remarks: 'Monthly purchase'
        }
      ];
      setExpenses(dummyExpenses);
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
    fetchExpenses();
  }, [fetchExpenses, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real application, you would upload the file and get the path
      // For now, we'll just store the file name
      setExpenseData((prev) => ({
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
        Daily_Expense_Id: expenseData.Daily_Expense_Id,
        Hostel_Id: expenseData.Hostel_Id,
        Expense_Date: expenseData.Expense_Date,
        Expense_Type_Enum_Id: expenseData.Expense_Type_Enum_Id,
        Expense_Category_Enum_Id: expenseData.Expense_Category_Enum_Id,
        Expense_Amount: parseFloat(expenseData.Expense_Amount) || 0,
        Expense_Description: expenseData.Expense_Description,
        Payment_Mode_Enum_Id: expenseData.Payment_Mode_Enum_Id,
        Payment_Details_Id: expenseData.Payment_Details_Id || 0,
        Vendor_Name: expenseData.Vendor_Name,
        Bill_Number: expenseData.Bill_Number,
        Bill_Date: expenseData.Bill_Date || null,
        Attachment: expenseData.Attachment,
        Status_Id: expenseData.Status_Id,
        Remarks: expenseData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'DailyExpenseMaster',
        CreatedFrom_Menu_Code: 'EXPENSE_MGMT',
      };

      // TODO: Replace with actual API endpoint when available
      // const response = await fetch('https://localhost:7291/api/BasicMaster/SaveDailyExpense', {
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

      alert('Saved Successfully');
      setExpenseData({
        Daily_Expense_Id: 0,
        Hostel_Id: 0,
        Expense_Date: new Date().toISOString().slice(0, 10),
        Expense_Type_Enum_Id: 0,
        Expense_Category_Enum_Id: 0,
        Expense_Amount: '',
        Expense_Description: '',
        Payment_Mode_Enum_Id: 0,
        Payment_Details_Id: 0,
        Vendor_Name: '',
        Bill_Number: '',
        Bill_Date: '',
        Attachment: '',
        Status_Id: 1,
        Remarks: '',
      });
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

  const handleEdit = (expense) => {
    setExpenseData({
      Daily_Expense_Id: expense.daily_Expense_Id,
      Hostel_Id: expense.hostel_Id || 0,
      Expense_Date: expense.expense_Date || new Date().toISOString().slice(0, 10),
      Expense_Type_Enum_Id: expense.expense_Type_Enum_Id || 0,
      Expense_Category_Enum_Id: expense.expense_Category_Enum_Id || 0,
      Expense_Amount: expense.expense_Amount || '',
      Expense_Description: expense.expense_Description || '',
      Payment_Mode_Enum_Id: expense.payment_Mode_Enum_Id || 0,
      Payment_Details_Id: expense.payment_Details_Id || 0,
      Vendor_Name: expense.vendor_Name || '',
      Bill_Number: expense.bill_Number || '',
      Bill_Date: expense.bill_Date || '',
      Attachment: expense.attachment || '',
      Status_Id: expense.status_Id || 1,
      Remarks: expense.remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setExpenseData({
      Daily_Expense_Id: 0,
      Hostel_Id: 0,
      Expense_Date: new Date().toISOString().slice(0, 10),
      Expense_Type_Enum_Id: 0,
      Expense_Category_Enum_Id: 0,
      Expense_Amount: '',
      Expense_Description: '',
      Payment_Mode_Enum_Id: 0,
      Payment_Details_Id: 0,
      Vendor_Name: '',
      Bill_Number: '',
      Bill_Date: '',
      Attachment: '',
      Status_Id: 1,
      Remarks: '',
    });
    setIsEditing(false);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const description = expense.expense_Description ?? '';
    const vendorName = expense.vendor_Name ?? '';
    const billNumber = expense.bill_Number ?? '';
    const hostelName = expense.hostel_Name ?? '';
    const category = expense.expense_Category_Name ?? '';
    const search = searchTerm.toLowerCase();

    return (
      description.toLowerCase().includes(search) ||
      vendorName.toLowerCase().includes(search) ||
      billNumber.toLowerCase().includes(search) ||
      hostelName.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search)
    );
  });

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => {
    return sum + (parseFloat(expense.expense_Amount) || 0);
  }, 0);

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Daily Expense Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Daily Expense Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Expenses</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary">
                        <i className="bi bi-currency-rupee"></i>
                      </div>
                      <div className="ps-3">
                        <h6>₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h6>
                        <span className="text-muted small pt-1">Total Amount</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Total Records</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success">
                        <i className="bi bi-list-ul"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{filteredExpenses.length}</h6>
                        <span className="text-muted small pt-1">Expense Records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Average Expense</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-info">
                        <i className="bi bi-calculator"></i>
                      </div>
                      <div className="ps-3">
                        <h6>
                          ₹{filteredExpenses.length > 0 
                            ? (totalExpenses / filteredExpenses.length).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '0.00'}
                        </h6>
                        <span className="text-muted small pt-1">Per Record</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Daily Expense' : 'Add New Daily Expense'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="Hostel_Id" className="form-label">
                        Hostel <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Hostel_Id"
                        name="Hostel_Id"
                        value={expenseData.Hostel_Id}
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

                    <div className="col-md-4">
                      <label htmlFor="Expense_Date" className="form-label">
                        Expense Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="Expense_Date"
                        name="Expense_Date"
                        value={expenseData.Expense_Date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Expense_Type_Enum_Id" className="form-label">
                        Expense Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Expense_Type_Enum_Id"
                        name="Expense_Type_Enum_Id"
                        value={expenseData.Expense_Type_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Expense Type</option>
                        {expenseTypes.map((type) => (
                          <option key={type.id || type.enum_Id} value={type.id || type.enum_Id}>
                            {type.name || type.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Expense_Category_Enum_Id" className="form-label">
                        Expense Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Expense_Category_Enum_Id"
                        name="Expense_Category_Enum_Id"
                        value={expenseData.Expense_Category_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Category</option>
                        {expenseCategories.map((category) => (
                          <option key={category.id || category.enum_Id} value={category.id || category.enum_Id}>
                            {category.name || category.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Expense_Amount" className="form-label">
                        Expense Amount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Expense_Amount"
                        name="Expense_Amount"
                        value={expenseData.Expense_Amount}
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
                        value={expenseData.Payment_Mode_Enum_Id}
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
                      <label htmlFor="Vendor_Name" className="form-label">
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Vendor_Name"
                        name="Vendor_Name"
                        value={expenseData.Vendor_Name}
                        onChange={handleChange}
                        placeholder="Enter vendor name"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Bill_Number" className="form-label">
                        Bill Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Bill_Number"
                        name="Bill_Number"
                        value={expenseData.Bill_Number}
                        onChange={handleChange}
                        placeholder="Enter bill number"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Bill_Date" className="form-label">
                        Bill Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="Bill_Date"
                        name="Bill_Date"
                        value={expenseData.Bill_Date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="Expense_Description" className="form-label">
                        Expense Description
                      </label>
                      <textarea
                        className="form-control"
                        id="Expense_Description"
                        name="Expense_Description"
                        rows="3"
                        value={expenseData.Expense_Description}
                        onChange={handleChange}
                        placeholder="Enter expense description"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Attachment" className="form-label">
                        Attachment (Bill/Receipt)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="Attachment"
                        name="Attachment"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {expenseData.Attachment && (
                        <small className="text-muted">Selected: {expenseData.Attachment}</small>
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
                        value={expenseData.Status_Id}
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
                        value={expenseData.Remarks}
                        onChange={handleChange}
                        placeholder="Enter remarks (optional)"
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle me-1"></i>
                        {isEditing ? 'Update' : 'Submit'}
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

            {/* Expense List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Daily Expense List</h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Description, Vendor, Bill No or Hostel"
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
                          <th scope="col">Date</th>
                          <th scope="col">Hostel</th>
                          <th scope="col">Category</th>
                          <th scope="col">Type</th>
                          <th scope="col">Description</th>
                          <th scope="col">Vendor</th>
                          <th scope="col">Bill No</th>
                          <th scope="col">Amount</th>
                          <th scope="col">Payment Mode</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.length > 0 ? (
                          filteredExpenses.map((expense, index) => (
                            <tr key={expense.daily_Expense_Id}>
                              <td>{index + 1}</td>
                              <td>
                                {expense.expense_Date
                                  ? new Date(expense.expense_Date).toLocaleDateString('en-IN')
                                  : 'N/A'}
                              </td>
                              <td>{expense.hostel_Name || 'N/A'}</td>
                              <td>
                                <span className="badge bg-info">
                                  {expense.expense_Category_Name || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {expense.expense_Type_Name || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span
                                  title={expense.expense_Description}
                                  style={{
                                    display: 'inline-block',
                                    maxWidth: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {expense.expense_Description || 'N/A'}
                                </span>
                              </td>
                              <td>{expense.vendor_Name || 'N/A'}</td>
                              <td>{expense.bill_Number || 'N/A'}</td>
                              <td>
                                <strong>
                                  ₹{parseFloat(expense.expense_Amount || 0).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </strong>
                              </td>
                              <td>{expense.payment_Mode_Name || 'N/A'}</td>
                              <td>
                                <span className={`badge ${expense.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                  {expense.status_Id === 1 ? 'Active' : expense.status_Id === 2 ? 'Inactive' : 'Unknown'}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleEdit(expense)}
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

export default DailyExpenseMaster;

