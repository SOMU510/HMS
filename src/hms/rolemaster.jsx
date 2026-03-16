import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusDropdown from './statusdropdown';
import '../style/custom.css';
import EnumDropdown from './enum';

const RoleForm = () => {
  const [formData, setFormData] = useState({
    roleName: '',
    code: '',
    remark: '',
    status: '',
    EnumTypeId: '',
  });

  const [roles, setRoles] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - please login');
        return;
      }

      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      try {
        const res = await axios.get(
          'https://localhost:7291/api/BasicMaster/GetRole',
          {
            headers: {
              Authorization: authHeader,
              Accept: 'application/json',
            },
          }
        );
        setRoles(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Fetch failed:', error, 'error.response:', error.response);
      }
    };

    fetchRoles();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token - cannot submit');
      return;
    }
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const payload = {
      roleName: formData.roleName,
      roleCode: formData.code,
      remarks: formData.remark,
      status: formData.status,
    };

    try {
      console.log('Submitting role payload:', payload);
      const res = await axios.post(
        'https://localhost:7291/api/BasicMaster/AddRole',
        payload,
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Submit response:', res.status, res.data);
      setFormData({ roleName: '', code: '', remark: '', status: '' });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Submit failed:', error, error.response);
    }
  };

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Role Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Role Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Add New Role</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="roleName" className="form-label">Role Name</label>
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
                      <label htmlFor="code" className="form-label">Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-12">
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

                    <div className="col-md-6">
                      <label htmlFor="status" className="form-label">Status</label>
                      <StatusDropdown
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="EnumTypeId" className="form-label">Enum Type</label>
                      <EnumDropdown
                        name="EnumTypeId"
                        value={formData.EnumTypeId}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-save me-1"></i>
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Role List Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Role List</h5>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Sr. No</th>
                        <th scope="col">Role Name</th>
                        <th scope="col">Role Code</th>
                        <th scope="col">Remarks</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <tr key={role.role_Id}>
                            <td>{role.role_Id}</td>
                            <td>{role.role_Name}</td>
                            <td>{role.role_Code}</td>
                            <td>{role.remarks}</td>
                            <td>
                              <span className={`badge ${role.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {role.status_Id === 1 ? 'Active' : 'Inactive'}
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
};

export default RoleForm;
