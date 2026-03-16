import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../Images/Avtar.png';

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ loginId: '', profilePic: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({
        loginId: userData.LoginId || userData.loginId || '',
        profilePic: userData.profile_Pic_Path || '',
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const toggleSidebar = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    document.body.classList.toggle('toggle-sidebar');
  };

  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      {/* Logo */}
      <div className="d-flex align-items-center justify-content-between">
        <a href="/" className="logo d-flex align-items-center">
          <span className="d-none d-lg-block">HMS</span>
        </a>
        <i 
          className="bi bi-list toggle-sidebar-btn" 
          onClick={toggleSidebar}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSidebar(e);
            }
          }}
        ></i>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <form className="search-form d-flex align-items-center" method="POST" action="#">
          <input
            type="text"
            name="query"
            placeholder="Search"
            title="Enter search keyword"
            className="form-control"
          />
          <button type="submit" title="Search">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>

      {/* Header Nav */}
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          {/* Search Icon for Mobile */}
          <li className="nav-item d-block d-lg-none">
            <a className="nav-link nav-icon search-bar-toggle" href="#!">
              <i className="bi bi-search"></i>
            </a>
          </li>

          {/* Notifications Dropdown */}
          <li className="nav-item dropdown">
            <a className="nav-link nav-icon" href="#!" data-bs-toggle="dropdown">
              <i className="bi bi-bell"></i>
              <span className="badge bg-primary badge-number">4</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
              <li className="dropdown-header">
                You have 4 new notifications
                <a href="#!">
                  <span className="badge rounded-pill bg-primary p-2 ms-2">View all</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="notification-item">
                <i className="bi bi-exclamation-circle text-warning"></i>
                <div>
                  <h4>New Hostler Registration</h4>
                  <p>John Doe registered for Room 101</p>
                  <p>30 min. ago</p>
                </div>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="notification-item">
                <i className="bi bi-check-circle text-success"></i>
                <div>
                  <h4>Fee Payment Received</h4>
                  <p>Payment received from Student ID: 1234</p>
                  <p>1 hr. ago</p>
                </div>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="dropdown-footer">
                <a href="#!">Show all notifications</a>
              </li>
            </ul>
          </li>

          {/* Messages Dropdown */}
          <li className="nav-item dropdown">
            <a className="nav-link nav-icon" href="#!" data-bs-toggle="dropdown">
              <i className="bi bi-chat-left-text"></i>
              <span className="badge bg-success badge-number">3</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
              <li className="dropdown-header">
                You have 3 new messages
                <a href="#!">
                  <span className="badge rounded-pill bg-primary p-2 ms-2">View all</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="message-item">
                <a href="#!">
                  <div>
                    <h4>Admin</h4>
                    <p>Please review the new hostel application...</p>
                    <p>4 hrs. ago</p>
                  </div>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="dropdown-footer">
                <a href="#!">Show all messages</a>
              </li>
            </ul>
          </li>

          {/* Profile Dropdown */}
          <li className="nav-item dropdown pe-3">
            <a
              className="nav-link nav-profile d-flex align-items-center pe-0"
              href="#!"
              data-bs-toggle="dropdown"
            >
              <img
                src={user.profilePic || defaultAvatar}
                alt="Profile"
                className="rounded-circle"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
              <span className="d-none d-md-block dropdown-toggle ps-2">{user.loginId || 'User'}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{user.loginId || 'User'}</h6>
                <span>Hostel Management</span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#!">
                  <i className="bi bi-person"></i>
                  <span>My Profile</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#!">
                  <i className="bi bi-gear"></i>
                  <span>Account Settings</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#!">
                  <i className="bi bi-question-circle"></i>
                  <span>Need Help?</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#!" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Topbar;
