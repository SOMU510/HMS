import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import '../style/custom.css';

const VisitorMaster = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  // Form state - Visitor
  const [formData, setFormData] = useState({
    Visitor_Id: 0,
    Hostel_Id: '',
    Visitor_Name: '',
    Visitor_Code: '',
    Visitor_Internal_Code: '',
    Visitor_Visited_Date: dayjs(),
    Visitor_Email_Id: '',
    Visitor_Mobile_No: '',
    Visitor_Address: '',
    Visitor_Pincode: '',
    Visitor_State_Id: '',
    Visitor_City_Id: '',
    Visitor_Visit_For_Enum_Id: '',
    Status_Id: 1,
    Remarks: '',
    Action_Remarks: '',
  });

  // Document state
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState({
    Visitor_Document_Id: 0,
    Document_Id: '',
    Unique_No: '',
    Name_As_Per_Document: '',
    Name_As_Per_Third_Party: '',
    Document_Detail: '',
    Valid_From_Date: null,
    Valid_Upto_Date: null,
    Document_Path: null,
  });

  // Hostler linking state
  const [hostlerLinks, setHostlerLinks] = useState([]);
  const [currentHostlerLink, setCurrentHostlerLink] = useState({
    Visitor_Hostler_Link_Id: 0,
    Hostler_Id: '',
    Hostler_Visitor_Relation_Enum_Id: '',
    Is_Verified_Visitor: false,
    Status_Id: 1,
    Remarks: '',
  });

  // Dropdown data
  const [hostels, setHostels] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [hostlers, setHostlers] = useState([]);
  const [relationTypes, setRelationTypes] = useState([]);
  const [visitors, setVisitors] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('visitor'); // visitor, documents, hostlers
  const [selectedFile, setSelectedFile] = useState(null);

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

        // Fetch hostels
        const hostelRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch hostels failed:', err);
          return { data: [] };
        });
        setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);

        // Fetch states
        const stateRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_STATE/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch states failed:', err);
          return { data: [] };
        });
        setStates(Array.isArray(stateRes.data) ? stateRes.data : []);

        // Fetch visit purposes enum
        const visitPurposeRes = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: "Visit_Purpose",
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
          console.error('Fetch visit purposes failed:', err);
          return { data: [] };
        });
        setVisitPurposes(Array.isArray(visitPurposeRes.data) ? visitPurposeRes.data : []);

        // Fetch document types enum
        const docTypeRes = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: "Document_Type",
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
          console.error('Fetch document types failed:', err);
          return { data: [] };
        });
        setDocumentTypes(Array.isArray(docTypeRes.data) ? docTypeRes.data : []);

        // Fetch hostlers
        const hostlerRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch hostlers failed:', err);
          return { data: [] };
        });
        setHostlers(Array.isArray(hostlerRes.data) ? hostlerRes.data : []);

        // Fetch relation types enum
        const relationRes = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: "Visitor_Relation",
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
          console.error('Fetch relation types failed:', err);
          return { data: [] };
        });
        setRelationTypes(Array.isArray(relationRes.data) ? relationRes.data : []);

        setLoading(false);
      } catch (err) {
        console.error('Fetch initial data failed:', err);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [getToken]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.Visitor_State_Id) {
        setCities([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(
          `https://localhost:7291/api/BasicMaster/_GET_CITY/0/${formData.Visitor_State_Id}/1`,
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setCities(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch cities failed:', err);
      }
    };

    fetchCities();
  }, [formData.Visitor_State_Id, getToken]);

  // Fetch visitors for table
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_VISITOR/0/0',
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setVisitors(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch visitors failed:', err);
      }
    };

    fetchVisitors();
  }, [getToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDocument(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentDateChange = (name, value) => {
    setCurrentDocument(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setCurrentDocument(prev => ({
        ...prev,
        Document_Path: file.name,
      }));
    }
  };

  const handleAddDocument = () => {
    if (!currentDocument.Document_Id || !currentDocument.Unique_No) {
      alert('Please select document type and enter unique number');
      return;
    }

    const newDoc = {
      ...currentDocument,
      tempId: Date.now(), // Temporary ID for UI
    };

    setDocuments(prev => [...prev, newDoc]);

    // Reset current document
    setCurrentDocument({
      Visitor_Document_Id: 0,
      Document_Id: '',
      Unique_No: '',
      Name_As_Per_Document: '',
      Name_As_Per_Third_Party: '',
      Document_Detail: '',
      Valid_From_Date: null,
      Valid_Upto_Date: null,
      Document_Path: null,
    });
    setSelectedFile(null);
  };

  const handleRemoveDocument = (tempId) => {
    setDocuments(prev => prev.filter(doc => doc.tempId !== tempId));
  };

  const handleHostlerLinkInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentHostlerLink(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddHostlerLink = () => {
    if (!currentHostlerLink.Hostler_Id) {
      alert('Please select a hostler');
      return;
    }

    const newLink = {
      ...currentHostlerLink,
      tempId: Date.now(),
      hostlerName: hostlers.find(h => h.hostler_Id === parseInt(currentHostlerLink.Hostler_Id))?.hostler_Name || '',
    };

    setHostlerLinks(prev => [...prev, newLink]);

    // Reset current link
    setCurrentHostlerLink({
      Visitor_Hostler_Link_Id: 0,
      Hostler_Id: '',
      Hostler_Visitor_Relation_Enum_Id: '',
      Is_Verified_Visitor: false,
      Status_Id: 1,
      Remarks: '',
    });
  };

  const handleRemoveHostlerLink = (tempId) => {
    setHostlerLinks(prev => prev.filter(link => link.tempId !== tempId));
  };

  const resetForm = () => {
    setFormData({
      Visitor_Id: 0,
      Hostel_Id: '',
      Visitor_Name: '',
      Visitor_Code: '',
      Visitor_Internal_Code: '',
      Visitor_Visited_Date: dayjs(),
      Visitor_Email_Id: '',
      Visitor_Mobile_No: '',
      Visitor_Address: '',
      Visitor_Pincode: '',
      Visitor_State_Id: '',
      Visitor_City_Id: '',
      Visitor_Visit_For_Enum_Id: '',
      Status_Id: 1,
      Remarks: '',
      Action_Remarks: '',
    });
    setDocuments([]);
    setHostlerLinks([]);
    setActiveTab('visitor');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.Hostel_Id || !formData.Visitor_Name || !formData.Visitor_Mobile_No) {
      alert('Please fill in all required fields (Hostel, Name, Mobile)');
      return;
    }

    if (hostlerLinks.length === 0) {
      alert('Please add at least one hostler link (whom the visitor is visiting)');
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      if (!token) return;

      const payload = {
        Visitor: {
          Visitor_Id: formData.Visitor_Id,
          Hostel_Id: parseInt(formData.Hostel_Id),
          Visitor_Name: formData.Visitor_Name,
          Visitor_Code: formData.Visitor_Code,
          Visitor_Internal_Code: formData.Visitor_Internal_Code,
          Visitor_Visited_Date: formData.Visitor_Visited_Date ? formData.Visitor_Visited_Date.format('YYYY-MM-DDTHH:mm:ss') : null,
          Visitor_Email_Id: formData.Visitor_Email_Id,
          Visitor_Mobile_No: formData.Visitor_Mobile_No,
          Visitor_Address: formData.Visitor_Address,
          Visitor_Pincode: formData.Visitor_Pincode,
          Visitor_State_Id: formData.Visitor_State_Id ? parseInt(formData.Visitor_State_Id) : null,
          Visitor_City_Id: formData.Visitor_City_Id ? parseInt(formData.Visitor_City_Id) : null,
          Visitor_Visit_For_Enum_Id: formData.Visitor_Visit_For_Enum_Id ? parseInt(formData.Visitor_Visit_For_Enum_Id) : null,
          Status_Id: parseInt(formData.Status_Id),
          Remarks: formData.Remarks,
          Action_Remarks: formData.Action_Remarks,
        },
        Documents: documents.map(doc => ({
          Visitor_Document_Id: doc.Visitor_Document_Id || 0,
          Document_Id: parseInt(doc.Document_Id),
          Unique_No: doc.Unique_No,
          Name_As_Per_Document: doc.Name_As_Per_Document,
          Name_As_Per_Third_Party: doc.Name_As_Per_Third_Party,
          Document_Detail: doc.Document_Detail,
          Valid_From_Date: doc.Valid_From_Date ? doc.Valid_From_Date.format('YYYY-MM-DDTHH:mm:ss') : null,
          Valid_Upto_Date: doc.Valid_Upto_Date ? doc.Valid_Upto_Date.format('YYYY-MM-DDTHH:mm:ss') : null,
          Document_Path: doc.Document_Path,
        })),
        HostlerLinks: hostlerLinks.map(link => ({
          Visitor_Hostler_Link_Id: link.Visitor_Hostler_Link_Id || 0,
          Hostler_Id: parseInt(link.Hostler_Id),
          Hostler_Visitor_Relation_Enum_Id: link.Hostler_Visitor_Relation_Enum_Id ? parseInt(link.Hostler_Visitor_Relation_Enum_Id) : null,
          Is_Verified_Visitor: link.Is_Verified_Visitor,
          Status_Id: parseInt(link.Status_Id),
          Remarks: link.Remarks,
        })),
      };

      console.log('Saving visitor:', payload);

      // TODO: Replace with actual save API endpoint
      const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveVisitor';

      await axios.post(saveUrl, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      alert('Visitor saved successfully!');
      resetForm();

      // Refresh visitors table
      const res = await axios.get(
        'https://localhost:7291/api/BasicMaster/_GET_VISITOR/0/0',
        { headers: { Authorization: token } }
      ).catch(() => ({ data: [] }));
      setVisitors(Array.isArray(res.data) ? res.data : []);

      setSaving(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving visitor. Please try again.');
      setSaving(false);
    }
  };

  const handleEdit = (visitor) => {
    setFormData({
      Visitor_Id: visitor.visitor_Id || 0,
      Hostel_Id: visitor.hostel_Id || '',
      Visitor_Name: visitor.visitor_Name || '',
      Visitor_Code: visitor.visitor_Code || '',
      Visitor_Internal_Code: visitor.visitor_Internal_Code || '',
      Visitor_Visited_Date: visitor.visitor_Visited_Date ? dayjs(visitor.visitor_Visited_Date) : dayjs(),
      Visitor_Email_Id: visitor.visitor_Email_Id || '',
      Visitor_Mobile_No: visitor.visitor_Mobile_No || '',
      Visitor_Address: visitor.visitor_Address || '',
      Visitor_Pincode: visitor.visitor_Pincode || '',
      Visitor_State_Id: visitor.visitor_State_Id || '',
      Visitor_City_Id: visitor.visitor_City_Id || '',
      Visitor_Visit_For_Enum_Id: visitor.visitor_Visit_For_Enum_Id || '',
      Status_Id: visitor.status_Id || 1,
      Remarks: visitor.remarks || '',
      Action_Remarks: visitor.action_Remarks || '',
    });

    // TODO: Load documents and hostler links
    setActiveTab('visitor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter visitors
  const filteredVisitors = visitors.filter(visitor =>
    visitor.visitor_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.visitor_Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.visitor_Mobile_No?.includes(searchTerm)
  );

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
        <h1>Visitor Management</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Security</li>
            <li className="breadcrumb-item active">Visitor Master</li>
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
                  <i className="bi bi-person-badge me-2"></i>
                  {formData.Visitor_Id > 0 ? 'Edit' : 'Register New'} Visitor
                </h5>

                {/* Tabs */}
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'visitor' ? 'active' : ''}`}
                      onClick={() => setActiveTab('visitor')}
                      type="button"
                    >
                      <i className="bi bi-person me-1"></i>
                      Visitor Details
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                      onClick={() => setActiveTab('documents')}
                      type="button"
                    >
                      <i className="bi bi-file-earmark-text me-1"></i>
                      Documents ({documents.length})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'hostlers' ? 'active' : ''}`}
                      onClick={() => setActiveTab('hostlers')}
                      type="button"
                    >
                      <i className="bi bi-people me-1"></i>
                      Visiting Hostlers ({hostlerLinks.length})
                    </button>
                  </li>
                </ul>

                <form onSubmit={handleSubmit}>
                  <div className="tab-content pt-3">
                    {/* Visitor Details Tab */}
                    {activeTab === 'visitor' && (
                      <div className="tab-pane fade show active">
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
                            <label htmlFor="Visitor_Name" className="form-label fw-semibold">
                              Visitor Name *
                            </label>
                            <input
                              type="text"
                              id="Visitor_Name"
                              name="Visitor_Name"
                              className="form-control"
                              value={formData.Visitor_Name}
                              onChange={handleInputChange}
                              placeholder="Enter full name"
                              required
                            />
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Visitor_Code" className="form-label fw-semibold">
                              Visitor Code
                            </label>
                            <input
                              type="text"
                              id="Visitor_Code"
                              name="Visitor_Code"
                              className="form-control"
                              value={formData.Visitor_Code}
                              onChange={handleInputChange}
                              placeholder="Auto-generated or manual"
                            />
                          </div>

                          {/* Contact Information */}
                          <div className="col-12 mt-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-telephone me-2"></i>
                              Contact Information
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Visitor_Mobile_No" className="form-label fw-semibold">
                              Mobile Number *
                            </label>
                            <input
                              type="text"
                              id="Visitor_Mobile_No"
                              name="Visitor_Mobile_No"
                              className="form-control"
                              value={formData.Visitor_Mobile_No}
                              onChange={handleInputChange}
                              placeholder="Enter 10-digit mobile"
                              maxLength="32"
                              required
                            />
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Visitor_Email_Id" className="form-label fw-semibold">
                              Email ID
                            </label>
                            <input
                              type="email"
                              id="Visitor_Email_Id"
                              name="Visitor_Email_Id"
                              className="form-control"
                              value={formData.Visitor_Email_Id}
                              onChange={handleInputChange}
                              placeholder="visitor@example.com"
                            />
                          </div>

                          <div className="col-md-4">
                            <label className="form-label fw-semibold">
                              Visit Date & Time
                            </label>
                            <DateTimePicker
                              value={formData.Visitor_Visited_Date}
                              onChange={(newValue) => handleDateChange('Visitor_Visited_Date', newValue)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                },
                              }}
                            />
                          </div>

                          {/* Address Information */}
                          <div className="col-12 mt-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-geo-alt me-2"></i>
                              Address Information
                            </h6>
                          </div>

                          <div className="col-md-12">
                            <label htmlFor="Visitor_Address" className="form-label fw-semibold">
                              Address
                            </label>
                            <textarea
                              id="Visitor_Address"
                              name="Visitor_Address"
                              className="form-control"
                              rows="2"
                              value={formData.Visitor_Address}
                              onChange={handleInputChange}
                              placeholder="Enter full address"
                            ></textarea>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Visitor_State_Id" className="form-label fw-semibold">
                              State
                            </label>
                            <select
                              id="Visitor_State_Id"
                              name="Visitor_State_Id"
                              className="form-select"
                              value={formData.Visitor_State_Id}
                              onChange={handleInputChange}
                            >
                              <option value="">Select State</option>
                              {states.map(state => (
                                <option key={state.state_Id} value={state.state_Id}>
                                  {state.state_Name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Visitor_City_Id" className="form-label fw-semibold">
                              City
                            </label>
                            <select
                              id="Visitor_City_Id"
                              name="Visitor_City_Id"
                              className="form-select"
                              value={formData.Visitor_City_Id}
                              onChange={handleInputChange}
                              disabled={!formData.Visitor_State_Id}
                            >
                              <option value="">Select City</option>
                              {cities.map(city => (
                                <option key={city.city_Id} value={city.city_Id}>
                                  {city.city_Name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Visitor_Pincode" className="form-label fw-semibold">
                              Pincode
                            </label>
                            <input
                              type="text"
                              id="Visitor_Pincode"
                              name="Visitor_Pincode"
                              className="form-control"
                              value={formData.Visitor_Pincode}
                              onChange={handleInputChange}
                              placeholder="Enter pincode"
                              maxLength="16"
                            />
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Visitor_Visit_For_Enum_Id" className="form-label fw-semibold">
                              Visit Purpose
                            </label>
                            <select
                              id="Visitor_Visit_For_Enum_Id"
                              name="Visitor_Visit_For_Enum_Id"
                              className="form-select"
                              value={formData.Visitor_Visit_For_Enum_Id}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Purpose</option>
                              {visitPurposes.map(purpose => (
                                <option key={purpose.id} value={purpose.id}>
                                  {purpose.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Status & Remarks */}
                          <div className="col-12 mt-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-gear me-2"></i>
                              Status & Remarks
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

                          {/* Navigation Buttons */}
                          <div className="col-12 mt-4">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setActiveTab('documents')}
                            >
                              Next: Add Documents
                              <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                      <div className="tab-pane fade show active">
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="alert alert-info">
                              <i className="bi bi-info-circle me-2"></i>
                              Add identity documents for the visitor (Aadhar, Driving License, etc.)
                            </div>
                          </div>

                          {/* Document Entry Form */}
                          <div className="col-12">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-file-plus me-2"></i>
                              Add Document
                            </h6>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Document_Id" className="form-label fw-semibold">
                              Document Type *
                            </label>
                            <select
                              id="Document_Id"
                              name="Document_Id"
                              className="form-select"
                              value={currentDocument.Document_Id}
                              onChange={handleDocumentInputChange}
                            >
                              <option value="">Select Type</option>
                              {documentTypes.map(doc => (
                                <option key={doc.id} value={doc.id}>
                                  {doc.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Unique_No" className="form-label fw-semibold">
                              Document Number *
                            </label>
                            <input
                              type="text"
                              id="Unique_No"
                              name="Unique_No"
                              className="form-control"
                              value={currentDocument.Unique_No}
                              onChange={handleDocumentInputChange}
                              placeholder="e.g., XXXX-XXXX-XXXX"
                            />
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Name_As_Per_Document" className="form-label fw-semibold">
                              Name (As Per Document)
                            </label>
                            <input
                              type="text"
                              id="Name_As_Per_Document"
                              name="Name_As_Per_Document"
                              className="form-control"
                              value={currentDocument.Name_As_Per_Document}
                              onChange={handleDocumentInputChange}
                              placeholder="Full name on document"
                            />
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="document_file" className="form-label fw-semibold">
                              Upload Document
                            </label>
                            <input
                              type="file"
                              id="document_file"
                              className="form-control"
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-semibold">
                              Valid From
                            </label>
                            <DateTimePicker
                              value={currentDocument.Valid_From_Date}
                              onChange={(newValue) => handleDocumentDateChange('Valid_From_Date', newValue)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                },
                              }}
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-semibold">
                              Valid Upto
                            </label>
                            <DateTimePicker
                              value={currentDocument.Valid_Upto_Date}
                              onChange={(newValue) => handleDocumentDateChange('Valid_Upto_Date', newValue)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                },
                              }}
                            />
                          </div>

                          <div className="col-md-6">
                            <label htmlFor="Document_Detail" className="form-label fw-semibold">
                              Document Details
                            </label>
                            <textarea
                              id="Document_Detail"
                              name="Document_Detail"
                              className="form-control"
                              rows="2"
                              value={currentDocument.Document_Detail}
                              onChange={handleDocumentInputChange}
                              placeholder="Additional details..."
                            ></textarea>
                          </div>

                          <div className="col-12">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={handleAddDocument}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Add Document
                            </button>
                          </div>

                          {/* Documents List */}
                          {documents.length > 0 && (
                            <>
                              <div className="col-12 mt-4">
                                <h6 className="fw-bold text-primary border-bottom pb-2">
                                  <i className="bi bi-list-check me-2"></i>
                                  Added Documents ({documents.length})
                                </h6>
                              </div>

                              <div className="col-12">
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Document Type</th>
                                        <th>Number</th>
                                        <th>Name</th>
                                        <th>Valid From</th>
                                        <th>Valid Upto</th>
                                        <th>File</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {documents.map(doc => (
                                        <tr key={doc.tempId}>
                                          <td>
                                            {documentTypes.find(d => d.id === parseInt(doc.Document_Id))?.name || 'N/A'}
                                          </td>
                                          <td>{doc.Unique_No}</td>
                                          <td>{doc.Name_As_Per_Document || '-'}</td>
                                          <td>
                                            {doc.Valid_From_Date ? dayjs(doc.Valid_From_Date).format('DD/MM/YYYY') : '-'}
                                          </td>
                                          <td>
                                            {doc.Valid_Upto_Date ? dayjs(doc.Valid_Upto_Date).format('DD/MM/YYYY') : '-'}
                                          </td>
                                          <td>
                                            {doc.Document_Path && (
                                              <span className="badge bg-info">
                                                <i className="bi bi-file-earmark me-1"></i>
                                                {doc.Document_Path}
                                              </span>
                                            )}
                                          </td>
                                          <td>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleRemoveDocument(doc.tempId)}
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Navigation Buttons */}
                          <div className="col-12 mt-4">
                            <button
                              type="button"
                              className="btn btn-secondary me-2"
                              onClick={() => setActiveTab('visitor')}
                            >
                              <i className="bi bi-arrow-left me-2"></i>
                              Previous
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setActiveTab('hostlers')}
                            >
                              Next: Add Hostler Links
                              <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hostler Links Tab */}
                    {activeTab === 'hostlers' && (
                      <div className="tab-pane fade show active">
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="alert alert-warning">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              <strong>Important:</strong> Add at least one hostler that the visitor is coming to meet.
                            </div>
                          </div>

                          {/* Hostler Link Entry Form */}
                          <div className="col-12">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-person-plus me-2"></i>
                              Add Hostler Link
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
                              value={currentHostlerLink.Hostler_Id}
                              onChange={handleHostlerLinkInputChange}
                            >
                              <option value="">Select Hostler</option>
                              {hostlers.map(hostler => (
                                <option key={hostler.hostler_Id} value={hostler.hostler_Id}>
                                  {hostler.hostler_Name} ({hostler.hostler_Code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="Hostler_Visitor_Relation_Enum_Id" className="form-label fw-semibold">
                              Relation
                            </label>
                            <select
                              id="Hostler_Visitor_Relation_Enum_Id"
                              name="Hostler_Visitor_Relation_Enum_Id"
                              className="form-select"
                              value={currentHostlerLink.Hostler_Visitor_Relation_Enum_Id}
                              onChange={handleHostlerLinkInputChange}
                            >
                              <option value="">Select Relation</option>
                              {relationTypes.map(rel => (
                                <option key={rel.id} value={rel.id}>
                                  {rel.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold">
                              Verified?
                            </label>
                            <div className="form-check form-switch mt-2">
                              <input
                                type="checkbox"
                                id="Is_Verified_Visitor"
                                name="Is_Verified_Visitor"
                                className="form-check-input"
                                checked={currentHostlerLink.Is_Verified_Visitor}
                                onChange={handleHostlerLinkInputChange}
                              />
                              <label className="form-check-label" htmlFor="Is_Verified_Visitor">
                                {currentHostlerLink.Is_Verified_Visitor ? 'Yes' : 'No'}
                              </label>
                            </div>
                          </div>

                          <div className="col-md-3">
                            <label htmlFor="link_remarks" className="form-label fw-semibold">
                              Remarks
                            </label>
                            <input
                              type="text"
                              id="link_remarks"
                              name="Remarks"
                              className="form-control"
                              value={currentHostlerLink.Remarks}
                              onChange={handleHostlerLinkInputChange}
                              placeholder="Optional remarks"
                            />
                          </div>

                          <div className="col-12">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={handleAddHostlerLink}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Add Hostler Link
                            </button>
                          </div>

                          {/* Hostler Links List */}
                          {hostlerLinks.length > 0 && (
                            <>
                              <div className="col-12 mt-4">
                                <h6 className="fw-bold text-primary border-bottom pb-2">
                                  <i className="bi bi-list-check me-2"></i>
                                  Linked Hostlers ({hostlerLinks.length})
                                </h6>
                              </div>

                              <div className="col-12">
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Hostler</th>
                                        <th>Relation</th>
                                        <th>Verified</th>
                                        <th>Remarks</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {hostlerLinks.map(link => (
                                        <tr key={link.tempId}>
                                          <td>
                                            <strong>{link.hostlerName}</strong>
                                          </td>
                                          <td>
                                            {relationTypes.find(r => r.id === parseInt(link.Hostler_Visitor_Relation_Enum_Id))?.name || '-'}
                                          </td>
                                          <td>
                                            {link.Is_Verified_Visitor ? (
                                              <span className="badge bg-success">
                                                <i className="bi bi-check-circle me-1"></i>
                                                Verified
                                              </span>
                                            ) : (
                                              <span className="badge bg-warning text-dark">
                                                <i className="bi bi-clock me-1"></i>
                                                Pending
                                              </span>
                                            )}
                                          </td>
                                          <td>{link.Remarks || '-'}</td>
                                          <td>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleRemoveHostlerLink(link.tempId)}
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Navigation & Submit Buttons */}
                          <div className="col-12 mt-4">
                            <button
                              type="button"
                              className="btn btn-secondary me-2"
                              onClick={() => setActiveTab('documents')}
                            >
                              <i className="bi bi-arrow-left me-2"></i>
                              Previous
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary me-2"
                              disabled={saving || hostlerLinks.length === 0}
                            >
                              {saving ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-save me-2"></i>
                                  Save Visitor
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={resetForm}
                            >
                              <i className="bi bi-x-circle me-2"></i>
                              Reset All
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                  Visitor Records
                </h5>

                {/* Search */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, code, or mobile..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Sr No</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Hostel</th>
                        <th>Visit Date</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.length > 0 ? (
                        filteredVisitors.map((visitor, index) => (
                          <tr key={visitor.visitor_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{visitor.visitor_Name}</strong>
                              <br />
                              <small className="text-muted">{visitor.visitor_Code}</small>
                            </td>
                            <td>{visitor.visitor_Mobile_No}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {visitor.hostel_Name || 'N/A'}
                              </span>
                            </td>
                            <td>
                              {visitor.visitor_Visited_Date ? (
                                dayjs(visitor.visitor_Visited_Date).format('DD/MM/YYYY HH:mm')
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>{visitor.visit_Purpose_Name || '-'}</td>
                            <td>
                              {visitor.status_Id === 1 ? (
                                <span className="badge bg-success">Active</span>
                              ) : (
                                <span className="badge bg-secondary">Inactive</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(visitor)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {searchTerm
                                ? 'No visitors match your search'
                                : 'No visitors registered yet'}
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

export default VisitorMaster;

