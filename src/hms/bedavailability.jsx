import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/custom.css';

const BedAvailability = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [filters, setFilters] = useState({
    Hostel_Id: '',
    Block_Id: '',
    Room_Id: '',
    Bed_Status: '', // Available, Occupied, Vacant
  });

  const [bedAvailability, setBedAvailability] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Bed status options
  const bedStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Available', label: 'Available' },
    { value: 'Occupied', label: 'Occupied' },
    { value: 'Vacant', label: 'Vacant' },
    { value: 'Reserved', label: 'Reserved' },
  ];

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

  // Fetch blocks when hostel is selected
  useEffect(() => {
    const fetchBlocks = async () => {
      if (filters.Hostel_Id) {
        try {
          const token = getToken();
          if (!token) return;

          const url = `https://localhost:7291/api/BasicMaster/_GET_BLOCK_MASTER/0/${filters.Hostel_Id}/1`;
          const res = await axios.get(url, {
            headers: {
              Authorization: token,
              Accept: 'application/json',
            },
          }).catch(() => ({ data: [] }));

          setBlocks(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error('Error fetching blocks:', error);
          setBlocks([]);
        }
      } else {
        setBlocks([]);
        setRooms([]);
      }
    };

    fetchBlocks();
  }, [filters.Hostel_Id, getToken]);

  // Fetch rooms when block is selected
  useEffect(() => {
    const fetchRooms = async () => {
      if (filters.Block_Id) {
        try {
          const token = getToken();
          if (!token) return;

          const url = `https://localhost:7291/api/BasicMaster/_GET_ROOM_MASTER/0/${filters.Block_Id}/1`;
          const res = await axios.get(url, {
            headers: {
              Authorization: token,
              Accept: 'application/json',
            },
          }).catch(() => ({ data: [] }));

          setRooms(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error('Error fetching rooms:', error);
          setRooms([]);
        }
      } else {
        setRooms([]);
      }
    };

    fetchRooms();
  }, [filters.Block_Id, getToken]);

  // Fetch bed availability
  const fetchBedAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // TODO: Replace with actual API endpoint when available
      // const url = `https://localhost:7291/api/BasicMaster/_GET_BED_AVAILABILITY/${Hostel_Id}/${Block_Id}/${Room_Id}/${Bed_Status}`;
      // const res = await axios.get(url, {
      //   headers: {
      //     Authorization: token,
      //     Accept: 'application/json',
      //   },
      // });
      // setBedAvailability(Array.isArray(res.data) ? res.data : []);

      // Temporary dummy data
      const dummyBeds = [
        {
          bed_Id: 1,
          hostel_Id: 1,
          hostel_Name: 'Boys Hostel A',
          block_Id: 1,
          block_Name: 'Block A',
          room_Id: 1,
          room_No: '101',
          bed_No: 'B1',
          bed_Status: 'Available',
          hostler_Id: null,
          hostler_Name: null,
          allotment_Date: null,
        },
        {
          bed_Id: 2,
          hostel_Id: 1,
          hostel_Name: 'Boys Hostel A',
          block_Id: 1,
          block_Name: 'Block A',
          room_Id: 1,
          room_No: '101',
          bed_No: 'B2',
          bed_Status: 'Occupied',
          hostler_Id: 1,
          hostler_Name: 'John Doe',
          allotment_Date: '2024-01-15',
        },
        {
          bed_Id: 3,
          hostel_Id: 1,
          hostel_Name: 'Boys Hostel A',
          block_Id: 1,
          block_Name: 'Block A',
          room_Id: 1,
          room_No: '101',
          bed_No: 'B3',
          bed_Status: 'Vacant',
          hostler_Id: null,
          hostler_Name: null,
          allotment_Date: null,
        },
        {
          bed_Id: 4,
          hostel_Id: 1,
          hostel_Name: 'Boys Hostel A',
          block_Id: 1,
          block_Name: 'Block A',
          room_Id: 2,
          room_No: '102',
          bed_No: 'B1',
          bed_Status: 'Reserved',
          hostler_Id: 2,
          hostler_Name: 'Jane Smith',
          allotment_Date: '2024-01-20',
        },
      ];
      setBedAvailability(dummyBeds);
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchBedAvailability();
  }, [fetchBedAvailability]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent filters
      ...(name === 'Hostel_Id' && { Block_Id: '', Room_Id: '' }),
      ...(name === 'Block_Id' && { Room_Id: '' }),
    }));
  };

  const handleSearch = () => {
    fetchBedAvailability();
  };

  const handleReset = () => {
    setFilters({
      Hostel_Id: '',
      Block_Id: '',
      Room_Id: '',
      Bed_Status: '',
    });
    setSearchTerm('');
    fetchBedAvailability();
  };

  // Filter bed availability based on filters and search term
  const filteredBeds = bedAvailability.filter((bed) => {
    const matchesHostel = !filters.Hostel_Id || bed.hostel_Id === parseInt(filters.Hostel_Id);
    const matchesBlock = !filters.Block_Id || bed.block_Id === parseInt(filters.Block_Id);
    const matchesRoom = !filters.Room_Id || bed.room_Id === parseInt(filters.Room_Id);
    const matchesStatus = !filters.Bed_Status || bed.bed_Status === filters.Bed_Status;
    const matchesSearch =
      !searchTerm ||
      bed.hostel_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.block_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.room_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.bed_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.hostler_Name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesHostel && matchesBlock && matchesRoom && matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const calculateStats = () => {
    const total = filteredBeds.length;
    const available = filteredBeds.filter((b) => b.bed_Status === 'Available').length;
    const occupied = filteredBeds.filter((b) => b.bed_Status === 'Occupied').length;
    const vacant = filteredBeds.filter((b) => b.bed_Status === 'Vacant').length;
    const reserved = filteredBeds.filter((b) => b.bed_Status === 'Reserved').length;
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

    return { total, available, occupied, vacant, reserved, occupancyRate };
  };

  const stats = calculateStats();

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-success';
      case 'Occupied':
        return 'bg-danger';
      case 'Vacant':
        return 'bg-warning';
      case 'Reserved':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Bed Availability</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Reports</li>
            <li className="breadcrumb-item active">Bed Availability</li>
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
                    <h5 className="card-title">Total Beds</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary">
                        <i className="bi bi-grid-3x3-gap"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.total}</h6>
                        <span className="text-muted small pt-1">Total Count</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Available</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success">
                        <i className="bi bi-check-circle"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.available}</h6>
                        <span className="text-success small pt-1">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Occupied</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-danger">
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.occupied}</h6>
                        <span className="text-danger small pt-1">In Use</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Occupancy Rate</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-info">
                        <i className="bi bi-percent"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.occupancyRate}%</h6>
                        <span className="text-info small pt-1">Utilization</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Vacant</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-warning">
                        <i className="bi bi-circle"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.vacant}</h6>
                        <span className="text-warning small pt-1">Empty</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Reserved</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-info">
                        <i className="bi bi-bookmark-fill"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.reserved}</h6>
                        <span className="text-info small pt-1">Booked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-funnel me-2"></i>Filters
                </h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label htmlFor="Hostel_Id" className="form-label">Hostel</label>
                    <select
                      className="form-select"
                      id="Hostel_Id"
                      name="Hostel_Id"
                      value={filters.Hostel_Id}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Hostels</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.hostel_Id} value={hostel.hostel_Id}>
                          {hostel.hostel_Name} ({hostel.hostel_Code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="Block_Id" className="form-label">Block</label>
                    <select
                      className="form-select"
                      id="Block_Id"
                      name="Block_Id"
                      value={filters.Block_Id}
                      onChange={handleFilterChange}
                      disabled={!filters.Hostel_Id}
                    >
                      <option value="">All Blocks</option>
                      {blocks.map((block) => (
                        <option key={block.block_Id} value={block.block_Id}>
                          {block.block_Name} ({block.block_Code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="Room_Id" className="form-label">Room</label>
                    <select
                      className="form-select"
                      id="Room_Id"
                      name="Room_Id"
                      value={filters.Room_Id}
                      onChange={handleFilterChange}
                      disabled={!filters.Block_Id}
                    >
                      <option value="">All Rooms</option>
                      {rooms.map((room) => (
                        <option key={room.room_Id} value={room.room_Id}>
                          {room.room_No} ({room.room_Internal_Code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="Bed_Status" className="form-label">Bed Status</label>
                    <select
                      className="form-select"
                      id="Bed_Status"
                      name="Bed_Status"
                      value={filters.Bed_Status}
                      onChange={handleFilterChange}
                    >
                      {bedStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSearch}
                    >
                      <i className="bi bi-search me-1"></i>Search
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleReset}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bed Availability List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-list-ul me-2"></i>Bed Availability List
                  </h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Hostel, Block, Room, Bed or Hostler"
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
                          <th scope="col">Block</th>
                          <th scope="col">Room No</th>
                          <th scope="col">Bed No</th>
                          <th scope="col">Status</th>
                          <th scope="col">Hostler Name</th>
                          <th scope="col">Allotment Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBeds.length > 0 ? (
                          filteredBeds.map((bed, index) => (
                            <tr key={bed.bed_Id}>
                              <td>{index + 1}</td>
                              <td>{bed.hostel_Name || 'N/A'}</td>
                              <td>{bed.block_Name || 'N/A'}</td>
                              <td>
                                <strong>{bed.room_No || 'N/A'}</strong>
                              </td>
                              <td>
                                <strong className="text-primary">{bed.bed_No || 'N/A'}</strong>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(bed.bed_Status)}`}>
                                  {bed.bed_Status || 'N/A'}
                                </span>
                              </td>
                              <td>
                                {bed.hostler_Name ? (
                                  <span className="text-success">
                                    <i className="bi bi-person-fill me-1"></i>
                                    {bed.hostler_Name}
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                {bed.allotment_Date ? (
                                  <small>{new Date(bed.allotment_Date).toLocaleDateString('en-IN')}</small>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              <div className="py-4">
                                <i className="bi bi-inbox fs-1 text-muted"></i>
                                <p className="text-muted mt-2">No beds found.</p>
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

export default BedAvailability;

