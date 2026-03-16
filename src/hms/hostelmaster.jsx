import React, { useState, useEffect } from 'react';

const HostelMasterForm = () => {
  const [formValues, setFormValues] = useState({
    Hostel_Id: 0,
    Hostel_Name: '',
    Hostel_Code: '',
    Hostel_Internal_Code: '',
    Hostel_Type_Id: 0,
    Hostel_Total_Room: '',
    Hostel_Contact_Person_Name: '',
    Hostel_Contact_Person_Mobile_No: '',
    Hostel_Address: '',
    Hostel_Pincode: '',
    Hostel_State_Id: 0,
    Hostel_City_Id: 0,
    Hostel_Caution_Money: '',
    Other_Charges: '',
    Hostel_Rules_Description: '',
    Status_Id: 1,
    Remarks: '',
  });

  const [hostelTypes, setHostelTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHostelTypes();
    fetchStates();
    fetchHostels();
  }, []);

  useEffect(() => {
    if (formValues.Hostel_State_Id) {
      fetchCities(formValues.Hostel_State_Id);
    } else {
      setCities([]);
      setFormValues((prev) => ({ ...prev, Hostel_City_Id: 0 }));
    }
  }, [formValues.Hostel_State_Id]);

  const fetchHostelTypes = async () => {
    const dummyHostelTypes = [
      { Hostel_Type_Id: 1, Hostel_Type_Name: 'Boys Hostel' },
      { Hostel_Type_Id: 2, Hostel_Type_Name: 'Girls Hostel' },
    ];
    setHostelTypes(dummyHostelTypes);
  };

  const fetchStates = async () => {
    const dummyStates = [
      { State_Id: 1, State_Name: 'State A' },
      { State_Id: 2, State_Name: 'State B' },
    ];
    setStates(dummyStates);
  };

  const fetchCities = async (stateId) => {
    if (stateId === 1) {
      setCities([
        { City_Id: 1, City_Name: 'City A1' },
        { City_Id: 2, City_Name: 'City A2' },
      ]);
    } else if (stateId === 2) {
      setCities([
        { City_Id: 3, City_Name: 'City B1' },
        { City_Id: 4, City_Name: 'City B2' },
      ]);
    } else {
      setCities([]);
    }
  };

  const fetchHostels = async () => {
    setLoading(true);
    const dummyHostels = [
      {
        Hostel_Id: 1,
        Hostel_Name: 'Sample Hostel 1',
        Hostel_Code: 'H001',
        Hostel_Type_Name: 'Boys Hostel',
        Hostel_Total_Room: 50,
        Status_Id: 1,
      },
    ];
    setHostels(dummyHostels);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', formValues);
    alert(isEditing ? 'Hostel Updated!' : 'Hostel Created!');
    handleReset();
  };

  const handleEdit = (hostel) => {
    setFormValues({
      ...formValues,
      ...hostel,
    });
    setIsEditing(true);
  };

  const handleReset = () => {
    setFormValues({
      Hostel_Id: 0,
      Hostel_Name: '',
      Hostel_Code: '',
      Hostel_Internal_Code: '',
      Hostel_Type_Id: 0,
      Hostel_Total_Room: '',
      Hostel_Contact_Person_Name: '',
      Hostel_Contact_Person_Mobile_No: '',
      Hostel_Address: '',
      Hostel_Pincode: '',
      Hostel_State_Id: 0,
      Hostel_City_Id: 0,
      Hostel_Caution_Money: '',
      Other_Charges: '',
      Hostel_Rules_Description: '',
      Status_Id: 1,
      Remarks: '',
    });
    setIsEditing(false);
  };

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Hostel Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Hostel Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{isEditing ? 'Edit Hostel' : 'Add New Hostel'}</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="Hostel_Name" className="form-label">Hostel Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostel_Name"
                        name="Hostel_Name"
                        value={formValues.Hostel_Name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Code" className="form-label">Hostel Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostel_Code"
                        name="Hostel_Code"
                        value={formValues.Hostel_Code}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Internal_Code" className="form-label">Internal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostel_Internal_Code"
                        name="Hostel_Internal_Code"
                        value={formValues.Hostel_Internal_Code}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Type_Id" className="form-label">Hostel Type</label>
                      <select
                        className="form-select"
                        id="Hostel_Type_Id"
                        name="Hostel_Type_Id"
                        value={formValues.Hostel_Type_Id}
                        onChange={handleChange}
                        required
                      >
                        <option value={0}>Select Hostel Type</option>
                        {hostelTypes.map((type) => (
                          <option key={type.Hostel_Type_Id} value={type.Hostel_Type_Id}>
                            {type.Hostel_Type_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Total_Room" className="form-label">Total Rooms</label>
                      <input
                        type="number"
                        className="form-control"
                        id="Hostel_Total_Room"
                        name="Hostel_Total_Room"
                        value={formValues.Hostel_Total_Room}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Contact_Person_Name" className="form-label">Contact Person</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostel_Contact_Person_Name"
                        name="Hostel_Contact_Person_Name"
                        value={formValues.Hostel_Contact_Person_Name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_Contact_Person_Mobile_No" className="form-label">Contact Mobile</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="Hostel_Contact_Person_Mobile_No"
                        name="Hostel_Contact_Person_Mobile_No"
                        value={formValues.Hostel_Contact_Person_Mobile_No}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_State_Id" className="form-label">State</label>
                      <select
                        className="form-select"
                        id="Hostel_State_Id"
                        name="Hostel_State_Id"
                        value={formValues.Hostel_State_Id}
                        onChange={handleChange}
                      >
                        <option value={0}>Select State</option>
                        {states.map((state) => (
                          <option key={state.State_Id} value={state.State_Id}>
                            {state.State_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="Hostel_City_Id" className="form-label">City</label>
                      <select
                        className="form-select"
                        id="Hostel_City_Id"
                        name="Hostel_City_Id"
                        value={formValues.Hostel_City_Id}
                        onChange={handleChange}
                      >
                        <option value={0}>Select City</option>
                        {cities.map((city) => (
                          <option key={city.City_Id} value={city.City_Id}>
                            {city.City_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="Hostel_Address" className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        id="Hostel_Address"
                        name="Hostel_Address"
                        rows="2"
                        value={formValues.Hostel_Address}
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
                      <button type="button" className="btn btn-secondary ms-2" onClick={handleReset}>
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Hostel List Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Hostel List</h5>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Hostel Name</th>
                        <th scope="col">Code</th>
                        <th scope="col">Type</th>
                        <th scope="col">Total Rooms</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : hostels.length > 0 ? (
                        hostels.map((hostel) => (
                          <tr key={hostel.Hostel_Id}>
                            <td>{hostel.Hostel_Id}</td>
                            <td>{hostel.Hostel_Name}</td>
                            <td>{hostel.Hostel_Code}</td>
                            <td>{hostel.Hostel_Type_Name}</td>
                            <td>{hostel.Hostel_Total_Room}</td>
                            <td>
                              <span className={`badge ${hostel.Status_Id === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {hostel.Status_Id === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(hostel)}
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

export default HostelMasterForm;
