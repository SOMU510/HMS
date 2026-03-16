import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// Build menu tree helper
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

const HostelMenuLinking = () => {
  const [hostels, setHostels] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedMenus, setCheckedMenus] = useState({});
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();

  // Fetch hostels on mount
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found - please login');
          setError('Authentication required');
          setLoading(false);
          return;
        }
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        // Mock data for hostels - Replace with your actual API
        const mockHostels = [
          { hostel_Id: 1, hostel_Name: 'Boys Hostel A', hostel_Code: 'BHA' },
          { hostel_Id: 2, hostel_Name: 'Girls Hostel B', hostel_Code: 'GHB' },
          { hostel_Id: 3, hostel_Name: 'Boys Hostel C', hostel_Code: 'BHC' },
          { hostel_Id: 4, hostel_Name: 'Girls Hostel D', hostel_Code: 'GHD' },
        ];

        setHostels(mockHostels);
        setLoading(false);
        if (mockHostels.length > 0) setSelectedHostelId(mockHostels[0].hostel_Id);
      } catch (err) {
        console.error('Fetch hostels failed:', err);
        setError('Failed to load hostels');
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  // Fetch menus when selectedHostelId changes
  useEffect(() => {
    async function fetchMenus() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found - please login');
          return;
        }
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        // Mock data - Replace with your actual API
        const mockMenus = [
          { menu_Id: 1, menu_Name: 'Dashboard', parent_Menu_Id: null, is_Linked: 1, menu_Icon: 'Dashboard' },
          { menu_Id: 2, menu_Name: 'Masters', parent_Menu_Id: null, is_Linked: 0, menu_Icon: 'Menu' },
          { menu_Id: 3, menu_Name: 'Room Management', parent_Menu_Id: 2, is_Linked: 1, menu_Icon: 'MeetingRoom' },
          { menu_Id: 4, menu_Name: 'Hostler Management', parent_Menu_Id: 2, is_Linked: 0, menu_Icon: 'People' },
          { menu_Id: 5, menu_Name: 'Fee Management', parent_Menu_Id: 2, is_Linked: 1, menu_Icon: 'Payment' },
          { menu_Id: 6, menu_Name: 'Payment Master', parent_Menu_Id: null, is_Linked: 0, menu_Icon: 'Payment' },
          { menu_Id: 7, menu_Name: 'Reports', parent_Menu_Id: null, is_Linked: 1, menu_Icon: 'Description' },
        ];

        // Set checkedMenus based on is_Linked
        const initialChecked = {};
        mockMenus.forEach(menu => {
          initialChecked[menu.menu_Id] = menu.is_Linked === 1;
        });
        setCheckedMenus(initialChecked);

        // Build tree and set menus
        const hierarchicalMenus = buildMenuTree(mockMenus);
        setMenus(hierarchicalMenus);

        // Auto-expand menus
        const newOpenMenus = {};
        const checkAndExpand = (menu) => {
          const currentPath = location.pathname.toLowerCase();
          if (menu.submenus.some(sub => currentPath.startsWith(`/${sub.form_Relative_Path?.toLowerCase() || ''}`))) {
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

    if (selectedHostelId) {
      fetchMenus();
    }
  }, [location.pathname, selectedHostelId]);

  const handleHostelChange = (event) => {
    setSelectedHostelId(event.target.value);
  };

  const handleCheckboxChange = (menuId) => {
    setCheckedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const linkedMenus = Object.keys(checkedMenus)
        .filter(menuId => checkedMenus[menuId])
        .map(menuId => parseInt(menuId));

      console.log('Saving hostel menu linking:', {
        hostel_Id: selectedHostelId,
        linked_Menus: linkedMenus,
      });

      // TODO: Replace with actual API call
      alert('Hostel menu permissions saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving permissions');
    }
  };

  // Flatten hierarchical menus
  const flattenMenus = (menusList) => {
    const flat = [];
    const recurse = (list, level = 0) => {
      list.forEach((menu) => {
        flat.push({ ...menu, level });
        if (menu.submenus?.length > 0) {
          recurse(menu.submenus, level + 1);
        }
      });
    };
    recurse(menusList);
    return flat;
  };

  const flatMenus = flattenMenus(menus);

  // Filter menus based on search
  const filteredMenus = flatMenus.filter(menu =>
    menu.menu_Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if all visible menus are selected
  const allSelected = filteredMenus.length > 0 && filteredMenus.every(menu => checkedMenus[menu.menu_Id]);

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    const newCheckedMenus = { ...checkedMenus };

    filteredMenus.forEach(menu => {
      newCheckedMenus[menu.menu_Id] = checked;
    });

    setCheckedMenus(newCheckedMenus);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <div className="pagetitle">
        <h1>Hostel Menu Linking</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item">Configuration</li>
            <li className="breadcrumb-item active">Hostel Menu Linking</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-building me-2"></i>
                  Manage Hostel Menu Permissions
                </h5>

                {/* Hostel Selection */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <label htmlFor="hostelSelect" className="form-label fw-semibold">
                      <i className="bi bi-house-door me-1"></i>Select Hostel *
                    </label>
                    <select
                      id="hostelSelect"
                      className="form-select"
                      value={selectedHostelId}
                      onChange={handleHostelChange}
                    >
                      {hostels.map((hostel) => (
                        <option key={hostel.hostel_Id} value={hostel.hostel_Id}>
                          {hostel.hostel_Name} ({hostel.hostel_Code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="searchMenu" className="form-label fw-semibold">
                      <i className="bi bi-search me-1"></i>Search Menu
                    </label>
                    <input
                      type="text"
                      id="searchMenu"
                      className="form-control"
                      placeholder="Type to search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4 d-flex align-items-end">
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleSave}
                    >
                      <i className="bi bi-save me-2"></i>
                      Save Permissions
                    </button>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <i className="bi bi-info-circle fs-5 me-2"></i>
                  <div>
                    <strong>Info:</strong> Select which menus should be accessible for <strong>
                      {hostels.find((h) => h.hostel_Id === selectedHostelId)?.hostel_Name}
                    </strong>. Check the boxes to grant access.
                  </div>
                </div>

                {/* Menus Table */}
                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th scope="col" style={{ width: '80px' }}>Sr No</th>
                        <th scope="col">Menu Name</th>
                        <th scope="col" style={{ width: '200px' }}>Hostel</th>
                        <th scope="col" className="text-center" style={{ width: '120px' }}>
                          <div className="form-check d-inline-block">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="selectAll"
                              checked={allSelected}
                              onChange={handleSelectAllChange}
                            />
                            <label className="form-check-label ms-2" htmlFor="selectAll">
                              Has Access
                            </label>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenus.length > 0 ? (
                        filteredMenus.map((menu, index) => (
                          <tr key={menu.menu_Id}>
                            <td>{index + 1}</td>
                            <td>
                              <span style={{ paddingLeft: `${menu.level * 20}px` }}>
                                {menu.level > 0 && (
                                  <i className="bi bi-arrow-return-right me-2 text-muted"></i>
                                )}
                                <i className={`bi bi-${menu.menu_Icon?.toLowerCase() || 'circle'} me-2 text-primary`}></i>
                                {menu.menu_Name}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {hostels.find((h) => h.hostel_Id === selectedHostelId)?.hostel_Code || 'N/A'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-inline-block">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`menu-${menu.menu_Id}`}
                                  checked={!!checkedMenus[menu.menu_Id]}
                                  onChange={() => handleCheckboxChange(menu.menu_Id)}
                                />
                                <label className="form-check-label" htmlFor={`menu-${menu.menu_Id}`}>
                                  {checkedMenus[menu.menu_Id] ? (
                                    <span className="badge bg-success ms-2">Enabled</span>
                                  ) : (
                                    <span className="badge bg-secondary ms-2">Disabled</span>
                                  )}
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">
                              {searchTerm ? 'No menus match your search' : 'No menus available'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Footer */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-light d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Summary:</strong> 
                        <span className="ms-2">
                          {Object.values(checkedMenus).filter(Boolean).length} of {flatMenus.length} menus enabled
                        </span>
                      </div>
                      <button
                        className="btn btn-success"
                        onClick={handleSave}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HostelMenuLinking;

