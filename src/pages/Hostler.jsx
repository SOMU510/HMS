import React, { useState } from 'react';
import {
  Box, TextField, Select, MenuItem, Button,
  InputLabel, FormControl, Typography, Grid
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const HostlerForm = () => {
  const [formData, setFormData] = useState({
    Hostel_Id: '',
    Hostler_Type_Enum_Id: '',
    Hostler_Name: '',
    Hostler_Registration_Date: dayjs(),
    Hostler_Email_Id: '',
    Hostler_Mobile_No: '',
    Hostler_DOB: dayjs(),
    Hostler_Living_For: '',
    Hostler_Subject: '',
    Hostler_Address: '',
    Hostler_Pincode: '',
    Hostler_State_Id: '',
    Hostler_City_Id: '',
    Hostler_Profile_Pic_Path: '',
    Hostler_Role_Id: '',
    Status_Id: '',
    Remarks: '',
  });

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}
      >
        <Typography variant="h5" gutterBottom>
          Hostler Registration Form
        </Typography>

        <Grid container spacing={2}>
          {/* First Row */}
          <Grid item xs={12} md={4}>
            <TextField label="Hostel ID" size="small" value={formData.Hostel_Id} onChange={handleChange('Hostel_Id')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Hostler Type</InputLabel>
              <Select value={formData.Hostler_Type_Enum_Id} size="small" onChange={handleChange('Hostler_Type_Enum_Id')} label="Hostler Type">
                <MenuItem value={1}>Student</MenuItem>
                <MenuItem value={2}>Staff</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Hostler Name" size="small" value={formData.Hostler_Name} onChange={handleChange('Hostler_Name')} fullWidth />
          </Grid>

          {/* Second Row */}
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Registration Date" 
              
              value={formData.Hostler_Registration_Date}
              onChange={(newDate) => handleChange('Hostler_Registration_Date')(newDate)}
              slotProps={{ textField: { fullWidth: true } , size : "small"} }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Email" size="small" type="email" value={formData.Hostler_Email_Id} onChange={handleChange('Hostler_Email_Id')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Mobile No." size="small" value={formData.Hostler_Mobile_No} onChange={handleChange('Hostler_Mobile_No')} fullWidth />
          </Grid>

          {/* Third Row */}
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Date of Birth" 
              size="small"
              value={formData.Hostler_DOB}
              onChange={(newDate) => handleChange('Hostler_DOB')(newDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Living For" size="small" value={formData.Hostler_Living_For} onChange={handleChange('Hostler_Living_For')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Subject" size="small" value={formData.Hostler_Subject} onChange={handleChange('Hostler_Subject')} fullWidth />
          </Grid>

          {/* Fourth Row */}
          <Grid item xs={12} md={4}>
            <TextField label="Pincode" size="small" value={formData.Hostler_Pincode} onChange={handleChange('Hostler_Pincode')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="State ID" size="small" value={formData.Hostler_State_Id} onChange={handleChange('Hostler_State_Id')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="City ID" size="small" value={formData.Hostler_City_Id} onChange={handleChange('Hostler_City_Id')} fullWidth />
          </Grid>

          {/* Fifth Row */}
          <Grid item xs={12} md={4}>
            <TextField label="Profile Pic Path" size="small" value={formData.Hostler_Profile_Pic_Path} onChange={handleChange('Hostler_Profile_Pic_Path')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Role ID" size="small" value={formData.Hostler_Role_Id} onChange={handleChange('Hostler_Role_Id')} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Status ID" size="small" value={formData.Status_Id} onChange={handleChange('Status_Id')} fullWidth />
          </Grid>

          {/* Full Width Fields */}
          <Grid item xs={12}>
            <TextField label="Address" size="small" value={formData.Hostler_Address} onChange={handleChange('Hostler_Address')} multiline rows={3} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Remarks" size="small" value={formData.Remarks} onChange={handleChange('Remarks')} multiline rows={2} fullWidth />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">Submit</Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default HostlerForm;
