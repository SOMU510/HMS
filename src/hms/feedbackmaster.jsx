import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackMaster = () => {
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

  const [feedbackData, setFeedbackData] = useState({
    Feedback_Id: 0,
    Hostel_Id: 0,
    FeedBack_Type_Enum_Id: 0,
    FeedBack_Internal_Code: '',
    FeedBack_Title: '',
    FeedBack_Description: '',
    Generated_By_Id: 0,
    Status_Id: 1,
    Remarks: '',
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
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

  // Fetch feedback types enum
  useEffect(() => {
    const fetchFeedbackTypes = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: 'FeedBack_Type',
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

        setFeedbackTypes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching feedback types:', error);
        setFeedbackTypes([]);
      }
    };

    fetchFeedbackTypes();
  }, [getToken]);

  // Memoized fetchFeedbacks function
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const url = `https://localhost:7291/api/BasicMaster/_GET_FEEDBACK_MASTER/${Feedback_Id}/${Hostel_Id}/${Status_Id}`;
      // const res = await axios.get(url, {
      //   headers: {
      //     Authorization: token,
      //     Accept: 'application/json',
      //   },
      // });
      // setFeedbacks(Array.isArray(res.data) ? res.data : []);

      // Temporary dummy data
      const dummyFeedbacks = [
        {
          feedback_Id: 1,
          hostel_Id: 1,
          hostel_Name: 'Boys Hostel A',
          feedBack_Type_Enum_Id: 1,
          feedBack_Type_Name: 'Complaint',
          feedBack_Internal_Code: 'FB001',
          feedBack_Title: 'Water Issue',
          feedBack_Description: 'No water supply in the morning',
          generated_By_Id: 1,
          status_Id: 1,
          remarks: 'Urgent attention required'
        }
      ];
      setFeedbacks(dummyFeedbacks);
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
    fetchFeedbacks();
  }, [fetchFeedbacks, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({
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
        Feedback_Id: feedbackData.Feedback_Id,
        Hostel_Id: feedbackData.Hostel_Id,
        FeedBack_Type_Enum_Id: feedbackData.FeedBack_Type_Enum_Id,
        FeedBack_Internal_Code: feedbackData.FeedBack_Internal_Code,
        FeedBack_Title: feedbackData.FeedBack_Title,
        FeedBack_Description: feedbackData.FeedBack_Description,
        Generated_By_Id: feedbackData.Generated_By_Id || 0,
        Status_Id: feedbackData.Status_Id,
        Remarks: feedbackData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'FeedbackMaster',
        CreatedFrom_Menu_Code: 'FEEDBACK_MGMT',
      };

      // TODO: Replace with actual API endpoint when available
      // const response = await fetch('https://localhost:7291/api/BasicMaster/SaveFeedback', {
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
      setFeedbackData({
        Feedback_Id: 0,
        Hostel_Id: 0,
        FeedBack_Type_Enum_Id: 0,
        FeedBack_Internal_Code: '',
        FeedBack_Title: '',
        FeedBack_Description: '',
        Generated_By_Id: 0,
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

  const handleEdit = (feedback) => {
    setFeedbackData({
      Feedback_Id: feedback.feedback_Id,
      Hostel_Id: feedback.hostel_Id || 0,
      FeedBack_Type_Enum_Id: feedback.feedBack_Type_Enum_Id || 0,
      FeedBack_Internal_Code: feedback.feedBack_Internal_Code || '',
      FeedBack_Title: feedback.feedBack_Title || '',
      FeedBack_Description: feedback.feedBack_Description || '',
      Generated_By_Id: feedback.generated_By_Id || 0,
      Status_Id: feedback.status_Id || 1,
      Remarks: feedback.remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFeedbackData({
      Feedback_Id: 0,
      Hostel_Id: 0,
      FeedBack_Type_Enum_Id: 0,
      FeedBack_Internal_Code: '',
      FeedBack_Title: '',
      FeedBack_Description: '',
      Generated_By_Id: 0,
      Status_Id: 1,
      Remarks: '',
    });
    setIsEditing(false);
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const title = feedback.feedBack_Title ?? '';
    const code = feedback.feedBack_Internal_Code ?? '';
    const description = feedback.feedBack_Description ?? '';
    const hostelName = feedback.hostel_Name ?? '';
    const search = searchTerm.toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      code.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search) ||
      hostelName.toLowerCase().includes(search)
    );
  });

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Feedback Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Feedback Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Feedback' : 'Add New Feedback'}</h5>

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
                        value={feedbackData.Hostel_Id}
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
                      <label htmlFor="FeedBack_Type_Enum_Id" className="form-label">
                        Feedback Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="FeedBack_Type_Enum_Id"
                        name="FeedBack_Type_Enum_Id"
                        value={feedbackData.FeedBack_Type_Enum_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="0">Select Feedback Type</option>
                        {feedbackTypes.map((type) => (
                          <option key={type.id || type.enum_Id} value={type.id || type.enum_Id}>
                            {type.name || type.enum_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="FeedBack_Internal_Code" className="form-label">
                        Internal Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="FeedBack_Internal_Code"
                        name="FeedBack_Internal_Code"
                        value={feedbackData.FeedBack_Internal_Code}
                        onChange={handleChange}
                        required
                        placeholder="Enter internal code"
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
                        value={feedbackData.Status_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label htmlFor="FeedBack_Title" className="form-label">
                        Feedback Title
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="FeedBack_Title"
                        name="FeedBack_Title"
                        value={feedbackData.FeedBack_Title}
                        onChange={handleChange}
                        placeholder="Enter feedback title"
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="FeedBack_Description" className="form-label">
                        Feedback Description
                      </label>
                      <textarea
                        className="form-control"
                        id="FeedBack_Description"
                        name="FeedBack_Description"
                        rows="5"
                        value={feedbackData.FeedBack_Description}
                        onChange={handleChange}
                        placeholder="Enter feedback description"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Generated_By_Id" className="form-label">
                        Generated By ID
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="Generated_By_Id"
                        name="Generated_By_Id"
                        value={feedbackData.Generated_By_Id}
                        onChange={handleChange}
                        placeholder="Enter generated by ID (optional)"
                        min="0"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="Remarks" className="form-label">Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        value={feedbackData.Remarks}
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

            {/* Feedback List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Feedback List</h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Title, Code, Description or Hostel"
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
                          <th scope="col">Hostel</th>
                          <th scope="col">Type</th>
                          <th scope="col">Internal Code</th>
                          <th scope="col">Title</th>
                          <th scope="col">Description</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedbacks.length > 0 ? (
                          filteredFeedbacks.map((feedback, index) => (
                            <tr key={feedback.feedback_Id}>
                              <td>{index + 1}</td>
                              <td>{feedback.hostel_Name || 'N/A'}</td>
                              <td>
                                <span className="badge bg-info">
                                  {feedback.feedBack_Type_Name || 'N/A'}
                                </span>
                              </td>
                              <td>{feedback.feedBack_Internal_Code}</td>
                              <td>{feedback.feedBack_Title || 'N/A'}</td>
                              <td>
                                <span
                                  title={feedback.feedBack_Description}
                                  style={{
                                    display: 'inline-block',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {feedback.feedBack_Description || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${feedback.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                  {feedback.status_Id === 1 ? 'Active' : feedback.status_Id === 2 ? 'Inactive' : 'Unknown'}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleEdit(feedback)}
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

export default FeedbackMaster;

