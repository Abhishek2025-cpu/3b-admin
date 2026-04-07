import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./ReviewTasks.css"; // You can reuse the same CSS file

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
  },[]);

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
      
      let allTasks =[];
      if (Array.isArray(res.data)) allTasks = res.data;
      else if (Array.isArray(res.data?.data)) allTasks = res.data.data;
      else if (Array.isArray(res.data?.tasks)) allTasks = res.data.tasks;

      const filteredTasks = allTasks.filter((task) => {
        if (selectedDate) {
           const taskDate = new Date(task.createdAt).toLocaleDateString("en-CA");
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

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEmployeeName = (id) => {
      if(!id) {
         const emp = allEmployees.find(e => e._id === selectedMixture);
         return emp ? emp.name : "—";
      }
      const emp = allEmployees.find(e => e._id === id);
      return emp ? emp.name : "Unknown";
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