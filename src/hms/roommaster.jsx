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
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const RoomMaster = () => {
  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formValues, setFormValues] = useState({
    Room_Id: 0,
    Hostel_Id: '',
    Block_Id: '',
    Room_No: '',
    Room_Internal_Code: '',
    Room_Total_No_Of_Beds: '',
    Room_Remaining_Vacated_No_Of_Beds: '',
    Room_Facility_Description: '',
    Status_Id: 1,
    Remarks: '',
    Beds: [''], // NEW: array of bed numbers, initially one empty
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch Hostels
  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch('https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/1', {
        headers: { Authorization: authHeader, Accept: 'application/json' },
      });
      const data = await res.json();
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
    }
  };

  // Fetch Blocks
  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch('https://localhost:7291/api/BasicMaster/_GET_BLOCK_MASTER/0/1', {
        headers: { Authorization: authHeader, Accept: 'application/json' },
      });
      const data = await res.json();
      setBlocks(data);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    }
  };

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch('https://localhost:7291/api/BasicMaster/_GET_ROOM_MASTER/0/1', {
        headers: { Authorization: authHeader, Accept: 'application/json' },
      });
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  useEffect(() => {
    fetchHostels();
    fetchBlocks();
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle bed number input change by index
  const handleBedChange = (index, value) => {
    setFormValues((prev) => {
      const newBeds = [...prev.Beds];
      newBeds[index] = value;
      return { ...prev, Beds: newBeds };
    });
  };

  // Add new empty bed input
  const addBed = () => {
    setFormValues((prev) => ({ ...prev, Beds: [...prev.Beds, ''] }));
  };

  // Remove bed input by index
  const removeBed = (index) => {
    setFormValues((prev) => {
      const newBeds = prev.Beds.filter((_, i) => i !== index);
      return { ...prev, Beds: newBeds.length ? newBeds : [''] }; // keep at least one
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      Hostel_Id,
      Block_Id,
      Room_Internal_Code,
      Room_No,
      Room_Total_No_Of_Beds,
      Room_Remaining_Vacated_No_Of_Beds,
    } = formValues;

    if (!Hostel_Id || !Block_Id) {
      alert('Please fill in all required fields (Hostel, Block).');
      return;
    }

    if (
      (Room_Total_No_Of_Beds && isNaN(Room_Total_No_Of_Beds)) ||
      (Room_Remaining_Vacated_No_Of_Beds && isNaN(Room_Remaining_Vacated_No_Of_Beds))
    ) {
      alert('Please enter valid numbers for Total Beds and Remaining Vacated Beds.');
      return;
    }

    // Ensure Beds array contains non-empty strings only
    const bedsFiltered = formValues.Beds.filter((b) => b.trim() !== '');

    const payload = {
      Room_Id: formValues.Room_Id,
      Hostel_Id: Number(formValues.Hostel_Id),
      Block_Id: Number(formValues.Block_Id),
      Room_No: formValues.Room_No || null,
      Room_Internal_Code: formValues.Room_Internal_Code.trim(),
      Room_Total_No_Of_Beds: formValues.Room_Total_No_Of_Beds ? Number(formValues.Room_Total_No_Of_Beds) : null,
      Room_Remaining_Vacated_No_Of_Beds: formValues.Room_Remaining_Vacated_No_Of_Beds
        ? Number(formValues.Room_Remaining_Vacated_No_Of_Beds)
        : null,
      Room_Facility_Description: formValues.Room_Facility_Description || null,
      Status_Id: Number(formValues.Status_Id),
      Remarks: formValues.Remarks || null,
      Beds: bedsFiltered, // NEW: send bed numbers
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      let url = 'https://localhost:7291/api/BasicMaster/SaveRoomMaster';
      let method = 'POST';

      if (isEditing) {
        url = `https://localhost:7291/api/BasicMaster/UpdateRoomMaster/${payload.Room_Id}`;
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
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save room');
      }

      alert(isEditing ? 'Room updated successfully' : 'Room added successfully');

      fetchRooms();
      setFormValues({
        Room_Id: 0,
        Hostel_Id: '',
        Block_Id: '',
        Room_No: '',
        Room_Internal_Code: '',
        Room_Total_No_Of_Beds: '',
        Room_Remaining_Vacated_No_Of_Beds: '',
        Room_Facility_Description: '',
        Status_Id: 1,
        Remarks: '',
        Beds: [''], // reset beds
      });
      setIsEditing(false);
    } catch (err) {
      alert(`Error saving room: ${err.message}`);
      console.error(err);
    }
  };

  const handleEdit = (room) => {
    setFormValues({
      Room_Id: room.Room_Id,
      Hostel_Id: room.Hostel_Id,
      Block_Id: room.Block_Id,
      Room_No: room.Room_No || '',
      Room_Internal_Code: room.Room_Internal_Code,
      Room_Total_No_Of_Beds: room.Room_Total_No_Of_Beds || '',
      Room_Remaining_Vacated_No_Of_Beds: room.Room_Remaining_Vacated_No_Of_Beds || '',
      Room_Facility_Description: room.Room_Facility_Description || '',
      Status_Id: room.Status_Id,
      Remarks: room.Remarks || '',
      Beds: room.Beds && room.Beds.length ? room.Beds : [''], // load existing beds or one empty
    });
    setIsEditing(true);
  };

  const statusText = (id) => (id === 1 ? 'Active' : 'Inactive');

  const filteredBlocks = blocks.filter((b) => b.Hostel_Id === Number(formValues.Hostel_Id));

  return (
    <Box sx={{ p: 0, maxWidth: 1100, margin: 'auto', mt: 0 }}>
      <Typography variant="h5" gutterBottom>
        Room Master
      </Typography>
      <Divider sx={{ my: 2, borderColor: 'grey.400' }} />

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }} size="small" required>
          <InputLabel id="hostel-label">Hostel</InputLabel>
          <Select
            labelId="hostel-label"
            name="Hostel_Id"
            value={formValues.Hostel_Id}
            onChange={handleChange}
            label="Hostel"
          >
            {hostels.map((h) => (
              <MenuItem key={h.Hostel_Id} value={h.Hostel_Id}>
                {h.Hostel_Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small" required>
          <InputLabel id="block-label">Block</InputLabel>
          <Select
            labelId="block-label"
            name="Block_Id"
            value={formValues.Block_Id}
            onChange={handleChange}
            label="Block"
          >
            {filteredBlocks.map((b) => (
              <MenuItem key={b.Block_Id} value={b.Block_Id}>
                {b.Block_Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Room No"
          name="Room_No"
          value={formValues.Room_No}
          onChange={handleChange}
          size="small"
          sx={{ flexGrow: 1 }}
        />

        <TextField
          label="Total No of Beds"
          name="Room_Total_No_Of_Beds"
          type="number"
          value={formValues.Room_Total_No_Of_Beds}
          onChange={handleChange}
          size="small"
          sx={{ width: 150 }}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Remaining Vacated Beds"
          name="Room_Remaining_Vacated_No_Of_Beds"
          type="number"
          value={formValues.Room_Remaining_Vacated_No_Of_Beds}
          onChange={handleChange}
          size="small"
          sx={{ width: 150 }}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Facility Description"
          name="Room_Facility_Description"
          value={formValues.Room_Facility_Description}
          onChange={handleChange}
          multiline
          rows={1}
          size="small"
          sx={{ flexBasis: '100%' }}
        />

       {/* New Beds input section */}
<Box sx={{ flexBasis: '100%', mb: 2 }}>
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    {formValues.Beds.map((bed, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          label={`Bed Number ${index + 1}`}
          value={bed}
          size="small"
          onChange={(e) => handleBedChange(index, e.target.value)}
          sx={{ width: 120 }}
        />
        <Button
          color="error"
          onClick={() => removeBed(index)}
          sx={{ ml: 1, minWidth: '30px', padding: '6px 10px' }}
          disabled={formValues.Beds.length === 1}
        >
          &times;
        </Button>
      </Box>
    ))}
    <Button variant="outlined" onClick={addBed} size="small" sx={{ height: 40 }}>
      Add Bed
    </Button>
  </Box>
</Box>


        <TextField
          select
          label="Status"
          name="Status_Id"
          value={formValues.Status_Id}
          onChange={handleChange}
          size="small"
          sx={{ width: '25ch' }}
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
          sx={{ width: '93ch' }}
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
                  Room_Id: 0,
                  Hostel_Id: '',
                  Block_Id: '',
                  Room_No: '',
                  Room_Internal_Code: '',
                  Room_Total_No_Of_Beds: '',
                  Room_Remaining_Vacated_No_Of_Beds: '',
                  Room_Facility_Description: '',
                  Status_Id: 1,
                  Remarks: '',
                  Beds: [''],
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

      <Table stickyHeader className="common-table">
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Hostel</TableCell>
            <TableCell>Block</TableCell>
            <TableCell>Room No</TableCell>
            <TableCell>Room Internal Code</TableCell>
            <TableCell>Total Beds</TableCell>
            <TableCell>Remaining Beds</TableCell>
            <TableCell>Facility Description</TableCell>
            <TableCell>Beds</TableCell>{/* New column */}
            <TableCell>Status</TableCell>
            <TableCell>Remarks</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} align="center">
                No rooms found.
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room, index) => {
              const hostel = hostels.find((h) => h.Hostel_Id === room.Hostel_Id);
              const block = blocks.find((b) => b.Block_Id === room.Block_Id);
              return (
                <TableRow key={room.Room_Id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{hostel?.Hostel_Name || '-'}</TableCell>
                  <TableCell>{block?.Block_Name || '-'}</TableCell>
                  <TableCell>{room.Room_No || '-'}</TableCell>
                  <TableCell>{room.Room_Internal_Code}</TableCell>
                  <TableCell>{room.Room_Total_No_Of_Beds}</TableCell>
                  <TableCell>{room.Room_Remaining_Vacated_No_Of_Beds}</TableCell>
                  <TableCell>{room.Room_Facility_Description || '-'}</TableCell>
                  <TableCell>
                    {room.Beds && room.Beds.length ? room.Beds.join(', ') : '-'}
                  </TableCell>
                  <TableCell>{statusText(room.Status_Id)}</TableCell>
                  <TableCell>{room.Remarks || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(room)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default RoomMaster;
