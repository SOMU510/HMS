import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
const EmployeeList = ({ refresh }) => {
  const [employees, setEmployees] = useState([]);

 const fetchEmployees = async (employeeId) => {
  try {
       const res = await axios.get(`https://localhost:7291/api/BasicMaster/GetEmployeeById/${employeeId}`);
    setEmployees([res.data]);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
};


  useEffect(() => {
    fetchEmployees(123);
  }, [refresh]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Employee List</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Status</TableCell>
             <TableCell>Checkbox</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map(emp => (
            <TableRow key={emp.employee_Id}>
              <TableCell>{emp.employee_Name}</TableCell>
              <TableCell>{emp.employee_Code}</TableCell>
              <TableCell>{emp.employee_Email_Id}</TableCell>
              <TableCell>{emp.employee_Mobile_No}</TableCell>
              <TableCell>{emp.status_Id}</TableCell>
              
                      </TableRow>
          ))}
        </TableBody>
      </Table>
      
    <FormControlLabel
      control={
        <Checkbox checked={true} disabled />  // ✅ static: checked & non-editable
      }
      label="Approved"
    />
    </Paper>
  );
};

export default EmployeeList;
