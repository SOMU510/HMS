import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MessageMaster = () => {
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

  const [messageData, setMessageData] = useState({
    Message_Id: 0,
    Message_Title: '',
    Message_Code: '',
    Message_Internal_Code: '',
    Message_Content: '',
    Message_Type_Enum_Id: 0,
    Status_Id: 1,
    Remarks: '',
  });

  const [messages, setMessages] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageTypes, setMessageTypes] = useState([]);

  // Fetch message types enum
  useEffect(() => {
    const fetchMessageTypes = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'Message_Type',
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

        setMessageTypes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching message types:', error);
        setMessageTypes([]);
      }
    };

    fetchMessageTypes();
  }, [getToken]);

  // Memoized fetchMessages function
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const url = `https://localhost:7291/api/BasicMaster/_GET_MESSAGE_MASTER/${Message_Id}/${Status_Id}`;
      // const res = await axios.get(url, {
      //   headers: {
      //     Authorization: token,
      //     Accept: 'application/json',
      //   },
      // });
      // setMessages(Array.isArray(res.data) ? res.data : []);

      // Temporary dummy data
      const dummyMessages = [
        {
          message_Id: 1,
          message_Title: 'Welcome Message',
          message_Code: 'MSG001',
          message_Internal_Code: 'INT001',
          message_Content: 'Welcome to the hostel management system.',
          message_Type_Enum_Id: 1,
          message_Type_Name: 'General',
          status_Id: 1,
          remarks: 'Welcome message for new students'
        }
      ];
      setMessages(dummyMessages);
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
    fetchMessages();
  }, [fetchMessages, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) return;

      const payload = {
        Message_Id: messageData.Message_Id,
        Message_Title: messageData.Message_Title,
        Message_Code: messageData.Message_Code,
        Message_Internal_Code: messageData.Message_Internal_Code,
        Message_Content: messageData.Message_Content,
        Message_Type_Enum_Id: messageData.Message_Type_Enum_Id || 0,
        Status_Id: messageData.Status_Id,
        Remarks: messageData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'MessageMaster',
        CreatedFrom_Menu_Code: 'MSG_MGMT',
      };

      // TODO: Replace with actual API endpoint when available
      // const response = await fetch('https://localhost:7291/api/BasicMaster/SaveMessage', {
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
      setMessageData({
        Message_Id: 0,
        Message_Title: '',
        Message_Code: '',
        Message_Internal_Code: '',
        Message_Content: '',
        Message_Type_Enum_Id: 0,
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

  const handleEdit = (message) => {
    setMessageData({
      Message_Id: message.message_Id,
      Message_Title: message.message_Title || '',
      Message_Code: message.message_Code || '',
      Message_Internal_Code: message.message_Internal_Code || '',
      Message_Content: message.message_Content || '',
      Message_Type_Enum_Id: message.message_Type_Enum_Id || 0,
      Status_Id: message.status_Id || 1,
      Remarks: message.remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setMessageData({
      Message_Id: 0,
      Message_Title: '',
      Message_Code: '',
      Message_Internal_Code: '',
      Message_Content: '',
      Message_Type_Enum_Id: 0,
      Status_Id: 1,
      Remarks: '',
    });
    setIsEditing(false);
  };

  const filteredMessages = messages.filter((message) => {
    const title = message.message_Title ?? '';
    const code = message.message_Code ?? '';
    const content = message.message_Content ?? '';
    const search = searchTerm.toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      code.toLowerCase().includes(search) ||
      content.toLowerCase().includes(search)
    );
  });

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Message Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Message Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Message' : 'Add New Message'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="Message_Title" className="form-label">
                        Message Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Message_Title"
                        name="Message_Title"
                        value={messageData.Message_Title}
                        onChange={handleChange}
                        required
                        placeholder="Enter message title"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Message_Code" className="form-label">
                        Message Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Message_Code"
                        name="Message_Code"
                        value={messageData.Message_Code}
                        onChange={handleChange}
                        placeholder="Enter message code"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="Message_Internal_Code" className="form-label">
                        Internal Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Message_Internal_Code"
                        name="Message_Internal_Code"
                        value={messageData.Message_Internal_Code}
                        onChange={handleChange}
                        required
                        placeholder="Enter internal code"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Message_Type_Enum_Id" className="form-label">
                        Message Type
                      </label>
                      <select
                        className="form-select"
                        id="Message_Type_Enum_Id"
                        name="Message_Type_Enum_Id"
                        value={messageData.Message_Type_Enum_Id}
                        onChange={handleChange}
                      >
                        <option value="0">Select Message Type</option>
                        {messageTypes.map((type) => (
                          <option key={type.id || type.enum_Id} value={type.id || type.enum_Id}>
                            {type.name || type.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Status_Id" className="form-label">
                        Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="Status_Id"
                        name="Status_Id"
                        value={messageData.Status_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label htmlFor="Message_Content" className="form-label">
                        Message Content <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="Message_Content"
                        name="Message_Content"
                        rows="5"
                        value={messageData.Message_Content}
                        onChange={handleChange}
                        required
                        placeholder="Enter message content"
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="Remarks" className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        rows="2"
                        value={messageData.Remarks}
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

            {/* Message List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Message List</h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Title, Code or Content"
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
                          <th scope="col">Title</th>
                          <th scope="col">Code</th>
                          <th scope="col">Internal Code</th>
                          <th scope="col">Type</th>
                          <th scope="col">Content</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMessages.length > 0 ? (
                          filteredMessages.map((message, index) => (
                            <tr key={message.message_Id}>
                              <td>{index + 1}</td>
                              <td>{message.message_Title}</td>
                              <td>{message.message_Code}</td>
                              <td>{message.message_Internal_Code}</td>
                              <td>
                                <span className="badge bg-info">
                                  {message.message_Type_Name || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span
                                  title={message.message_Content}
                                  style={{
                                    display: 'inline-block',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {message.message_Content}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${message.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                  {message.status_Id === 1 ? 'Active' : message.status_Id === 2 ? 'Inactive' : 'Unknown'}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleEdit(message)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
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

export default MessageMaster;

