// HostelFeeMasterForm.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from '@mui/material';

export default function HostelFeeMasterForm({ refresh }) {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return null;
    }
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }, [navigate]);

  // ------------------ State ------------------
  const [hostelFee, setHostelFee] = useState({ hostelId: "", blockId: "" });
  const [hostelList, setHostelList] = useState([]);
  const [blockList, setBlockList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [roomRows, setRoomRows] = useState([]);

  // ------------------ Fetch Hostel List ------------------
  const fetchHostelList = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const url = "https://localhost:7291/api/BasicMaster/_GET_HOSTEL_MASTER/0/0/0";
      const res = await axios.get(url, { headers: { Authorization: token, Accept: "application/json" } });
      setHostelList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch hostel failed:", error);
      if (error.response?.status === 401) navigate("/login", { replace: true });
    }
  }, [getToken, navigate]);

  // ------------------ Fetch Block List ------------------
  const fetchBlockList = useCallback(
    async (hostelId) => {
      try {
        const token = getToken();
        if (!token || !hostelId) {
          setBlockList([]);
          return;
        }
        const url = `https://localhost:7291/api/BasicMaster/_GET_BLOCK_MASTER/0/0/0`;
        const res = await axios.get(url, { headers: { Authorization: token, Accept: "application/json" } });

        const filteredBlocks = (Array.isArray(res.data)
          ? res.data.filter((b) => b.hostel_Id === Number(hostelId))
          : []);
        setBlockList(filteredBlocks);
      } catch (error) {
        console.error("Fetch block failed:", error);
        if (error.response?.status === 401) navigate("/login", { replace: true });
      }
    },
    [getToken, navigate]
  );

  // ------------------ Fetch Room List ------------------
  const fetchRoomList = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const url = "https://localhost:7291/api/BasicMaster/_GET_ROOM_MASTER/0/0/0/0";
      const res = await axios.get(url, { headers: { Authorization: token, Accept: "application/json" } });
      setRoomList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch room failed:", error);
      if (error.response?.status === 401) navigate("/login", { replace: true });
    }
  }, [getToken, navigate]);

  // ------------------ useEffect ------------------
  useEffect(() => {
    fetchHostelList();
    fetchRoomList();
  }, [fetchHostelList, fetchRoomList, refresh]);

  // ------------------ Update filtered room rows ------------------
  useEffect(() => {
    const filteredRooms = roomList.filter((room) => {
      const hostelMatch = hostelFee.hostelId ? room.hostel_Id === Number(hostelFee.hostelId) : true;
      const blockMatch = hostelFee.blockId ? room.block_Id === Number(hostelFee.blockId) : true;
      return hostelMatch && blockMatch;
    });

    const rows = filteredRooms.map((room, index) => ({
      id: index + 1,
      roomId: room.room_Id,
      roomNo: room.room_No,
      roomMonthlyFee: room.room_Monthly_Fee,       
      hostelCautionMoney: room.hostel_Caution_Money,  
      otherCharges: room.other_Charges,         
      guestOtherCharges: room.guest_Other_Charges,  
      lateFeePenalty: room.late_Fee_Penalty,     
      otherChargesFor: room.other_Charges_For,
     }));

    setRoomRows(rows);
  }, [hostelFee, roomList]);

  // ------------------ Handlers ------------------
  const handleHostelChange = (e) => {
    const { name, value } = e.target;
    setHostelFee((prev) => ({ ...prev, [name]: value, blockId: "" }));
    fetchBlockList(value);
  };

  const handleBlockChange = (e) => {
    const { name, value } = e.target;
    setHostelFee((prev) => ({ ...prev, [name]: value }));
  };


  const handleDeleteRow = (id) => {
    setRoomRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { hostelFee, roomLinkingList: roomRows };
    console.log("Submitting Data:", payload);
    // TODO: POST to backend
  };

  // ------------------ DataGrid Columns ------------------
  const columns = [
    { field: "roomNo", headerName: "Room", flex: 1 ,renderCell: (params) => (
    <strong>{params.value}</strong>
  ),},
    { field: "roomMonthlyFee", headerName: "Monthly Fee", flex: 1, editable: true ,type: "number"},
    { field: "hostelCautionMoney", headerName: "Caution Money", flex: 1, editable: true,type: "number" },
    { field: "otherCharges", headerName: "Other Charges", flex: 1, editable: true,type: "number" },
    { field: "guestOtherCharges", headerName: "Guest Charges", flex: 1, editable: true ,type: "number"},
    { field: "lateFeePenalty", headerName: "Late Fee Penalty", flex: 1, editable: true ,type: "number"},
    { field: "otherChargesFor", headerName: "Other Charges For", flex: 1, editable: true },
    {
    field: "actions",
    headerName: "Actions",
    sortable: false,
    renderCell: (params) => (
      <IconButton
        color="error"
        onClick={() => handleDeleteRow(params.id)}
      >
        <DeleteOutlineIcon />
      </IconButton>
    ),
  },
  ];

  // ------------------ UI ------------------
  return (
    <Paper sx={{ p: 4, maxWidth: 1100, mx: "auto" ,mt:-5}}>
      <Typography variant="h5" gutterBottom>
        🏠 Hostel Fee Master
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
  {/* Hostel Dropdown */}
  <Grid item xs={12} md={6}>
    <FormControl 
      sx={{ 
        minWidth: 250,     // minimum width
        width: '100%',     // full width in small screens
      }}
      size="small"
    >
      <InputLabel>Hostel</InputLabel>
      <Select
        name="hostelId"
        value={hostelFee.hostelId}
        label="Hostel"
        onChange={handleHostelChange}
      >
        {hostelList.map((h) => (
          <MenuItem key={h.hostel_Id} value={h.hostel_Id}>
            {h.hostel_Name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  {/* Block Dropdown */}
  <Grid item xs={12} md={6}>
    <FormControl 
      sx={{ minWidth: 250, width: '100%' }} 
      size="small"
      disabled={!hostelFee.hostelId} // disable if no hostel selected
    >
      <InputLabel>Block</InputLabel>
      <Select
        name="blockId"
        value={hostelFee.blockId}
        label="Block"
        onChange={handleBlockChange}
      >
        {blockList.length > 0 ? (
          blockList.map((b) => (
            <MenuItem key={b.block_Id} value={b.block_Id}>
              {b.block_Name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Blocks Found</MenuItem>
        )}
      </Select>
    </FormControl>
  </Grid>
</Grid>
      <Box sx={{ height: 350, width: "100%", mb: 0, mt : -2 }}>
        <DataGrid
          rows={roomRows}
          columns={columns}
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          processRowUpdate={(updatedRow) => {
            setRoomRows((prevRows) =>
              prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
            );
            return updatedRow;
          }}
          sx={{
            "& .MuiDataGrid-cell": { color: "black" ,   borderColor: '2px solid #1976d2', },
            "& .MuiDataGrid-columnHeader": { color: "black" },
        
          }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between",mt:1 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          💾 Save Hostel Fee
        </Button>
      </Box>
    </Paper>
  );
}
