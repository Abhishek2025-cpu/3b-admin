import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx"; // For Excel export
import { saveAs } from "file-saver"; // For saving files
import jsPDF from "jspdf"; // For PDF export
import "jspdf-autotable"; // For PDF tables

import "./ReviewTasks.css"; // Reuse the same CSS file

const MixtureTasks = () => {
  const [mixtures, setMixtures] = useState([]);
  const [selectedMixture, setSelectedMixture] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          "https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees"
        );
        const employeeList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAllEmployees(employeeList);

        const onlyMixtures = employeeList.filter(emp => {
          if (!emp.role) return false;
          if (Array.isArray(emp.role)) {
            return emp.role.some(r => r.toLowerCase().includes("mixture"));
          } else if (typeof emp.role === 'string') {
            return emp.role.toLowerCase().includes("mixture");
          }
          return false;
        });
        
        setMixtures(onlyMixtures);
      } catch (err) {
        console.error("Error fetching staff:", err);
        toast.error("Could not load mixture list");
      }
    };
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    if (!selectedMixture) {
      toast.error("Please select a Mixture employee first");
      return;
    }

    setLoading(true);
    setTasks([]); // Clear previous results
    try {
      const res = await axios.get(
        `https://threebapi-1067354145699.asia-south1.run.app/api/workers/employee-task/${selectedMixture}?lang=kn`
      );
      
      let allTasks = [];
      if (Array.isArray(res.data)) allTasks = res.data;
      else if (Array.isArray(res.data?.data)) allTasks = res.data.data;
      else if (Array.isArray(res.data?.tasks)) allTasks = res.data.tasks;

      const filteredTasks = allTasks.filter((task) => {
        if (selectedDate) {
           const taskDate = new Date(task.createdAt).toLocaleDateString("en-CA"); // YYYY-MM-DD format
           return taskDate === selectedDate;
        }
        return true;
      });

      setTasks(filteredTasks);
      
      if (filteredTasks.length === 0) {
        toast("No validated tasks found for this mixture employee.", { icon: "ℹ️" });
      } else {
        toast.success(`Found ${filteredTasks.length} tasks`);
      }

    } catch (err) {
      console.error("Error loading tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (id) => {
    const emp = allEmployees.find(e => e._id === id);
    return emp ? emp.name : "Unknown";
  };
  
  const getSelectedMixtureName = () => {
      if (!selectedMixture) return "Mixture";
      const emp = mixtures.find(m => m._id === selectedMixture);
      return emp ? emp.name : "Mixture";
  }

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    if (tasks.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const formattedData = tasks.map((task, idx) => ({
      "S.No": idx + 1,
      "Mixture Name": getEmployeeName(task.updatedBy) || getSelectedMixtureName(),
      "Helper Name": task.employee?.name || "—",
      "Submit Time": formatTime(task.createdAt),
      "Correction Time": formatTime(task.updatedAt),
      "Frame Lengths": Array.isArray(task.frameLength) ? task.frameLength.join(', ') : task.frameLength,
      "No. Boxes": task.numberOfBox,
      "Box Weight": task.boxWeight,
      "Frame Weight": task.frameWeight,
      "Description": task.description || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    
    // Auto-size columns
    const cols = Object.keys(formattedData[0]).map(key => ({ wch: Math.max(20, key.length) }));
    worksheet["!cols"] = cols;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    
    const fileName = `Mixture_Tasks_${getSelectedMixtureName()}_${selectedDate || 'all-dates'}.xlsx`;
    saveAs(data, fileName);
  };

  // --- EXPORT TO PDF ---
  const handleExportPDF = () => {
    if (tasks.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const doc = new jsPDF();
    
    // Add a title to the PDF
    doc.setFontSize(16);
    doc.text(`Validated Tasks for: ${getSelectedMixtureName()}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${selectedDate || 'All Dates'}`, 14, 22);

    const tableColumn = ["S.No", "Submit Time", "Frame Lengths", "Boxes", "Box Wt", "Frame Wt", "Helper"];
    const tableRows = [];

    tasks.forEach((task, idx) => {
      const taskData = [
        idx + 1,
        formatTime(task.createdAt),
        Array.isArray(task.frameLength) ? task.frameLength.join(', ') : task.frameLength,
        task.numberOfBox,
        task.boxWeight,
        task.frameWeight,
        task.employee?.name || "—",
      ];
      tableRows.push(taskData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30, // Start table after the title
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }, // Blue header
    });
    
    const fileName = `Mixture_Tasks_${getSelectedMixtureName()}_${selectedDate || 'all-dates'}.pdf`;
    doc.save(fileName);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="review-task-page container">
      <Toaster position="top-right" />
      
      <h1 className="page-title">Mixture Validated Tasks</h1>

      <div className="filters-wrapper">
        <div className="filter">
          <label>Mixture Name</label>
          <select value={selectedMixture} onChange={(e) => setSelectedMixture(e.target.value)}>
            <option value="">-- Select Mixture --</option>
            {mixtures.map(op => (
              <option key={op._id} value={op._id}>{op.name}</option>
            ))}
          </select>
        </div>

        <div className="filter">
          <label>Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div className="filter actions">
          <button className="btn primary" onClick={fetchTasks} disabled={!selectedMixture}>
            Get Data
          </button>
          
          {/* ---- EXPORT BUTTONS ---- */}
          {tasks.length > 0 && (
            <>
              <button className="btn btn-export-excel" onClick={handleExportExcel}>
                Excel
              </button>
              <button className="btn btn-export-pdf" onClick={handleExportPDF}>
                PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loader">Loading Data...</div>
        ) : (
          <div className="table-responsive">
            <table className="rt-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Submit Time</th>
                  <th>Correction Time</th>
                  <th style={{ minWidth: '140px' }}>Frame Lengths</th>
                  <th>No. Boxes</th>
                  <th>Box Weight</th>
                  <th>Frame Weight</th>
                  <th>Description</th>
                  <th>Verified By / Filled By </th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan="9" className="empty">No tasks found for selected criteria</td></tr>
                ) : (
                  tasks.map((task, idx) => (
                    <tr key={task._id}>
                      <td>{idx + 1}</td>
                      <td><span className="badge time">{formatTime(task.createdAt)}</span></td>
                      <td><span className="badge time" style={{background: '#e3f2fd', color: '#0056b3'}}>{formatTime(task.updatedAt)}</span></td>
                      <td>
                        <div className="frame-badges">
                           {Array.isArray(task.frameLength) 
                              ? task.frameLength.map((f, i) => <span key={i} className="badge frame">{f}</span>)
                              : <span className="badge frame">{task.frameLength}</span>
                           }
                        </div>
                      </td>
                      <td>{task.numberOfBox}</td>
                      <td>{task.boxWeight}</td>
                      <td>{task.frameWeight}</td>
                      <td>{task.description || "—"}</td>
                      <td>
                        <div style={{fontSize: '0.8rem', lineHeight:'1.5'}}>
                            <div><span style={{color:'#666'}}>Mixture:</span> <strong>{getEmployeeName(task.updatedBy)}</strong></div>
                            <div><span style={{color:'#666'}}>Hlp:</span> {task.employee?.name || "—"}</div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MixtureTasks;