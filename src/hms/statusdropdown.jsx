import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatusDropdown = ({
  label = 'Status',
  value,
  onChange,
  name = 'status',
  disabled = false,
  statusType = 'Row_Status',
  onDefaultSelect,
}) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - please login');
        setStatusOptions([]);
        setLoading(false);
        return;
      }
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      try {
        const url = `https://localhost:7291/api/BasicMaster/_GET_STATUS/${statusType}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
          },
        });

        let options = [];
        if (Array.isArray(res.data)) {
          options = res.data;
        } else if (res.data && Array.isArray(res.data.Table)) {
          options = res.data.Table;
        } else if (res.data && Array.isArray(res.data.rows)) {
          options = res.data.rows;
        } else {
          console.warn('Unexpected status data shape:', res.data);
        }

        setStatusOptions(options);

        if ((!value || value === '') && options.length > 0 && onDefaultSelect) {
          onDefaultSelect({
            target: {
              name,
              value: options[0].status_Id,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching status options:', error);
        setStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusOptions();
  }, [statusType, name, value, onDefaultSelect]);

  return (
    <select
      className="form-select"
      name={name}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
    >
      {loading ? (
        <option value="">Loading...</option>
      ) : statusOptions.length > 0 ? (
        <>
          <option value="">Select {label}</option>
          {statusOptions.map((status) => (
            <option key={status.status_Id} value={status.status_Id}>
              {status.name}
            </option>
          ))}
        </>
      ) : (
        <option value="">No status found</option>
      )}
    </select>
  );
};

export default StatusDropdown;
