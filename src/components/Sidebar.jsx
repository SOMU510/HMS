import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Icon mapping for menu items
const iconMap = {
  'Dashboard': 'bi-grid',
  'DashboardOutlined': 'bi-grid',
  'Menu_Icon': 'bi-menu-button-wide',
  'Menu': 'bi-menu-button-wide',
  'PersonOutline': 'bi-person',
  'People': 'bi-people',
  'Settings': 'bi-gear',
  'Home': 'bi-house-door',
  'Apartment': 'bi-building',
  'Business': 'bi-briefcase',
  'AccountBox': 'bi-person-badge',
  'MeetingRoom': 'bi-door-open',
  'Hotel': 'bi-building',
  'Category': 'bi-collection',
  'Payment': 'bi-credit-card',
  'Description': 'bi-file-text',
  'GroupAdd': 'bi-person-plus',
  'AdminPanelSettings': 'bi-shield-check',
  'Link': 'bi-link-45deg',
  'LocationCity': 'bi-geo-alt',
  'Map': 'bi-map'
};

// Get icon class based on icon name
const getIconClass = (iconName) => {
  if (!iconName) return 'bi-circle';
  return iconMap[iconName] || 'bi-circle';
};

// Converts flat DB menu list to nested tree
function buildMenuTree(flatMenus) {
  const menuMap = {};
  flatMenus.forEach(menu => {
    menu.submenus = [];
    menuMap[menu.menu_Id] = menu;
  });

  const rootMenus = [];

  flatMenus.forEach(menu => {
    if (menu.parent_Menu_Id === null) {
      rootMenus.push(menu);
    } else {
      const parent = menuMap[menu.parent_Menu_Id];
      if (parent) {
        parent.submenus.push(menu);
      }
    }
  });

  return rootMenus;
}

const Sidebar = () => {
  const location = useLocation();
  const [menus, setMenus] = useState([]);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    async function fetchMenus() {
      try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;

        const token = localStorage.getItem('token');
        const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

        if (!token) {
          console.error('No token found - please login');
          return;
        }

        const Role_Menu_Right_Id = 1;
        const Role_Id = user?.role || 0;
        const Menu_Id = 0;
        const Status_Id = 1;

        const apiUrl = `https://localhost:7291/api/BasicMaster/_GET_ROLE_MENU_RIGHT/${Role_Menu_Right_Id}/${Role_Id}/${Menu_Id}/${Status_Id}`;

        const response = await fetch(apiUrl, {
          headers: {
           'Authorization': authHeader,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch menus');

        const allMenus = await response.json();
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
  }, [location.pathname]);

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const renderMenuItems = (menuList) => {
    return menuList.map(menu => {
      const isOpen = openMenus[menu.menu_Id] || false;
      const hasChildren = menu.submenus && menu.submenus.length > 0;
      const isDashboard = menu.menu_Name.toLowerCase() === 'welcome screen';
      const currentPath = location.pathname.toLowerCase();

      if (hasChildren) {
        return (
          <li className="nav-item" key={menu.menu_Id}>
            <a
              className={`nav-link ${isOpen ? '' : 'collapsed'}`}
              onClick={() => toggleMenu(menu.menu_Id)}
              href="#!"
              data-bs-toggle="collapse"
              data-bs-target={`#menu-${menu.menu_Id}`}
            >
              <i className={`bi ${getIconClass(menu.menu_Icon)}`}></i>
              <span>{menu.menu_Name}</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id={`menu-${menu.menu_Id}`}
              className={`nav-content collapse ${isOpen ? 'show' : ''}`}
              data-bs-parent="#sidebar-nav"
            >
              {menu.submenus.map(submenu => {
                const isSubActive = currentPath.startsWith(`/${submenu.form_Relative_Path?.toLowerCase() || ''}`);
                return (
                  <li key={submenu.menu_Id}>
                    <NavLink
                      to={`/${submenu.form_Relative_Path}`}
                      className={isSubActive ? 'active' : ''}
                    >
                      <i className="bi bi-circle"></i>
                      <span>{submenu.menu_Name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      } else {
        const isActive = isDashboard
          ? currentPath === '/' || currentPath.startsWith(`/${menu.form_Relative_Path?.toLowerCase() || ''}`)
          : currentPath.startsWith(`/${menu.form_Relative_Path?.toLowerCase() || ''}`);

        return (
          <li className="nav-item" key={menu.menu_Id}>
            <NavLink
              to={isDashboard ? '/' : `/${menu.form_Relative_Path}`}
              className={`nav-link ${isActive ? '' : 'collapsed'}`}
            >
              <i className={`bi ${getIconClass(menu.menu_Icon)}`}></i>
              <span>{menu.menu_Name}</span>
            </NavLink>
          </li>
        );
      }
    });
  };

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        {renderMenuItems(menus)}
      </ul>
    </aside>
  );
};

export default Sidebar;
