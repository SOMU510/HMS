import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
const HostelTypeMaster = () => {
  const [hostelTypes, setHostelTypes] = useState([]);
  const [formValues, setFormValues] = useState({
    Hostel_Type_Id: 0,
    Hostel_Type_Name: '',
    Hostel_Type_Code: '',
    Status_Id: 1,
    Remarks: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHostelTypes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - please login');
        setLoading(false);
        return;
      }
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(
        'https://localhost:7291/api/BasicMaster/_GET_HOSTEL_TYPE_MASTER/0/1',
        {
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch hostel types');
      const data = await response.json();
      setHostelTypes(data);
    } catch (error) {
      console.error('Error fetching hostel types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formValues.Hostel_Type_Name.trim() || !formValues.Hostel_Type_Code.trim()) {
      alert('Please fill in both Hostel Type Name and Hostel Code');
      return;
    }

    // Prepare data for backend
    const payload = {
      Hostel_Type_Id: formValues.Hostel_Type_Id,
      Hostel_Type_Name: formValues.Hostel_Type_Name,
      Hostel_Type_Code: formValues.Hostel_Type_Code,
      Status_Id: Number(formValues.Status_Id),
      Remarks: formValues.Remarks,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - please login');
        return;
      }
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      let url = 'https://localhost:7291/api/BasicMaster/SaveHostelType'; // Replace with your save API
      let method = 'POST';
      if (isEditing) {
        url = `https://localhost:7291/api/BasicMaster/UpdateHostelType/${payload.Hostel_Type_Id}`; // Replace with your update API
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to save hostel type');
      }

      // On success, refresh list and reset form
      fetchHostelTypes();
      setFormValues({
        Hostel_Type_Id: 0,
        Hostel_Type_Name: '',
        Hostel_Type_Code: '',
        Status_Id: 1,
        Remarks: '',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving hostel type:', error);
      alert('Error saving hostel type: ' + error.message);
    }
  };

  const handleEdit = (hostelType) => {
    setFormValues({
      Hostel_Type_Id: hostelType.Hostel_Type_Id,
      Hostel_Type_Name: hostelType.Hostel_Type_Name,
      Hostel_Type_Code: hostelType.Hostel_Type_Code || '',
      Status_Id: hostelType.Status_Id,
      Remarks: hostelType.Remarks || '',
    });
    setIsEditing(true);
  };

  const statusText = (statusId) => (statusId === 1 ? 'Active' : 'Inactive');

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: 'auto', mt: 0 }}>
      <Typography variant="h5" gutterBottom>
        Hostel Type Master
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}
      >
        <TextField
          label="Hostel Type Name"
          name="Hostel_Type_Name"
          value={formValues.Hostel_Type_Name}
          onChange={handleChange}
          required
          size='small'
          sx={{ flexGrow: 1 }}
        />

        <TextField
          label="Hostel Code"
          name="Hostel_Type_Code"
          value={formValues.Hostel_Type_Code}
          onChange={handleChange}
          required
           size='small'
          sx={{ flexGrow: 1 }}
        />

        <TextField
          select
          label="Status"
          name="Status_Id"
          value={formValues.Status_Id}
          onChange={handleChange}
          SelectProps={{ native: true }}
          required
           size='small'
          sx={{ width: 140 }}
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </TextField>

        <TextField
          label="Remarks"
          name="Remarks"
          value={formValues.Remarks}
          onChange={handleChange}
          multiline
          rows={1}
           size='small'
          sx={{ flexBasis: '100%' }}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button variant="contained" type="submit" sx={{ height: 40 }}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
          {isEditing && (
            <Button
              variant="outlined"
              onClick={() => {
                setFormValues({
                  Hostel_Type_Id: 0,
                  Hostel_Type_Name: '',
                  Hostel_Type_Code: '',
                  Status_Id: 1,
                  Remarks: '',
                });
                setIsEditing(false);
              }}
              sx={{ height: 40 }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading hostel types...</Typography>
      ) : (
        <Table className='common-table' stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Sr No</TableCell>
              <TableCell>Hostel Type Name</TableCell>
              <TableCell>Hostel Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hostelTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hostel types found.
                </TableCell>
              </TableRow>
            ) : (
              hostelTypes.map((ht, index) => (
                <TableRow key={ht.Hostel_Type_Id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{ht.hostel_Type_Name}</TableCell>
                  <TableCell>{ht.hostel_Type_Code || '-'}</TableCell>
                  <TableCell>{statusText(ht.Status_Id)}</TableCell>
                  <TableCell>{ht.Remarks || '-'}</TableCell>
                  <TableCell>
                   <IconButton
                        color="primary"
                        aria-label="Edit Hostel Type"
                        size="small"
                        onClick={() => handleEdit(ht)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default HostelTypeMaster;
