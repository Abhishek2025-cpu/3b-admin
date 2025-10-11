import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #6f42c1',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

const AssignMachines = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = {
    primary: '#6f42c1', // Based on profileName, profileEmail, menuItem
    secondary: '#e0d8f0', // Based on activeMenuItem
  };

  const menuItemStyle = {
    padding: '12px 10px',
    fontSize: '16px',
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderRadius: '5px',
    '&:hover': {
      backgroundColor: colors.secondary,
    },
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch('https://threebtest.onrender.com/api/machines/get');
      const data = await response.json();
      if (data.success) {
        setMachines(data.data);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast.error('Failed to fetch machines.');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('https://threebtest.onrender.com/api/staff/get-employees');
      const data = await response.json();
      if (Array.isArray(data)) { // Assuming the API returns an array directly
        setEmployees(data);
      } else if (data.success && Array.isArray(data.data)) { // If it's wrapped in a data object
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees.');
    }
  };

  const fetchItems = async () => {
    // Assuming a similar API structure for items, replace with actual API endpoint if different
    try {
      const response = await fetch('https://threebtest.onrender.com/api/items/get'); // Placeholder API, adjust as needed
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch items.');
    }
  };

  useEffect(() => {
    if (open) {
      fetchMachines();
      fetchEmployees();
      fetchItems();
    }
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedMachine('');
    setSelectedEmployees([]);
    setSelectedItem('');
  };

  const handleEmployeeChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedEmployees(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSubmit = async () => {
    if (!selectedMachine || selectedEmployees.length === 0 || !selectedItem) {
      toast.error('Please fill all the required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://threebtest.onrender.com/api/machines/assign-machine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId: selectedMachine,
          employeeIds: selectedEmployees,
          mainItemId: selectedItem,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        handleClose();
      } else {
        toast.error(result.message || 'Failed to assign machine.');
      }
    } catch (error) {
      console.error('Error assigning machine:', error);
      toast.error('An error occurred while assigning the machine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh', padding: 2 }}>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: colors.primary,
          '&:hover': {
            bgcolor: '#5a379e', // A darker shade of primary for hover
          },
        }}
      >
        Assign Machine
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="assign-machine-modal-title"
        aria-describedby="assign-machine-modal-description"
      >
        <Box sx={style}>
          <Typography id="assign-machine-modal-title" variant="h6" component="h2" sx={{ color: colors.primary, marginBottom: 2 }}>
            Assign Machine
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="machine-select-label" sx={{ color: colors.primary }}>Machine Name</InputLabel>
            <Select
              labelId="machine-select-label"
              id="machine-select"
              value={selectedMachine}
              label="Machine Name"
              onChange={(e) => setSelectedMachine(e.target.value)}
              inputProps={{ sx: { color: colors.primary } }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '& .MuiSvgIcon-root': {
                  color: colors.primary,
                },
              }}
            >
              {machines.map((machine) => (
                <MenuItem key={machine._id} value={machine._id} sx={menuItemStyle}>
                  {machine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="employee-select-label" sx={{ color: colors.primary }}>Assign Employees</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              multiple
              value={selectedEmployees}
              onChange={handleEmployeeChange}
              input={<OutlinedInput id="select-multiple-chip" label="Assign Employees" sx={{ color: colors.primary }} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const employee = employees.find((emp) => emp._id === value);
                    return (
                      <Chip
                        key={value}
                        label={employee ? employee.name : value}
                        sx={{ bgcolor: colors.secondary, color: colors.primary }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 224,
                    bgcolor: 'background.paper',
                    border: `1px solid ${colors.primary}`,
                  },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '& .MuiSvgIcon-root': {
                  color: colors.primary,
                },
              }}
            >
              {employees.map((employee) => (
                <MenuItem
                  key={employee._id}
                  value={employee._id}
                  sx={menuItemStyle}
                >
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="item-select-label" sx={{ color: colors.primary }}>Select Main Item</InputLabel>
            <Select
              labelId="item-select-label"
              id="item-select"
              value={selectedItem}
              label="Select Main Item"
              onChange={(e) => setSelectedItem(e.target.value)}
              inputProps={{ sx: { color: colors.primary } }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary,
                },
                '& .MuiSvgIcon-root': {
                  color: colors.primary,
                },
              }}
            >
              {items.map((item) => (
                <MenuItem key={item._id} value={item._id} sx={menuItemStyle}>
                  {item.itemNo} {/* Assuming itemNo is the display name */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: colors.secondary,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                bgcolor: colors.primary,
                '&:hover': {
                  bgcolor: '#5a379e',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Assign Machine'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AssignMachines;