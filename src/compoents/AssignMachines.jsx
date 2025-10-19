import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import toast, { Toaster } from "react-hot-toast";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #6f42c1",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const AssignMachines = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAssigned, setFetchingAssigned] = useState(false);

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const colors = {
    primary: "#6f42c1",
    secondary: "#e0d8f0",
  };

  const menuItemStyle = {
    padding: "12px 10px",
    fontSize: "16px",
    color: colors.primary,
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    borderRadius: "5px",
    "&:hover": {
      backgroundColor: colors.secondary,
    },
  };

  // ✅ Fetch all assigned machines (for interactive table)
  const fetchAssignedMachines = async () => {
    try {
      setFetchingAssigned(true);
      const response = await fetch(
        "https://threebtest.onrender.com/api/machines/get-all-assigned-machines-admin"
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAssignedMachines(data.data);
      } else {
        toast.error("Failed to load assigned machines.");
      }
    } catch (error) {
      console.error("Error fetching assigned machines:", error);
      toast.error("Error fetching assigned machines.");
    } finally {
      setFetchingAssigned(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(
        "https://threebapi-1067354145699.asia-south1.run.app/api/items/get-items"
      );
      const data = await response.json();
      if (Array.isArray(data)) setItems(data);
      else if (data.success && Array.isArray(data.data)) setItems(data.data);
      else toast.error("Invalid items API response.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch items.");
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch(
        "https://threebtest.onrender.com/api/machines/get"
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setMachines(data.data);
      } else toast.error("Invalid machines API response.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch machines.");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "https://threebtest.onrender.com/api/staff/get-employees"
      );
      const data = await response.json();
      if (Array.isArray(data)) setEmployees(data);
      else if (data.success && Array.isArray(data.data)) setEmployees(data.data);
      else toast.error("Invalid employees API response.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees.");
    }
  };

  useEffect(() => {
    fetchAssignedMachines();
  }, []);

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
    setSelectedMachine("");
    setSelectedEmployees([]);
    setSelectedItem("");
  };

  const handleEmployeeChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedEmployees(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = async () => {
    if (!selectedMachine || selectedEmployees.length === 0 || !selectedItem) {
      toast.error("Please fill all the required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://threebtest.onrender.com/api/machines/assign-machine",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            machineId: selectedMachine,
            employeeIds: selectedEmployees,
            mainItemId: selectedItem,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Machine assigned successfully!");
        handleClose();
        fetchAssignedMachines(); // refresh table
      } else {
        toast.error(result.message || "Failed to assign machine.");
      }
    } catch (error) {
      console.error("Error assigning machine:", error);
      toast.error("An error occurred while assigning the machine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", p: 2 }}>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          bgcolor: colors.primary,
          "&:hover": { bgcolor: "#5a379e" },
        }}
      >
        Assign Machine
      </Button>

      {/* Modal for Assigning Machines */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
            Assign Machine
          </Typography>

          {/* Machine Select */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: colors.primary }}>Machine Name</InputLabel>
            <Select
              value={selectedMachine}
              label="Machine Name"
              onChange={(e) => setSelectedMachine(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary },
                "& .MuiSvgIcon-root": { color: colors.primary },
              }}
            >
              {machines.map((machine) => (
                <MenuItem key={machine._id} value={machine._id} sx={menuItemStyle}>
                  {machine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Employees */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: colors.primary }}>Assign Employees</InputLabel>
            <Select
              multiple
              value={selectedEmployees}
              onChange={handleEmployeeChange}
              input={<OutlinedInput label="Assign Employees" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const emp = employees.find((e) => e._id === value);
                    return (
                      <Chip
                        key={value}
                        label={emp ? emp.name : value}
                        sx={{ bgcolor: colors.secondary, color: colors.primary }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id} sx={menuItemStyle}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Items */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: colors.primary }}>Item Name</InputLabel>
            <Select
              value={selectedItem}
              label="Item Name"
              onChange={(e) => setSelectedItem(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary },
                "& .MuiSvgIcon-root": { color: colors.primary },
              }}
            >
              {items.map((item) => (
                <MenuItem key={item._id} value={item._id} sx={menuItemStyle}>
                  {item.itemNo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                "&:hover": { bgcolor: colors.secondary },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ bgcolor: colors.primary, "&:hover": { bgcolor: "#5a379e" } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Assign Machine"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* ✅ Interactive Table View */}
      <Typography variant="h6" sx={{ mt: 10, mb: 2, color: colors.primary }}>
        Assigned Machines
      </Typography>

      {fetchingAssigned ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.secondary }}>
                <TableCell><b>Machine</b></TableCell>
                <TableCell><b>Employees</b></TableCell>
                <TableCell><b>Item No</b></TableCell>
                <TableCell><b>Company</b></TableCell>
                <TableCell><b>Shift</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedMachines.map((row) => (
                <React.Fragment key={row._id}>
                  <TableRow>
                    <TableCell>{row.machine?.name}</TableCell>
                    <TableCell>
                      {row.employees.map((emp) => emp.name).join(", ")}
                    </TableCell>
                    <TableCell>{row.mainItem?.itemNo}</TableCell>
                    <TableCell>{row.mainItem?.company}</TableCell>
                    <TableCell>{row.mainItem?.shift}</TableCell>
                  </TableRow>

                  {/* Collapsible Box Details */}
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ color: colors.primary, fontWeight: "bold" }}>
                            Box Details ({row.mainItem?.boxes?.length || 0})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {row.mainItem?.boxes?.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Box Serial No</TableCell>
                                  <TableCell>Stock Status</TableCell>
                                  <TableCell>QR Code</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {row.mainItem.boxes.map((box) => (
                                  <TableRow key={box._id}>
                                    <TableCell>{box.boxSerialNo}</TableCell>
                                    <TableCell>{box.stockStatus}</TableCell>
                                    <TableCell>
                                      <img
                                        src={box.qrCodeUrl}
                                        alt="QR"
                                        width={60}
                                        height={60}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography>No boxes found.</Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Toaster />
    </Box>
  );
};

export default AssignMachines;
