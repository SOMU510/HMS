import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Checkbox,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

// Example buildMenuTree helper to convert flat menu list into tree structure
function buildMenuTree(flatMenus) {
  const idMap = {};
  flatMenus.forEach((menu) => (idMap[menu.menu_Id] = { ...menu, submenus: [] }));

  const tree = [];
  flatMenus.forEach((menu) => {
    if (menu.parent_Menu_Id && idMap[menu.parent_Menu_Id]) {
      idMap[menu.parent_Menu_Id].submenus.push(idMap[menu.menu_Id]);
    } else {
      tree.push(idMap[menu.menu_Id]);
    }
  });
  return tree;
}

const RoleMenuLinking = () => {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedMenus, setCheckedMenus] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [openMenus, setOpenMenus] = useState({}); // For expanded menu tracking

  const location = useLocation(); // For path-based menu expansion

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found - please login');
          setError('Authentication required');
          setLoading(false);
          return;
        }
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const Role_Id = 0;
        const Role_Type_Enum_Id = 0;
        const Status_Id = 1;
        const Is_Visible = true;

        const url = `https://localhost:7291/api/BasicMaster/GetRole/${Role_Id}/${Role_Type_Enum_Id}/${Status_Id}/${Is_Visible}`;

        const res = await axios.get(url, {
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
          },
        });

        setRoles(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
        if (res.data.length > 0) setSelectedRoleId(res.data[0].role_Id);
      } catch (err) {
        console.error('Fetch roles failed:', err);
        setError('Failed to load roles');
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Fetch menus when location.pathname changes or selectedRoleId changes
  useEffect(() => {
  async function fetchMenus() {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - please login');
        return;
      }
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const Role_Menu_Right_Id = 1;
      const Role_Id = selectedRoleId || 0;
      const Menu_Id = 0;
      const Status_Id = 1;

      const apiUrl = `https://localhost:7291/api/BasicMaster/_GET_ROLE_MENU_LINKING/${Role_Menu_Right_Id}/${Role_Id}/${Menu_Id}/${Status_Id}`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch menus');

      const allMenus = await response.json();

      // Set checkedMenus based on is_Linked = 1
      const initialChecked = {};
      allMenus.forEach(menu => {
        initialChecked[menu.menu_Id] = menu.is_Linked === 1;
      });
      setCheckedMenus(initialChecked);

      // Build tree and set menus
      const hierarchicalMenus = buildMenuTree(allMenus);
      setMenus(hierarchicalMenus);

      // Auto-expand menus based on current route
      const newOpenMenus = {};
      const checkAndExpand = (menu) => {
        const isDashboard = menu.menu_Name.toLowerCase() === 'welcome screen';
        const currentPath = location.pathname.toLowerCase();

        if (isDashboard) {
          if (currentPath === '/' || currentPath.startsWith(`/${menu.form_Relative_Path?.toLowerCase() || ''}`)) {
            newOpenMenus[menu.menu_Id] = true;
          }
        } else if (menu.submenus.some(sub => currentPath.startsWith(`/${sub.form_Relative_Path?.toLowerCase() || ''}`))) {
          newOpenMenus[menu.menu_Id] = true;
        }
        menu.submenus.forEach(checkAndExpand);
      };
      hierarchicalMenus.forEach(checkAndExpand);
      setOpenMenus(newOpenMenus);

    } catch (error) {
      console.error(error);
    }
  }

  fetchMenus();
}, [location.pathname, selectedRoleId]);


  const handleRoleChange = (event) => {
    setSelectedRoleId(event.target.value);
  };

  const handleCheckboxChange = (menuId) => {
    setCheckedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  if (loading) return <CircularProgress />;

  if (error) return <Typography color="error">{error}</Typography>;

  // Flatten hierarchical menus to a simple list for the table (or modify UI to show hierarchy)
  const flattenMenus = (menusList) => {
    const flat = [];
    const recurse = (list) => {
      list.forEach((menu) => {
        flat.push(menu);
        if (menu.submenus?.length > 0) {
          recurse(menu.submenus);
        }
      });
    };
    recurse(menusList);
    return flat;
  };

  const flatMenus = flattenMenus(menus);
  // Determine if all checkboxes are selected
const allSelected = flatMenus.length > 0 && flatMenus.every(menu => checkedMenus[menu.menu_Id]);

const handleSelectAllChange = (event) => {
  const checked = event.target.checked;
  const newCheckedMenus = {};

  flatMenus.forEach(menu => {
    newCheckedMenus[menu.menu_Id] = checked;
  });

  setCheckedMenus(newCheckedMenus);
};


  return (
    <Box sx={{ maxWidth: 1000, margin: 'auto', mt: 0 }}>
           <FormControl fullWidth size="small" sx={{ mb: 3,width:'25ch' }}>
        <InputLabel id="role-select-label">Select Role</InputLabel>
        <Select
          labelId="role-select-label"
          label="Select Role"
          value={selectedRoleId}
          onChange={handleRoleChange}
        >
          {roles.map((role) => (
            <MenuItem key={role.role_Id} value={role.role_Id}>
              {role.role_Name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
  <Box sx={{ maxHeight: 430, overflowY: 'auto' }}>
      <Table size="small" className='common-table' stickyHeader aria-label="Role Menu Linking Table">
       <TableHead>
  <TableRow>
    <TableCell>Sr No</TableCell> {/* New column for Serial Number */}
    <TableCell>Menu Name</TableCell>
    <TableCell>Role</TableCell>
   <TableCell align="center">
  <Checkbox
    checked={allSelected}
    onChange={handleSelectAllChange}
    inputProps={{ 'aria-label': 'Select all menus' }}
  />
  Has Access
</TableCell>

  </TableRow>
</TableHead>
<TableBody>
  {flatMenus.map((menu, index) => (
    <TableRow key={menu.menu_Id}>
      <TableCell>{index + 1}</TableCell> {/* Serial Number */}
      <TableCell>{menu.menu_Name}</TableCell>
      <TableCell>
        <Typography>
          {roles.find((r) => r.role_Id === selectedRoleId)?.role_Name || 'Select a role'}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Checkbox
          checked={!!checkedMenus[menu.menu_Id]}
          onChange={() => handleCheckboxChange(menu.menu_Id)}
          inputProps={{ 'aria-label': `checkbox for menu ${menu.menu_Name}` }}
        />
      </TableCell>
    </TableRow>
  ))}
</TableBody>

      </Table>
      </Box>
  </Box>
  );
};

export default RoleMenuLinking;
