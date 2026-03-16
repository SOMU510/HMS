import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusDropdown from './statusdropdown';
import '../style/custom.css';

export default function CityForm() {
  const [formData, setFormData] = useState({
    roleName: '',
    code: '',
    remark: '',
    status: '',
    EnumTypeId: '',
  });

  const [city, setCity] = useState([]);
  const [refresh] = useState(false);

  useEffect(() => {
    const fetchCity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - please login');
        return;
      }
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      try {
        const City_Id = 0;
        const State_Id = 0;
        const Status_Id = 1;
        const apiUrl = `https://localhost:7291/api/BasicMaster/_GET_CITY/${City_Id}/${State_Id}/${Status_Id}`;

        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
          },
        });
        setCity(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Fetch failed:', error, 'error.response:', error.response);
      }
    };

    fetchCity();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>City Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">City Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Add New City</h5>

                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="roleName" className="form-label">City Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="roleName"
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="code" className="form-label">City Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="status" className="form-label">Status</label>
                      <StatusDropdown
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="remark" className="form-label">Remark</label>
                      <input
                        type="text"
                        className="form-control"
                        id="remark"
                        name="remark"
                        value={formData.remark}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle me-1"></i>
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* City List Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">City List</h5>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Sr. No</th>
                        <th scope="col">City Name</th>
                        <th scope="col">City Code</th>
                        <th scope="col">State</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {city.length > 0 ? (
                        city.map((cityItem) => (
                          <tr key={cityItem.city_Id}>
                            <td>{cityItem.city_Id}</td>
                            <td>{cityItem.city_Name}</td>
                            <td>{cityItem.city_Code}</td>
                            <td>{cityItem.state_Name}</td>
                            <td>
                              <span className={`badge ${cityItem.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {cityItem.status_Id === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <button className="btn btn-sm btn-primary" title="Edit">
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
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
}
