import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function HostlerForm() {
  const [hostler, setHostler] = useState({
    Hostel_Id: "",
    Hostler_Type_Enum_Id: "",
    Hostler_Name: "",
    Hostler_Code: "",
    Hostler_Registration_Date: null,
    Hostler_Email_Id: "",
    Hostler_Mobile_No: "",
    Hostler_DOB: null,
    Hostler_Pincode: "",
    Hostler_State_Id: "",
    Hostler_City_Id: "",
    Hostler_Profile_Pic_Path: null,
    Hostler_Role_Id: "",
    Status_Id: "",
    Remarks: "",
  });

  // Example dropdown data
  const hostels = [
    { id: 1, name: "Hostel A" },
    { id: 2, name: "Hostel B" },
  ];
  const hostlerTypes = [
    { id: 1, name: "Regular" },
    { id: 2, name: "Guest" },
  ];
  const states = [
    { id: 1, name: "State 1" },
    { id: 2, name: "State 2" },
  ];
  const cities = [
    { id: 1, name: "City 1" },
    { id: 2, name: "City 2" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHostler((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setHostler((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setHostler((prev) => ({
      ...prev,
      Hostler_Profile_Pic_Path: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Hostler:", hostler);
  };

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Hostler Master</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Masters</li>
            <li className="breadcrumb-item active">Hostler Master</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Add New Hostler</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Hostel */}
                    <div className="col-md-4">
                      <label htmlFor="Hostel_Id" className="form-label">Hostel</label>
                      <select
                        className="form-select"
                        id="Hostel_Id"
                        name="Hostel_Id"
                        value={hostler.Hostel_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select Hostel</option>
                        {hostels.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Hostler Type */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Type_Enum_Id" className="form-label">Hostler Type</label>
                      <select
                        className="form-select"
                        id="Hostler_Type_Enum_Id"
                        name="Hostler_Type_Enum_Id"
                        value={hostler.Hostler_Type_Enum_Id}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        {hostlerTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Hostler Name */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Name" className="form-label">Hostler Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostler_Name"
                        name="Hostler_Name"
                        value={hostler.Hostler_Name}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Hostler Code */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Code" className="form-label">Hostler Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostler_Code"
                        name="Hostler_Code"
                        value={hostler.Hostler_Code}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Registration Date */}
                    <div className="col-md-4">
                      <label className="form-label">Registration Date</label>
                      <DatePicker
                        value={hostler.Hostler_Registration_Date}
                        onChange={(newValue) =>
                          handleDateChange("Hostler_Registration_Date", newValue)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            className: "form-control",
                          },
                        }}
                      />
                    </div>

                    {/* DOB */}
                    <div className="col-md-4">
                      <label className="form-label">Date of Birth</label>
                      <DatePicker
                        value={hostler.Hostler_DOB}
                        onChange={(newValue) =>
                          handleDateChange("Hostler_DOB", newValue)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            className: "form-control",
                          },
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Email_Id" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="Hostler_Email_Id"
                        name="Hostler_Email_Id"
                        value={hostler.Hostler_Email_Id}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Mobile */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Mobile_No" className="form-label">Mobile No</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="Hostler_Mobile_No"
                        name="Hostler_Mobile_No"
                        value={hostler.Hostler_Mobile_No}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Pincode */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Pincode" className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Hostler_Pincode"
                        name="Hostler_Pincode"
                        value={hostler.Hostler_Pincode}
                        onChange={handleChange}
                      />
                    </div>

                    {/* State */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_State_Id" className="form-label">State</label>
                      <select
                        className="form-select"
                        id="Hostler_State_Id"
                        name="Hostler_State_Id"
                        value={hostler.Hostler_State_Id}
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

                    {/* City */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_City_Id" className="form-label">City</label>
                      <select
                        className="form-select"
                        id="Hostler_City_Id"
                        name="Hostler_City_Id"
                        value={hostler.Hostler_City_Id}
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

                    {/* Role */}
                    <div className="col-md-4">
                      <label htmlFor="Hostler_Role_Id" className="form-label">Role ID</label>
                      <input
                        type="number"
                        className="form-control"
                        id="Hostler_Role_Id"
                        name="Hostler_Role_Id"
                        value={hostler.Hostler_Role_Id}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Status */}
                    <div className="col-md-4">
                      <label htmlFor="Status_Id" className="form-label">Status ID</label>
                      <input
                        type="number"
                        className="form-control"
                        id="Status_Id"
                        name="Status_Id"
                        value={hostler.Status_Id}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Profile Pic */}
                    <div className="col-md-4">
                      <label htmlFor="profile-pic" className="form-label">Upload Profile Picture</label>
                      <input
                        type="file"
                        className="form-control"
                        id="profile-pic"
                        onChange={handleFileChange}
                      />
                      {hostler.Hostler_Profile_Pic_Path && (
                        <small className="text-muted">
                          {hostler.Hostler_Profile_Pic_Path.name}
                        </small>
                      )}
                    </div>

                    {/* Remarks (full width) */}
                    <div className="col-12">
                      <label htmlFor="Remarks" className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        id="Remarks"
                        name="Remarks"
                        rows="2"
                        value={hostler.Remarks}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {/* Submit */}
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-save me-1"></i>
                        Save Hostler
                      </button>
                      <button type="reset" className="btn btn-secondary ms-2">
                        <i className="bi bi-x-circle me-1"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
