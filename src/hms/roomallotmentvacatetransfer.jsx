import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import '../style/custom.css';

const RoomAllotmentVacateTransfer = () => {
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
    Room_Allotment_Vacate_Transfer_Id: 0,
    Hostel_Id: '',
    Hostler_Id: '',
    Room_Id: '',
    Room_Bed_Id: '',
    Hostel_Fee_Room_Linking_Id: '',
    Join_Date_Time: dayjs(),
    End_Date_Time: null,
    Vacated_Date_Time: null,
    Transfer_Date_Time: null,
    Food_Type_Enum_Id: '',
    TermAndCondition_Id: '',
    Fee_Discount: 0,
    Status_Id: 1,
    Remarks: '',
    Action_Remarks: '',
  });

  // Dropdown data
  const [hostels, setHostels] = useState([]);
  const [hostlers, setHostlers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [allotments, setAllotments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('allotment'); // allotment, vacate, transfer
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAllotment, setSelectedAllotment] = useState(null);

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

        // Fetch terms and conditions
        // Parameters: TermAndCondition_Id, Hostel_Id, Status_Id
        const termsRes = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_TERMSANDCONDITION/0/0/1',
          { headers: { Authorization: token } }
        ).catch(err => {
          console.error('Fetch terms and conditions failed:', err);
          return { data: [] };
        });
        setTermsConditions(Array.isArray(termsRes.data) ? termsRes.data : []);

        // Fetch food types enum
        const foodTypesRes = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: "Food_Type",
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
          console.error('Fetch food types failed:', err);
          return { data: [] };
        });
        setFoodTypes(Array.isArray(foodTypesRes.data) ? foodTypesRes.data : []);

        setLoading(false);
      } catch (err) {
        console.error('Fetch initial data failed:', err);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [getToken]);

  // Fetch hostlers when hostel changes
  useEffect(() => {
    const fetchHostlers = async () => {
      if (!formData.Hostel_Id) {
        setHostlers([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(
          `https://localhost:7291/api/BasicMaster/_GET_HOSTLER/0/1`,
          { headers: { Authorization: token } }
        );

        const allHostlers = Array.isArray(res.data) ? res.data : [];
        // Filter by hostel if needed
        const filtered = allHostlers.filter(h => h.hostel_Id === parseInt(formData.Hostel_Id));
        setHostlers(filtered.length > 0 ? filtered : allHostlers);
      } catch (err) {
        console.error('Fetch hostlers failed:', err);
      }
    };

    fetchHostlers();
  }, [formData.Hostel_Id, getToken]);

  // Fetch rooms when hostel changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!formData.Hostel_Id) {
        setRooms([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(
          `https://localhost:7291/api/BasicMaster/_GET_ROOM_MASTER/0/${formData.Hostel_Id}/0/1`,
          { headers: { Authorization: token } }
        );

        setRooms(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch rooms failed:', err);
      }
    };

    fetchRooms();
  }, [formData.Hostel_Id, getToken]);

  // Fetch beds when room changes
  useEffect(() => {
    const fetchBeds = async () => {
      if (!formData.Room_Id) {
        setBeds([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        // TODO: Replace with actual bed API endpoint
        const res = await axios.get(
          `https://localhost:7291/api/BasicMaster/_GET_ROOM_BED/${formData.Room_Id}/1`,
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setBeds(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch beds failed:', err);
      }
    };

    fetchBeds();
  }, [formData.Room_Id, getToken]);

  // Fetch fee structures when hostel and room change
  useEffect(() => {
    const fetchFeeStructures = async () => {
      if (!formData.Hostel_Id || !formData.Room_Id) {
        setFeeStructures([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        // TODO: Replace with actual fee structure API endpoint
        const res = await axios.get(
          `https://localhost:7291/api/BasicMaster/_GET_HOSTEL_FEE_ROOM_LINKING/0/${formData.Hostel_Id}/${formData.Room_Id}/1`,
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setFeeStructures(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch fee structures failed:', err);
      }
    };

    fetchFeeStructures();
  }, [formData.Hostel_Id, formData.Room_Id, getToken]);

  // Fetch allotments for table
  useEffect(() => {
    const fetchAllotments = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // TODO: Replace with actual allotment API endpoint
        const res = await axios.get(
          'https://localhost:7291/api/BasicMaster/_GET_ROOM_ALLOTMENT_VACATE_TRANSFER/0/0',
          { headers: { Authorization: token } }
        ).catch(() => ({ data: [] }));

        setAllotments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch allotments failed:', err);
      }
    };

    fetchAllotments();
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

  const resetForm = () => {
    setFormData({
      Room_Allotment_Vacate_Transfer_Id: 0,
      Hostel_Id: '',
      Hostler_Id: '',
      Room_Id: '',
      Room_Bed_Id: '',
      Hostel_Fee_Room_Linking_Id: '',
      Join_Date_Time: dayjs(),
      End_Date_Time: null,
      Vacated_Date_Time: null,
      Transfer_Date_Time: null,
      Food_Type_Enum_Id: '',
      TermAndCondition_Id: '',
      Fee_Discount: 0,
      Status_Id: 1,
      Remarks: '',
      Action_Remarks: '',
    });
    setSelectedAllotment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.Hostel_Id || !formData.Hostler_Id || !formData.Room_Id) {
      alert('Please fill in all required fields (Hostel, Hostler, Room)');
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      if (!token) return;

      const payload = {
        Room_Allotment_Vacate_Transfer_Id: formData.Room_Allotment_Vacate_Transfer_Id,
        Hostel_Id: parseInt(formData.Hostel_Id),
        Hostler_Id: parseInt(formData.Hostler_Id),
        Room_Id: parseInt(formData.Room_Id),
        Room_Bed_Id: formData.Room_Bed_Id ? parseInt(formData.Room_Bed_Id) : null,
        Hostel_Fee_Room_Linking_Id: formData.Hostel_Fee_Room_Linking_Id ? parseInt(formData.Hostel_Fee_Room_Linking_Id) : 0,
        Join_Date_Time: formData.Join_Date_Time ? formData.Join_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        End_Date_Time: formData.End_Date_Time ? formData.End_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        Vacated_Date_Time: formData.Vacated_Date_Time ? formData.Vacated_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        Transfer_Date_Time: formData.Transfer_Date_Time ? formData.Transfer_Date_Time.format('YYYY-MM-DDTHH:mm:ss') : null,
        Food_Type_Enum_Id: formData.Food_Type_Enum_Id ? parseInt(formData.Food_Type_Enum_Id) : null,
        TermAndCondition_Id: formData.TermAndCondition_Id ? parseInt(formData.TermAndCondition_Id) : null,
        Fee_Discount: parseFloat(formData.Fee_Discount) || 0,
        Status_Id: parseInt(formData.Status_Id),
        Remarks: formData.Remarks,
        Action_Remarks: formData.Action_Remarks,
        CreatedBy_Login_User_Id: 1, // TODO: Get from logged-in user
        CreatedBy_Login_Session_Id: 1,
        CreatedFrom_Screen: 'RoomAllotmentVacateTransfer',
        CreatedFrom_Menu_Code: 'ROOM_ALLOT_VACATE_TRANSFER',
      };

      console.log('Saving room allotment:', payload);

      // TODO: Replace with actual save API endpoint
      const saveUrl = 'https://localhost:7291/api/BasicMaster/SaveRoomAllotmentVacateTransfer';

      await axios.post(saveUrl, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      alert('Room allotment saved successfully!');
      resetForm();
      // Refresh allotments table
      const res = await axios.get(
        'https://localhost:7291/api/BasicMaster/_GET_ROOM_ALLOTMENT_VACATE_TRANSFER/0/0',
        { headers: { Authorization: token } }
      ).catch(() => ({ data: [] }));
      setAllotments(Array.isArray(res.data) ? res.data : []);
      setSaving(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving room allotment. Please try again.');
      setSaving(false);
    }
  };

  const handleVacate = async (allotmentId) => {
    if (!window.confirm('Are you sure you want to vacate this room?')) return;

    try {
      const token = getToken();
      if (!token) return;

      const vacatedDateTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');

      // TODO: Replace with actual vacate API endpoint
      const payload = {
        Room_Allotment_Vacate_Transfer_Id: allotmentId,
        Vacated_Date_Time: vacatedDateTime,
        Status_Id: 2, // Vacated status
        Action_Remarks: 'Room vacated',
      };

      await axios.post(
        'https://localhost:7291/api/BasicMaster/VacateRoom',
        payload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Room vacated successfully!');
      // Refresh allotments
      const res = await axios.get(
        'https://localhost:7291/api/BasicMaster/_GET_ROOM_ALLOTMENT_VACATE_TRANSFER/0/0',
        { headers: { Authorization: token } }
      ).catch(() => ({ data: [] }));
      setAllotments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Vacate failed:', error);
      alert('Error vacating room. Please try again.');
    }
  };

  const handleTransfer = (allotment) => {
    setSelectedAllotment(allotment);
    setActiveTab('transfer');
    setFormData({
      ...formData,
      Room_Allotment_Vacate_Transfer_Id: allotment.room_Allotment_Vacate_Transfer_Id,
      Hostel_Id: allotment.hostel_Id,
      Hostler_Id: allotment.hostler_Id,
      Transfer_Date_Time: dayjs(),
    });
  };

  const handleEdit = (allotment) => {
    setSelectedAllotment(allotment);
    setFormData({
      Room_Allotment_Vacate_Transfer_Id: allotment.room_Allotment_Vacate_Transfer_Id || 0,
      Hostel_Id: allotment.hostel_Id || '',
      Hostler_Id: allotment.hostler_Id || '',
      Room_Id: allotment.room_Id || '',
      Room_Bed_Id: allotment.room_Bed_Id || '',
      Hostel_Fee_Room_Linking_Id: allotment.hostel_Fee_Room_Linking_Id || '',
      Join_Date_Time: allotment.join_Date_Time ? dayjs(allotment.join_Date_Time) : dayjs(),
      End_Date_Time: allotment.end_Date_Time ? dayjs(allotment.end_Date_Time) : null,
      Vacated_Date_Time: allotment.vacated_Date_Time ? dayjs(allotment.vacated_Date_Time) : null,
      Transfer_Date_Time: allotment.transfer_Date_Time ? dayjs(allotment.transfer_Date_Time) : null,
      Food_Type_Enum_Id: allotment.food_Type_Enum_Id || '',
      TermAndCondition_Id: allotment.termAndCondition_Id || '',
      Fee_Discount: allotment.fee_Discount || 0,
      Status_Id: allotment.status_Id || 1,
      Remarks: allotment.remarks || '',
      Action_Remarks: allotment.action_Remarks || '',
    });
    setActiveTab('allotment');
  };

  // Filter allotments based on search
  const filteredAllotments = allotments.filter(allotment =>
    allotment.hostler_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allotment.hostel_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allotment.room_Name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1>Room Allotment / Vacate / Transfer</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Room Management</li>
            <li className="breadcrumb-item active">Allotment / Vacate / Transfer</li>
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
                  <i className="bi bi-door-open me-2"></i>
                  Room Operations
                </h5>

                {/* Tabs */}
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'allotment' ? 'active' : ''}`}
                      onClick={() => setActiveTab('allotment')}
                      type="button"
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Room Allotment
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'vacate' ? 'active' : ''}`}
                      onClick={() => setActiveTab('vacate')}
                      type="button"
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Vacate Room
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'transfer' ? 'active' : ''}`}
                      onClick={() => setActiveTab('transfer')}
                      type="button"
                    >
                      <i className="bi bi-arrow-left-right me-1"></i>
                      Transfer Room
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content pt-3">
                  {/* Allotment Tab */}
                  {activeTab === 'allotment' && (
                    <div className="tab-pane fade show active">
                      <form onSubmit={handleSubmit}>
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
                              disabled={!formData.Hostel_Id}
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
                            <label htmlFor="Room_Id" className="form-label fw-semibold">
                              Room *
                            </label>
                            <select
                              id="Room_Id"
                              name="Room_Id"
                              className="form-select"
                              value={formData.Room_Id}
                              onChange={handleInputChange}
                              required
                              disabled={!formData.Hostel_Id}
                            >
                              <option value="">Select Room</option>
                              {rooms.map(room => (
                                <option key={room.room_Id} value={room.room_Id}>
                                  {room.room_Name} (Floor: {room.room_Floor}, Capacity: {room.room_Total_Seat})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Room_Bed_Id" className="form-label fw-semibold">
                              Bed Number
                            </label>
                            <select
                              id="Room_Bed_Id"
                              name="Room_Bed_Id"
                              className="form-select"
                              value={formData.Room_Bed_Id}
                              onChange={handleInputChange}
                              disabled={!formData.Room_Id}
                            >
                              <option value="">Select Bed (Optional)</option>
                              {beds.map(bed => (
                                <option key={bed.bed_Id} value={bed.bed_Id}>
                                  Bed {bed.bed_Number} - {bed.bed_Status}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Food_Type_Enum_Id" className="form-label fw-semibold">
                              Food Type
                            </label>
                            <select
                              id="Food_Type_Enum_Id"
                              name="Food_Type_Enum_Id"
                              className="form-select"
                              value={formData.Food_Type_Enum_Id}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Food Type</option>
                              {foodTypes.map(food => (
                                <option key={food.id} value={food.id}>
                                  {food.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="TermAndCondition_Id" className="form-label fw-semibold">
                              Terms & Conditions
                            </label>
                            <select
                              id="TermAndCondition_Id"
                              name="TermAndCondition_Id"
                              className="form-select"
                              value={formData.TermAndCondition_Id}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Terms</option>
                              {termsConditions.map(term => (
                                <option key={term.termAndCondition_Id} value={term.termAndCondition_Id}>
                                  {term.termAndCondition_Name}
                                </option>
                              ))}
                            </select>
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
                              Join Date Time *
                            </label>
                            <DateTimePicker
                              value={formData.Join_Date_Time}
                              onChange={(newValue) => handleDateChange('Join_Date_Time', newValue)}
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
                              End Date Time
                            </label>
                            <DateTimePicker
                              value={formData.End_Date_Time}
                              onChange={(newValue) => handleDateChange('End_Date_Time', newValue)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                },
                              }}
                            />
                          </div>

                          {/* Fee Information */}
                          <div className="col-12 mt-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-currency-rupee me-2"></i>
                              Fee Information
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Hostel_Fee_Room_Linking_Id" className="form-label fw-semibold">
                              Fee Structure
                            </label>
                            <select
                              id="Hostel_Fee_Room_Linking_Id"
                              name="Hostel_Fee_Room_Linking_Id"
                              className="form-select"
                              value={formData.Hostel_Fee_Room_Linking_Id}
                              onChange={handleInputChange}
                              disabled={!formData.Hostel_Id || !formData.Room_Id}
                            >
                              <option value="">Select Fee Structure</option>
                              {feeStructures.map(fee => (
                                <option key={fee.hostel_Fee_Room_Linking_Id} value={fee.hostel_Fee_Room_Linking_Id}>
                                  {fee.fee_Name} - ₹{fee.fee_Amount}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <label htmlFor="Fee_Discount" className="form-label fw-semibold">
                              Fee Discount (₹)
                            </label>
                            <input
                              type="number"
                              id="Fee_Discount"
                              name="Fee_Discount"
                              className="form-control"
                              value={formData.Fee_Discount}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                            />
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
                              <option value="2">Vacated</option>
                              <option value="3">Transferred</option>
                              <option value="0">Inactive</option>
                            </select>
                          </div>

                          {/* Remarks */}
                          <div className="col-12 mt-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2">
                              <i className="bi bi-chat-text me-2"></i>
                              Additional Information
                            </h6>
                          </div>

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
                                  {formData.Room_Allotment_Vacate_Transfer_Id > 0 ? 'Update' : 'Allot Room'}
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
                  )}

                  {/* Vacate Tab */}
                  {activeTab === 'vacate' && (
                    <div className="tab-pane fade show active">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Select a room allotment from the table below to vacate it.
                      </div>
                    </div>
                  )}

                  {/* Transfer Tab */}
                  {activeTab === 'transfer' && (
                    <div className="tab-pane fade show active">
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Select a room allotment from the table below, then choose a new room to transfer.
                      </div>

                      {selectedAllotment && (
                        <form onSubmit={handleSubmit}>
                          <div className="row g-3">
                            <div className="col-12">
                              <div className="card bg-light">
                                <div className="card-body">
                                  <h6 className="fw-bold">Current Allotment</h6>
                                  <p className="mb-1">
                                    <strong>Hostler:</strong> {selectedAllotment.hostler_Name}
                                  </p>
                                  <p className="mb-1">
                                    <strong>Current Room:</strong> {selectedAllotment.room_Name}
                                  </p>
                                  <p className="mb-0">
                                    <strong>Current Hostel:</strong> {selectedAllotment.hostel_Name}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-4">
                              <label htmlFor="transfer_room" className="form-label fw-semibold">
                                New Room *
                              </label>
                              <select
                                id="transfer_room"
                                name="Room_Id"
                                className="form-select"
                                value={formData.Room_Id}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Select New Room</option>
                                {rooms.map(room => (
                                  <option key={room.room_Id} value={room.room_Id}>
                                    {room.room_Name} (Floor: {room.room_Floor}, Capacity: {room.room_Total_Seat})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-md-4">
                              <label className="form-label fw-semibold">
                                Transfer Date Time *
                              </label>
                              <DateTimePicker
                                value={formData.Transfer_Date_Time}
                                onChange={(newValue) => handleDateChange('Transfer_Date_Time', newValue)}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: 'small',
                                  },
                                }}
                              />
                            </div>

                            <div className="col-md-12">
                              <label htmlFor="transfer_remarks" className="form-label fw-semibold">
                                Transfer Reason
                              </label>
                              <textarea
                                id="transfer_remarks"
                                name="Action_Remarks"
                                className="form-control"
                                rows="2"
                                value={formData.Action_Remarks}
                                onChange={handleInputChange}
                                placeholder="Enter reason for transfer..."
                              ></textarea>
                            </div>

                            <div className="col-12">
                              <button
                                type="submit"
                                className="btn btn-warning me-2"
                                disabled={saving}
                              >
                                {saving ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-arrow-left-right me-2"></i>
                                    Transfer Room
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                  setSelectedAllotment(null);
                                  resetForm();
                                }}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
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
                  Room Allotment Records
                </h5>

                {/* Search */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by hostler, hostel, or room..."
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
                        <th>Hostler</th>
                        <th>Hostel</th>
                        <th>Room</th>
                        <th>Bed</th>
                        <th>Join Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllotments.length > 0 ? (
                        filteredAllotments.map((allotment, index) => (
                          <tr key={allotment.room_Allotment_Vacate_Transfer_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{allotment.hostler_Name}</strong>
                              <br />
                              <small className="text-muted">{allotment.hostler_Code}</small>
                            </td>
                            <td>{allotment.hostel_Name}</td>
                            <td>{allotment.room_Name}</td>
                            <td>
                              {allotment.room_Bed_Number ? (
                                <span className="badge bg-info">Bed {allotment.room_Bed_Number}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {allotment.join_Date_Time ? (
                                dayjs(allotment.join_Date_Time).format('DD/MM/YYYY HH:mm')
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              {allotment.end_Date_Time ? (
                                dayjs(allotment.end_Date_Time).format('DD/MM/YYYY HH:mm')
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              {allotment.status_Id === 1 ? (
                                <span className="badge bg-success">Active</span>
                              ) : allotment.status_Id === 2 ? (
                                <span className="badge bg-secondary">Vacated</span>
                              ) : allotment.status_Id === 3 ? (
                                <span className="badge bg-warning">Transferred</span>
                              ) : (
                                <span className="badge bg-danger">Inactive</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleEdit(allotment)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {allotment.status_Id === 1 && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-danger me-1"
                                    onClick={() => handleVacate(allotment.room_Allotment_Vacate_Transfer_Id)}
                                    title="Vacate"
                                  >
                                    <i className="bi bi-box-arrow-right"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => handleTransfer(allotment)}
                                    title="Transfer"
                                  >
                                    <i className="bi bi-arrow-left-right"></i>
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {searchTerm ? 'No records match your search' : 'No room allotments found'}
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

export default RoomAllotmentVacateTransfer;

