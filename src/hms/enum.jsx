import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EnumDropdown = ({
  label = 'Select',
  value,
  onChange,
  name = 'enumValue',
  enumType, // required, e.g., 'Role_Type'
  disabled = false,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enumType) return;

    const fetchEnumOptions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, please login');
        setOptions([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(
          'https://localhost:7291/api/BasicMaster/GetEnumType',
          {
            enum_Id: 0,
            enum_Type: enumType,
            status_Id: 1,
            is_Visible: true,
          },
          {
            headers: {
              Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (Array.isArray(res.data)) {
          setOptions(res.data);
        } else {
          console.warn('Unexpected response:', res.data);
          setOptions([]);
        }
      } catch (error) {
        console.error('Error fetching enum options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnumOptions();
  }, [enumType]);

  return (
    <select
      className="form-select"
      name={name}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="">Please select {label}</option>
      {loading ? (
        <option value="" disabled>
          Loading...
        </option>
      ) : options.length > 0 ? (
        options.map((opt) => (
          <option key={opt.id} value={opt.enum_Value}>
            {opt.name}
          </option>
        ))
      ) : (
        <option value="" disabled>
          No options found
        </option>
      )}
    </select>
  );
};

export default EnumDropdown;
