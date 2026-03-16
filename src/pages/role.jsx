import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
 } from '@mui/material';
 import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import axios from 'axios';

const RoleForm = () => {
  const [formData, setFormData] = useState({
    roleName: '',
    code: '',
    remark: '',
    status: ''
  });

  const [roles, setRoles] = useState([]);
  const [refresh, setRefresh] = useState(false); // To trigger data reload if needed

  // Fetch roles on mount or when refresh changes
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get('https://localhost:7291/api/BasicMaster/GetRole');
        // Assuming API returns an array of roles
        setRoles(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };
    fetchRoles();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) return;

      const payload = {
        role_Id: stateData.State_Id,
        role_Type_Enum_Id: stateData.name,
        role_Name: stateData.code,
        role_Code: stateData.code,
        is_Editable: stateData.code,
        is_Visible: stateData.code,
        Status_Id: 1,
        Remarks: stateData.Remarks,
        Action_Remarks: '',
        CreatedBy_Login_User_Id: 123,
        CreatedOn_Date: new Date().toISOString(),
        CreatedBy_Login_Session_Id: 456,
        CreatedFrom_Screen: 'RoleForm',
        CreatedFrom_Menu_Code: 'Role_mst',
      };
      const response = await fetch('https://localhost:7291/api/BasicMaster/SaveRole', {
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

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              label="Role Name"
              variant="outlined"
              fullWidth
                size="small"
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              rows={7}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Code"
              variant="outlined"
              fullWidth
              size="small"
              name="code"
              value={formData.code}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Remark"
              variant="outlined"
              fullWidth
              size="small"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" sx={{ width: '150px' }}> 
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                fullWidth
                  size="small"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>

      <Paper sx={{ p: 2, mt: 1 }}>
        <Typography variant="h6" gutterBottom>
          Role List
        </Typography>
        <Table>
          <TableHead>
            <TableRow  sx={{ height: 10 }}>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.length > 0 ? (
              roles.map((role) => (
                <TableRow  sx={{ height: 10 }} key={role.Role_Id || role.Role_Code || role.Role_Name}>
                  <TableCell>{role.role_Name}</TableCell>
                  <TableCell>{role.role_Code}</TableCell>
                  <TableCell>{role.remarks}</TableCell>
              
                     <TableCell align="center">
              {/* Edit Button */}
              <IconButton 
                color="primary" 
                aria-label="edit role"
               
              >
                <EditIcon />
              </IconButton>
            </TableCell>
             </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default RoleForm;
