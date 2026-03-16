import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StateForm = () => {
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

  const [stateData, setStateData] = useState({
    State_Id: 0,
    code: '',
    name: '',
    Remarks: '',
  });
  const [States, setStates] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized fetchState function
  const fetchState = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const State_Id = 0;
      const Status_Id = 0;
      const url = `https://localhost:7291/api/BasicMaster/GetState/${State_Id}/${Status_Id}`;
      const res = await axios.get(url, {
        headers: {
          Authorization: token,
          Accept: 'application/json',
        },
      });
      setStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Fetch failed:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { replace: true });
      }
    }
  }, [getToken, navigate]);

  useEffect(() => {
    fetchState();
  }, [fetchState, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStateData((prev) => ({
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
        State_Id: stateData.State_Id,
        State_Name: stateData.name,
        State_Code: stateData.code,
        Status_Id: 1,
        Remarks: stateData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'StateForm',
        CreatedFrom_Menu_Code: 'STATE_MGMT',
      };

      const response = await fetch('https://localhost:7291/api/BasicMaster/SaveState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.Message || 'Failed to save');
      }

      alert('Saved Successfully');
      setStateData({ State_Id: 0, code: '', name: '', Remarks: '' });
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

  const handleEdit = (state) => {
    setStateData({
      State_Id: state.state_Id,
      code: state.state_Code,
      name: state.state_Name,
      Remarks: state.remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setStateData({ State_Id: 0, code: '', name: '', Remarks: '' });
    setIsEditing(false);
  };

  const filteredStates = States.filter((state) => {
    const name = state.state_Name ?? '';
    const code = state.state_Code ?? '';
    const search = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      code.toLowerCase().includes(search)
    );
  });

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>State Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">State Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit State' : 'Add New State'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="name" className="form-label">State Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={stateData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="code" className="form-label">State Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={stateData.code}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Remarks" className="form-label">Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        value={stateData.Remarks}
                        onChange={handleChange}
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

            {/* State List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">State List</h5>
                  <div className="search-bar" style={{ minWidth: '300px' }}>
                    <form className="search-form d-flex align-items-center">
                      <input
                        type="text"
                        name="query"
                        placeholder="Search by Name or Code"
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

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Sr. No</th>
                        <th scope="col">State Name</th>
                        <th scope="col">State Code</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStates.length > 0 ? (
                        filteredStates.map((state) => (
                          <tr key={state.state_Id}>
                            <td>{state.state_Id}</td>
                            <td>{state.state_Name}</td>
                            <td>{state.state_Code}</td>
                            <td>
                              <span className={`badge ${state.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {state.status_Id === 1 ? 'Active' : state.status_Id === 2 ? 'Inactive' : 'Unknown'}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(state)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No Record found.
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

export default StateForm;
