import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const states = [
  { id: 1, name: 'California' },
  { id: 2, name: 'Texas' },
];

const cities = [
  { id: 1, name: 'Los Angeles' },
  { id: 2, name: 'Houston' },
];

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' },
];

const EmployeeForm = () => {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [navigate]);

  const [Employees, setEmployee] = useState([]);
  const [refresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formValues, setFormValues] = useState({
    Employee_Name: '',
    Employee_Code: '',
    Employee_Internal_Code: '',
    Employee_Email_Id: '',
    Employee_Mobile_No: '',
    Employee_Address: '',
    Employee_Pincode: '',
    Employee_State_Id: '',
    Employee_City_Id: '',
    Profile_Pic_Path: '',
    Employee_Role_Id: '',
    Login_User_Id: '',
    Status_Id: '',
    Remarks: '',
    Action_Remarks: '',
  });

  const fetchEmployee = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const Employee_Id = 0;
      const Status_Id = 0;
      const url = `https://localhost:7291/api/BasicMaster/_GET_EMPLOYEE/${Employee_Id}/${Status_Id}`;
      const res = await axios.get(url, {
        headers: {
          Authorization: token,
          Accept: 'application/json',
        },
      });
      setEmployee(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Fetch failed:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { replace: true });
      }
    }
  }, [getToken, navigate]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee, refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formValues);
  };

  const handleEdit = (emp) => {
    setFormValues({
      employee_Id: emp.employee_Id || '',
      employee_Name: emp.employee_Name || '',
      employee_Code: emp.employee_Code || '',
      employee_Internal_Code: emp.employee_Internal_Code || '',
      employee_Email_Id: emp.employee_Email_Id || '',
      employee_Mobile_No: emp.employee_Mobile_No || '',
      employee_Address: emp.employee_Address || '',
      employee_Pincode: emp.employee_Pincode || '',
      employee_State_Id: emp.employee_State_Id || '',
      employee_City_Id: emp.employee_City_Id || '',
      profile_Pic_Path: emp.profile_Pic_Path || '',
      role_Id: emp.role_Id || '',
      login_User_Id: emp.login_User_Id || '',
      status_Id: emp.status_Id || '',
      remarks: emp.remarks || '',
      action_Remarks: emp.action_Remarks || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormValues({
      Employee_Name: '',
      Employee_Code: '',
      Employee_Internal_Code: '',
      Employee_Email_Id: '',
      Employee_Mobile_No: '',
      Employee_Address: '',
      Employee_Pincode: '',
      Employee_State_Id: '',
      Employee_City_Id: '',
      Profile_Pic_Path: '',
      Employee_Role_Id: '',
      Login_User_Id: '',
      Status_Id: '',
      Remarks: '',
      Action_Remarks: '',
    });
    setIsEditing(false);
  };

  const filteredEmployees = Employees.filter((emp) => {
    const name = emp.employee_Name ?? '';
    const code = emp.employee_Code ?? '';
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
        <h1>Employee Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Employee Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="Employee_Name" className="form-label">Employee Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Employee_Name"
                        name="Employee_Name"
                        value={formValues.Employee_Name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_Code" className="form-label">Employee Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Employee_Code"
                        name="Employee_Code"
                        value={formValues.Employee_Code}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_Internal_Code" className="form-label">Internal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Employee_Internal_Code"
                        name="Employee_Internal_Code"
                        value={formValues.Employee_Internal_Code}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_Email_Id" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="Employee_Email_Id"
                        name="Employee_Email_Id"
                        value={formValues.Employee_Email_Id}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_Mobile_No" className="form-label">Mobile No</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="Employee_Mobile_No"
                        name="Employee_Mobile_No"
                        value={formValues.Employee_Mobile_No}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_Pincode" className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Employee_Pincode"
                        name="Employee_Pincode"
                        value={formValues.Employee_Pincode}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_State_Id" className="form-label">State</label>
                      <select
                        className="form-select"
                        id="Employee_State_Id"
                        name="Employee_State_Id"
                        value={formValues.Employee_State_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_City_Id" className="form-label">City</label>
                      <select
                        className="form-select"
                        id="Employee_City_Id"
                        name="Employee_City_Id"
                        value={formValues.Employee_City_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select City</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Employee_Role_Id" className="form-label">Role</label>
                      <select
                        className="form-select"
                        id="Employee_Role_Id"
                        name="Employee_Role_Id"
                        value={formValues.Employee_Role_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select Role</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="Employee_Address" className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        id="Employee_Address"
                        name="Employee_Address"
                        rows="2"
                        value={formValues.Employee_Address}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="Remarks" className="form-label">Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        value={formValues.Remarks}
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

            {/* Employee List Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Employee List</h5>
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
                        <th scope="col">Employee Name</th>
                        <th scope="col">Code</th>
                        <th scope="col">Email</th>
                        <th scope="col">Mobile</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <tr key={emp.employee_Id}>
                            <td>{emp.employee_Id}</td>
                            <td>{emp.employee_Name}</td>
                            <td>{emp.employee_Code}</td>
                            <td>{emp.employee_Email_Id}</td>
                            <td>{emp.employee_Mobile_No}</td>
                            <td>
                              <span className={`badge ${emp.status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {emp.status_Id === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(emp)}
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EmployeeForm;
