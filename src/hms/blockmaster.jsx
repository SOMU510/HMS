import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Divider } from '@mui/material';

const BlockMaster = () => {
  const [blocks, setBlocks] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [formValues, setFormValues] = useState({
    Block_Id: 0,
    Block_Name: '',
    Block_Code: '',
    Hostel_Id: '',
    Status_Id: 1,
    Remarks: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const res = await fetch(`https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/1`, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch hostels');

      const data = await res.json();
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
    }
  };

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const res = await fetch(`https://localhost:7291/api/BasicMaster/_GET_BLOCK_MASTER/0/1`, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch blocks');

      const data = await res.json();
      setBlocks(data);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    }
  };

  useEffect(() => {
    fetchHostels();
    fetchBlocks();
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
    if (!formValues.Block_Name || !formValues.Block_Code || !formValues.Hostel_Id) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
      Block_Id: formValues.Block_Id,
      Block_Name: formValues.Block_Name,
      Block_Code: formValues.Block_Code,
      Hostel_Id: Number(formValues.Hostel_Id),
      Status_Id: Number(formValues.Status_Id),
      Remarks: formValues.Remarks,
    };

    try {
      const token = localStorage.getItem('token');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      let url = 'https://localhost:7291/api/BasicMaster/SaveBlockMaster';
      let method = 'POST';

      if (isEditing) {
        url = `https://localhost:7291/api/BasicMaster/UpdateBlockMaster/${payload.Block_Id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to save');
      }

      // Reset form and refresh list
      fetchBlocks();
      setFormValues({
        Block_Id: 0,
        Block_Name: '',
        Block_Code: '',
        Hostel_Id: '',
        Status_Id: 1,
        Remarks: '',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving block:', error);
      alert('Error saving block: ' + error.message);
    }
  };

  const handleEdit = (block) => {
    setFormValues({
      Block_Id: block.Block_Id,
      Block_Name: block.Block_Name,
      Block_Code: block.Block_Code,
      Hostel_Id: block.Hostel_Id,
      Status_Id: block.Status_Id,
      Remarks: block.Remarks || '',
    });
    setIsEditing(true);
  };

  const statusText = (id) => (id === 1 ? 'Active' : 'Inactive');

  return (
    <Box sx={{ p: 0, maxWidth: 1000, margin: 'auto' , mt: 0 }}>
      <Typography variant="h5" gutterBottom>
        Block Master
      </Typography>
      <Divider sx={{ my: 2, borderColor: 'grey.400' }} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}
      >
        <FormControl sx={{ minWidth: 200 }} size="small" required>
          <InputLabel id="hostel-label">Select Hostel</InputLabel>
          <Select
            labelId="hostel-label"
            name="Hostel_Id"
            value={formValues.Hostel_Id}
            onChange={handleChange}
            label="Select Hostel"
          >
            {hostels.map((h) => (
              <MenuItem key={h.Hostel_Id} value={h.Hostel_Id}>
                {h.Hostel_Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Block Name"
          name="Block_Name"
          value={formValues.Block_Name}
          onChange={handleChange}
          required
          size="small"
          sx={{ flexGrow: 1 }}
        />

        <TextField
          label="Block Code"
          name="Block_Code"
          value={formValues.Block_Code}
          onChange={handleChange}
          required
          size="small"
          sx={{ flexGrow: 1 }}
        />

        <TextField
          select
          label="Status"
          name="Status_Id"
          value={formValues.Status_Id}
          onChange={handleChange}
          size="small"
          sx={{ width: 140 }}
        >
          <MenuItem value={1}>Active</MenuItem>
          <MenuItem value={0}>Inactive</MenuItem>
        </TextField>

        <TextField
          label="Remarks"
          name="Remarks"
          value={formValues.Remarks}
          onChange={handleChange}
          multiline
          rows={1}
          size="small"
          sx={{ flexBasis: '100%' }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button type="submit" variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
          {isEditing && (
            <Button
              variant="outlined"
              onClick={() => {
                setFormValues({
                  Block_Id: 0,
                  Block_Name: '',
                  Block_Code: '',
                  Hostel_Id: '',
                  Status_Id: 1,
                  Remarks: '',
                });
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      <Table className="common-table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Hostel Name</TableCell>
            <TableCell>Block Name</TableCell>
            <TableCell>Block Code</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Remarks</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No blocks found.
              </TableCell>
            </TableRow>
          ) : (
            blocks.map((block, index) => (
              <TableRow key={block.Block_Id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{hostels.find(h => h.Hostel_Id === block.Hostel_Id)?.Hostel_Name || '-'}</TableCell>
                <TableCell>{block.Block_Name}</TableCell>
                <TableCell>{block.Block_Code}</TableCell>
                <TableCell>{statusText(block.Status_Id)}</TableCell>
                <TableCell>{block.Remarks || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(block)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default BlockMaster;
