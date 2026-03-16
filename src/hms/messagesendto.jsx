import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/custom.css';

const MessageSendTo = () => {
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

  const [formData, setFormData] = useState({
    Message_Send_To_Id: 0,
    Message_Id: 0,
    Send_To_Type_Enum_Id: 0, // Hostler, Employee, All, etc.
    Send_To_Id: 0, // Specific ID based on type
    Send_Date_Time: new Date().toISOString().slice(0, 16),
    Status_Id: 1,
    Remarks: '',
  });

  const [messages, setMessages] = useState([]);
  const [hostlers, setHostlers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sendToTypes, setSendToTypes] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  // Fetch send to types enum
  useEffect(() => {
    const fetchSendToTypes = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'Send_To_Type',
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

        setSendToTypes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching send to types:', error);
        // Default types if API fails
        setSendToTypes([
          { id: 1, name: 'All Hostlers' },
          { id: 2, name: 'Specific Hostler' },
          { id: 3, name: 'All Employees' },
          { id: 4, name: 'Specific Employee' },
        ]);
      }
    };

    fetchSendToTypes();
  }, [getToken]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // TODO: Replace with actual API endpoint when available
        // const url = `https://localhost:7291/api/BasicMaster/_GET_MESSAGE_MASTER/0/1`;
        // const res = await axios.get(url, {
        //   headers: { Authorization: token }
        // });
        // setMessages(Array.isArray(res.data) ? res.data : []);

        // Temporary dummy data
        const dummyMessages = [
          { message_Id: 1, message_Title: 'Welcome Message', message_Code: 'MSG001' },
          { message_Id: 2, message_Title: 'Fee Reminder', message_Code: 'MSG002' },
        ];
        setMessages(dummyMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [getToken]);

  // Fetch hostlers when Send_To_Type is for hostlers
  useEffect(() => {
    const fetchHostlers = async () => {
      if (formData.Send_To_Type_Enum_Id === 2) { // Specific Hostler
        try {
          const token = getToken();
          if (!token) return;

          const url = 'https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/1';
          const res = await axios.get(url, {
            headers: { Authorization: token }
          }).catch(() => ({ data: [] }));

          setHostlers(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error('Error fetching hostlers:', error);
          setHostlers([]);
        }
      } else {
        setHostlers([]);
      }
    };

    fetchHostlers();
  }, [formData.Send_To_Type_Enum_Id, getToken]);

  // Fetch employees when Send_To_Type is for employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (formData.Send_To_Type_Enum_Id === 4) { // Specific Employee
        try {
          const token = getToken();
          if (!token) return;

          const url = 'https://localhost:7291/api/BasicMaster/_GET_EMPLOYEE_MASTER/0/1';
          const res = await axios.get(url, {
            headers: { Authorization: token }
          }).catch(() => ({ data: [] }));

          setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error('Error fetching employees:', error);
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [formData.Send_To_Type_Enum_Id, getToken]);

  // Fetch sent messages
  const fetchSentMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const url = `https://localhost:7291/api/BasicMaster/_GET_MESSAGE_SEND_TO/${Message_Send_To_Id}/${Status_Id}`;
      // const res = await axios.get(url, {
      //   headers: { Authorization: token }
      // });
      // setSentMessages(Array.isArray(res.data) ? res.data : []);

      // Temporary dummy data
      const dummySentMessages = [
        {
          message_Send_To_Id: 1,
          message_Title: 'Welcome Message',
          send_To_Type_Name: 'All Hostlers',
          send_Date_Time: '2024-01-15T10:30:00',
          status_Id: 1,
        }
      ];
      setSentMessages(dummySentMessages);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSentMessages();
  }, [fetchSentMessages, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset Send_To_Id when type changes
      ...(name === 'Send_To_Type_Enum_Id' && { Send_To_Id: 0 }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) return;

      // Validate based on send to type
      if (formData.Send_To_Type_Enum_Id === 2 && !formData.Send_To_Id) {
        alert('Please select a hostler');
        return;
      }
      if (formData.Send_To_Type_Enum_Id === 4 && !formData.Send_To_Id) {
        alert('Please select an employee');
        return;
      }

      const payload = {
        Message_Send_To_Id: formData.Message_Send_To_Id,
        Message_Id: formData.Message_Id,
        Send_To_Type_Enum_Id: formData.Send_To_Type_Enum_Id,
        Send_To_Id: formData.Send_To_Type_Enum_Id === 1 || formData.Send_To_Type_Enum_Id === 3 ? 0 : formData.Send_To_Id,
        Send_Date_Time: formData.Send_Date_Time,
        Status_Id: formData.Status_Id,
        Remarks: formData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'MessageSendTo',
        CreatedFrom_Menu_Code: 'MSG_SEND',
      };

      // TODO: Replace with actual API endpoint when available
      // const response = await fetch('https://localhost:7291/api/BasicMaster/SaveMessageSendTo', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: token,
      //   },
      //   body: JSON.stringify(payload),
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result?.Message || 'Failed to send message');
      // }

      alert('Message sent successfully!');
      setFormData({
        Message_Send_To_Id: 0,
        Message_Id: 0,
        Send_To_Type_Enum_Id: 0,
        Send_To_Id: 0,
        Send_Date_Time: new Date().toISOString().slice(0, 16),
        Status_Id: 1,
        Remarks: '',
      });
      setIsEditing(false);
      setSelectedRecipients([]);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
      if (err.message.toLowerCase().includes('401')) {
        navigate('/login', { replace: true });
      }
    }
  };

  const handleEdit = (sentMessage) => {
    setFormData({
      Message_Send_To_Id: sentMessage.message_Send_To_Id,
      Message_Id: sentMessage.message_Id || 0,
      Send_To_Type_Enum_Id: sentMessage.send_To_Type_Enum_Id || 0,
      Send_To_Id: sentMessage.send_To_Id || 0,
      Send_Date_Time: sentMessage.send_Date_Time ? sentMessage.send_Date_Time.slice(0, 16) : new Date().toISOString().slice(0, 16),
      Status_Id: sentMessage.status_Id || 1,
      Remarks: sentMessage.remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      Message_Send_To_Id: 0,
      Message_Id: 0,
      Send_To_Type_Enum_Id: 0,
      Send_To_Id: 0,
      Send_Date_Time: new Date().toISOString().slice(0, 16),
      Status_Id: 1,
      Remarks: '',
    });
    setIsEditing(false);
    setSelectedRecipients([]);
  };

  const filteredSentMessages = sentMessages.filter((msg) => {
    const title = msg.message_Title ?? '';
    const type = msg.send_To_Type_Name ?? '';
    const search = searchTerm.toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      type.toLowerCase().includes(search)
    );
  });

  const showRecipientSelection = formData.Send_To_Type_Enum_Id === 2 || formData.Send_To_Type_Enum_Id === 4;

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Message Send To</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Messages</li>
            <li className="breadcrumb-item active">Message Send To</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Message Send' : 'Send Message'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="Message_Id" className="form-label">
                        Select Message <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Message_Id"
                        name="Message_Id"
                        value={formData.Message_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Message</option>
                        {messages.map((msg) => (
                          <option key={msg.message_Id} value={msg.message_Id}>
                            {msg.message_Title} ({msg.message_Code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Send_To_Type_Enum_Id" className="form-label">
                        Send To Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Send_To_Type_Enum_Id"
                        name="Send_To_Type_Enum_Id"
                        value={formData.Send_To_Type_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Send To Type</option>
                        {sendToTypes.map((type) => (
                          <option key={type.id || type.enum_Id} value={type.id || type.enum_Id}>
                            {type.name || type.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.Send_To_Type_Enum_Id === 2 && (
                      <div className="col-md-6">
                        <label htmlFor="Send_To_Id" className="form-label">
                          Select Hostler <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="Send_To_Id"
                          name="Send_To_Id"
                          value={formData.Send_To_Id}
                          onChange={handleChange}
                          required
                        >
                          <option value="0">Select Hostler</option>
                          {hostlers.map((hostler) => (
                            <option key={hostler.hostler_Id} value={hostler.hostler_Id}>
                              {hostler.hostler_Name} ({hostler.hostler_Code})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.Send_To_Type_Enum_Id === 4 && (
                      <div className="col-md-6">
                        <label htmlFor="Send_To_Id" className="form-label">
                          Select Employee <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="Send_To_Id"
                          name="Send_To_Id"
                          value={formData.Send_To_Id}
                          onChange={handleChange}
                          required
                        >
                          <option value="0">Select Employee</option>
                          {employees.map((emp) => (
                            <option key={emp.employee_Id} value={emp.employee_Id}>
                              {emp.employee_Name} ({emp.employee_Code})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="col-md-6">
                      <label htmlFor="Send_Date_Time" className="form-label">
                        Send Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="Send_Date_Time"
                        name="Send_Date_Time"
                        value={formData.Send_Date_Time}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Status_Id" className="form-label">
                        Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Status_Id"
                        name="Status_Id"
                        value={formData.Status_Id}
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
                        value={formData.Remarks}
                        onChange={handleChange}
                        placeholder="Enter remarks (optional)"
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-send me-1"></i>
                        {isEditing ? 'Update' : 'Send Message'}
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

            {/* Sent Messages List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Sent Messages List</h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Message or Type"
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
                          <th scope="col">Message</th>
                          <th scope="col">Send To Type</th>
                          <th scope="col">Recipient</th>
                          <th scope="col">Send Date & Time</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSentMessages.length > 0 ? (
                          filteredSentMessages.map((msg, index) => (
                            <tr key={msg.message_Send_To_Id}>
                              <td>{index + 1}</td>
                              <td>{msg.message_Title}</td>
                              <td>
                                <span className="badge bg-info">
                                  {msg.send_To_Type_Name || 'N/A'}
                                </span>
                              </td>
                              <td>
                                {msg.send_To_Type_Enum_Id === 1 || msg.send_To_Type_Enum_Id === 3
                                  ? 'All'
                                  : msg.recipient_Name || 'N/A'}
                              </td>
                              <td>
                                {msg.send_Date_Time
                                  ? new Date(msg.send_Date_Time).toLocaleString()
                                  : 'N/A'}
                              </td>
                              <td>
                                <span className={`badge ${msg.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                  {msg.status_Id === 1 ? 'Active' : msg.status_Id === 2 ? 'Inactive' : 'Unknown'}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleEdit(msg)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
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

export default MessageSendTo;

