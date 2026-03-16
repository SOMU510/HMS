import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatusDropdown from './statusdropdown';
import '../style/custom.css';

const PaymentMaster = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [paymentData, setPaymentData] = useState({
    Payment_Id: 0,
    Hostler_Id: '',
    Payment_Date: '',
    Payment_Type: '',
    Payment_Amount: '',
    Payment_Mode: '',
    Transaction_Id: '',
    Receipt_Number: '',
    Payment_For_Month: '',
    Payment_Year: '',
    Late_Fee: '',
    Discount: '',
    Total_Amount: '',
    Payment_Status: '',
    Remarks: '',
  });

  const [payments, setPayments] = useState([]);
  const [hostlers, setHostlers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Types
  const paymentTypes = [
    { id: 'Hostel Fee', name: 'Hostel Fee' },
    { id: 'Caution Money', name: 'Caution Money' },
    { id: 'Maintenance', name: 'Maintenance' },
    { id: 'Fine', name: 'Fine' },
    { id: 'Other', name: 'Other' },
  ];

  // Payment Modes
  const paymentModes = [
    { id: 'Cash', name: 'Cash' },
    { id: 'Online', name: 'Online' },
    { id: 'Card', name: 'Card' },
    { id: 'Cheque', name: 'Cheque' },
    { id: 'UPI', name: 'UPI' },
  ];

  // Payment Status
  const paymentStatuses = [
    { id: 'Paid', name: 'Paid', class: 'success' },
    { id: 'Pending', name: 'Pending', class: 'warning' },
    { id: 'Failed', name: 'Failed', class: 'danger' },
    { id: 'Refunded', name: 'Refunded', class: 'info' },
  ];

  // Months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchPayments = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      // Mock data - Replace with actual API call
      const mockPayments = [
        {
          payment_Id: 1,
          hostler_Name: 'John Doe',
          payment_Date: '2024-01-15',
          payment_Type: 'Hostel Fee',
          payment_Amount: '5000',
          payment_Mode: 'Online',
          transaction_Id: 'TXN123456',
          receipt_Number: 'RCP001',
          payment_Status: 'Paid',
          status_Id: 1,
        },
        {
          payment_Id: 2,
          hostler_Name: 'Jane Smith',
          payment_Date: '2024-01-16',
          payment_Type: 'Caution Money',
          payment_Amount: '2000',
          payment_Mode: 'Cash',
          transaction_Id: '',
          receipt_Number: 'RCP002',
          payment_Status: 'Pending',
          status_Id: 1,
        },
      ];
      
      setPayments(mockPayments);

      // Fetch hostlers for dropdown
      const mockHostlers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Mike Johnson' },
      ];
      setHostlers(mockHostlers);

    } catch (error) {
      console.error('Fetch failed:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { replace: true });
      }
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

    // Auto-calculate total amount
    if (name === 'Payment_Amount' || name === 'Late_Fee' || name === 'Discount') {
      calculateTotal({
        ...paymentData,
        [name]: value,
      });
    }
  };

  const calculateTotal = (data) => {
    const amount = parseFloat(data.Payment_Amount || 0);
    const lateFee = parseFloat(data.Late_Fee || 0);
    const discount = parseFloat(data.Discount || 0);
    const total = amount + lateFee - discount;
    
    setPaymentData((prev) => ({
      ...prev,
      Total_Amount: total.toFixed(2),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API call
      console.log('Submitting payment:', paymentData);
      
      alert(isEditing ? 'Payment Updated Successfully' : 'Payment Recorded Successfully');
      handleReset();
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (payment) => {
    setPaymentData({
      Payment_Id: payment.payment_Id,
      Hostler_Id: payment.hostler_Id || '',
      Payment_Date: payment.payment_Date,
      Payment_Type: payment.payment_Type,
      Payment_Amount: payment.payment_Amount,
      Payment_Mode: payment.payment_Mode,
      Transaction_Id: payment.transaction_Id || '',
      Receipt_Number: payment.receipt_Number,
      Payment_For_Month: payment.payment_For_Month || '',
      Payment_Year: payment.payment_Year || '',
      Late_Fee: payment.late_Fee || '0',
      Discount: payment.discount || '0',
      Total_Amount: payment.total_Amount || payment.payment_Amount,
      Payment_Status: payment.payment_Status,
      Remarks: payment.remarks || '',
    });
    setIsEditing(true);
  };

  const handleReset = () => {
    setPaymentData({
      Payment_Id: 0,
      Hostler_Id: '',
      Payment_Date: '',
      Payment_Type: '',
      Payment_Amount: '',
      Payment_Mode: '',
      Transaction_Id: '',
      Receipt_Number: '',
      Payment_For_Month: '',
      Payment_Year: '',
      Late_Fee: '',
      Discount: '',
      Total_Amount: '',
      Payment_Status: '',
      Remarks: '',
    });
    setIsEditing(false);
  };

  const filteredPayments = payments.filter((payment) => {
    const name = payment.hostler_Name ?? '';
    const receipt = payment.receipt_Number ?? '';
    const transaction = payment.transaction_Id ?? '';
    const search = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      receipt.toLowerCase().includes(search) ||
      transaction.toLowerCase().includes(search)
    );
  });

  const getStatusBadgeClass = (status) => {
    const statusObj = paymentStatuses.find(s => s.id === status);
    return statusObj ? `bg-${statusObj.class}` : 'bg-secondary';
  };

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Payment Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Transactions</li>
            <li className="breadcrumb-item active">Payment Master</li>
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
                  <i className="bi bi-credit-card me-2"></i>
                  {isEditing ? 'Edit Payment' : 'Record New Payment'}
                </h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Hostler Selection */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Id" className="form-label">
                        <i className="bi bi-person me-1"></i>Hostler Name *
                      </label>
                      <select
                        className="form-select"
                        id="Hostler_Id"
                        name="Hostler_Id"
                        value={paymentData.Hostler_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Hostler</option>
                        {hostlers.map((hostler) => (
                          <option key={hostler.id} value={hostler.id}>
                            {hostler.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Date */}
                    <div className="col-md-4">
                      <label htmlFor="Payment_Date" className="form-label">
                        <i className="bi bi-calendar me-1"></i>Payment Date *
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

                    {/* Payment Type */}
                    <div className="col-md-4">
                      <label htmlFor="Payment_Type" className="form-label">
                        <i className="bi bi-tag me-1"></i>Payment Type *
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Type"
                        name="Payment_Type"
                        value={paymentData.Payment_Type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Type</option>
                        {paymentTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Amount */}
                    <div className="col-md-3">
                      <label htmlFor="Payment_Amount" className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>Amount *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Payment_Amount"
                        name="Payment_Amount"
                        value={paymentData.Payment_Amount}
                        onChange={handleChange}
                        step="0.01"
                        required
                      />
                    </div>

                    {/* Late Fee */}
                    <div className="col-md-3">
                      <label htmlFor="Late_Fee" className="form-label">
                        <i className="bi bi-exclamation-circle me-1"></i>Late Fee
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Late_Fee"
                        name="Late_Fee"
                        value={paymentData.Late_Fee}
                        onChange={handleChange}
                        step="0.01"
                      />
                    </div>

                    {/* Discount */}
                    <div className="col-md-3">
                      <label htmlFor="Discount" className="form-label">
                        <i className="bi bi-percent me-1"></i>Discount
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Discount"
                        name="Discount"
                        value={paymentData.Discount}
                        onChange={handleChange}
                        step="0.01"
                      />
                    </div>

                    {/* Total Amount */}
                    <div className="col-md-3">
                      <label htmlFor="Total_Amount" className="form-label">
                        <i className="bi bi-cash-stack me-1"></i>Total Amount
                      </label>
                      <input
                        type="text"
                        className="form-control fw-bold"
                        id="Total_Amount"
                        name="Total_Amount"
                        value={paymentData.Total_Amount}
                        readOnly
                        style={{ backgroundColor: '#f0f8ff' }}
                      />
                    </div>

                    {/* Payment Mode */}
                    <div className="col-md-4">
                      <label htmlFor="Payment_Mode" className="form-label">
                        <i className="bi bi-wallet2 me-1"></i>Payment Mode *
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Mode"
                        name="Payment_Mode"
                        value={paymentData.Payment_Mode}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Mode</option>
                        {paymentModes.map((mode) => (
                          <option key={mode.id} value={mode.id}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Transaction ID */}
                    <div className="col-md-4">
                      <label htmlFor="Transaction_Id" className="form-label">
                        <i className="bi bi-hash me-1"></i>Transaction ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Transaction_Id"
                        name="Transaction_Id"
                        value={paymentData.Transaction_Id}
                        onChange={handleChange}
                        placeholder="For online payments"
                      />
                    </div>

                    {/* Receipt Number */}
                    <div className="col-md-4">
                      <label htmlFor="Receipt_Number" className="form-label">
                        <i className="bi bi-receipt me-1"></i>Receipt Number *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Receipt_Number"
                        name="Receipt_Number"
                        value={paymentData.Receipt_Number}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Payment For Month */}
                    <div className="col-md-4">
                      <label htmlFor="Payment_For_Month" className="form-label">
                        <i className="bi bi-calendar-month me-1"></i>Payment For Month
                      </label>
                      <select
                        className="form-select"
                        id="Payment_For_Month"
                        name="Payment_For_Month"
                        value={paymentData.Payment_For_Month}
                        onChange={handleChange}
                      >
                        <option value="">Select Month</option>
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Year */}
                    <div className="col-md-4">
                      <label htmlFor="Payment_Year" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>Payment Year
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Payment_Year"
                        name="Payment_Year"
                        value={paymentData.Payment_Year}
                        onChange={handleChange}
                        placeholder="2024"
                        min="2020"
                        max="2099"
                      />
                    </div>

                    {/* Payment Status */}
                    <div className="col-md-4">
                      <label htmlFor="Payment_Status" className="form-label">
                        <i className="bi bi-check-circle me-1"></i>Payment Status *
                      </label>
                      <select
                        className="form-select"
                        id="Payment_Status"
                        name="Payment_Status"
                        value={paymentData.Payment_Status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Status</option>
                        {paymentStatuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remarks */}
                    <div className="col-md-12">
                      <label htmlFor="Remarks" className="form-label">
                        <i className="bi bi-chat-left-text me-1"></i>Remarks
                      </label>
                      <textarea
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        rows="2"
                        value={paymentData.Remarks}
                        onChange={handleChange}
                        placeholder="Any additional notes..."
                      ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle me-1"></i>
                        {isEditing ? 'Update Payment' : 'Record Payment'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={handleReset}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        {isEditing ? 'Cancel' : 'Reset'}
                      </button>
                      {!isEditing && (
                        <button
                          type="button"
                          className="btn btn-info ms-2"
                          onClick={() => window.print()}
                        >
                          <i className="bi bi-printer me-1"></i>
                          Print Receipt
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
                  <h5 className="card-title mb-0">
                    <i className="bi bi-list-ul me-2"></i>Payment History
                  </h5>
                  <div className="d-flex gap-2">
                    <div className="search-bar" style={{ minWidth: '300px' }}>
                      <form className="search-form d-flex align-items-center">
                        <input
                          type="text"
                          name="query"
                          placeholder="Search by Name, Receipt, or Transaction ID"
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
                    <button className="btn btn-success">
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      Export
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Receipt No.</th>
                        <th scope="col">Hostler Name</th>
                        <th scope="col">Date</th>
                        <th scope="col">Type</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Mode</th>
                        <th scope="col">Transaction ID</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <tr key={payment.payment_Id}>
                            <td>{payment.payment_Id}</td>
                            <td>
                              <strong className="text-primary">{payment.receipt_Number}</strong>
                            </td>
                            <td>{payment.hostler_Name}</td>
                            <td>{new Date(payment.payment_Date).toLocaleDateString()}</td>
                            <td>
                              <span className="badge bg-info">{payment.payment_Type}</span>
                            </td>
                            <td>
                              <strong>₹{payment.payment_Amount}</strong>
                            </td>
                            <td>{payment.payment_Mode}</td>
                            <td>
                              <small className="text-muted">
                                {payment.transaction_Id || '-'}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(payment.payment_Status)}`}>
                                {payment.payment_Status}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleEdit(payment)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => window.print()}
                                title="Print Receipt"
                              >
                                <i className="bi bi-printer"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center">
                            <div className="py-4">
                              <i className="bi bi-inbox fs-1 text-muted"></i>
                              <p className="text-muted mt-2">No payments found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {filteredPayments.length > 0 && (
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan="5" className="text-end fw-bold">Total:</td>
                          <td className="fw-bold">
                            ₹{filteredPayments.reduce((sum, p) => sum + parseFloat(p.payment_Amount || 0), 0).toFixed(2)}
                          </td>
                          <td colSpan="4"></td>
                        </tr>
                      </tfoot>
                    )}
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

export default PaymentMaster;

