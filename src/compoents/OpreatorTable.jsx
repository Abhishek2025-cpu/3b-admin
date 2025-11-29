import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./ReviewTasks.css"; 

// Simple Edit Icon
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer", color: "#007bff" }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const OperatorTable = () => {
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editedRows, setEditedRows] = useState({});

  // 1. Fetch Employees & Filter for 'Operator' Role ONLY
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await axios.get(
          "https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees"
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        
        // Filter: Role must contain "operator" (case-insensitive)
        const onlyOperators = list.filter(emp => 
            emp.role && emp.role.toLowerCase().includes("operator")
        );
        
        setOperators(onlyOperators);
      } catch (err) {
        console.error("Error fetching staff:", err);
        toast.error("Could not load operator list");
      }
    };
    fetchOperators();
  }, []);

  // 2. Fetch Tasks & Match updatedBy ID
  const fetchTasks = async () => {
    if (!selectedOperator) {
      toast.error("Please select an Operator first");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        "https://threebapi-1067354145699.asia-south1.run.app/api/workers/get-task"
      );
      
      const allTasks = res.data?.data || [];

      // Filter Logic
      const filteredTasks = allTasks.filter((task) => {
        // MATCH LOGIC: Check both String ID and Object ID scenarios
        let isUpdatedByMatch = false;

        if (task.updatedBy) {
            if (typeof task.updatedBy === 'string') {
                // If API returns "updatedBy": "ID_STRING"
                isUpdatedByMatch = task.updatedBy === selectedOperator;
            } else if (typeof task.updatedBy === 'object' && task.updatedBy._id) {
                // If API returns "updatedBy": { "_id": "ID_STRING" }
                isUpdatedByMatch = task.updatedBy._id === selectedOperator;
            }
        }

        // DATE LOGIC (Optional)
        let isDateMatch = true;
        if (selectedDate) {
           const taskDate = new Date(task.createdAt).toLocaleDateString("en-CA");
           isDateMatch = taskDate === selectedDate;
        }

        return isUpdatedByMatch && isDateMatch;
      });

      setTasks(filteredTasks);
      setEditedRows({}); 
      
      if (filteredTasks.length === 0) {
        toast("No validated tasks found for this operator.", { icon: "ℹ️" });
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

  // 3. Edit Handler
  const handleToggleEdit = async (taskId) => {
    const isEditing = editedRows[taskId]?.__editing;

    if (isEditing) {
      // === SAVE ===
      try {
        const dataToSave = editedRows[taskId];
        const cleanFrameLength = dataToSave.frameLength.filter(str => str && str.toString().trim() !== "");

        const payload = {
          numberOfBox: dataToSave.numberOfBox,
          boxWeight: isNaN(Number(dataToSave.boxWeight)) ? dataToSave.boxWeight : `${dataToSave.boxWeight}kg`,
          frameWeight: isNaN(Number(dataToSave.frameWeight)) ? dataToSave.frameWeight : `${dataToSave.frameWeight}kg`,
          frameLength: cleanFrameLength,
          description: dataToSave.description,
        };

        await axios.put(
          `https://threebapi-1067354145699.asia-south1.run.app/api/workers/update-task/${taskId}`,
          payload
        );

        setTasks(prev => prev.map(t => (t._id === taskId ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t)));
        setEditedRows(prev => ({ ...prev, [taskId]: { ...prev[taskId], __editing: false } }));
        toast.success("Updated Successfully!");

      } catch (err) {
        console.error(err);
        toast.error("Update failed.");
      }

    } else {
      // === EDIT START ===
      setEditedRows((prev) => {
        const t = tasks.find((x) => x._id === taskId);
        return {
          ...prev,
          [taskId]: {
            numberOfBox: t?.numberOfBox ?? "",
            boxWeight: String(t?.boxWeight ?? "").replace(/kg$/i, "").trim(),
            frameWeight: String(t?.frameWeight ?? "").replace(/kg$/i, "").trim(),
            
            // Logic: Ensure it's always an array for mapping inputs
            frameLength: Array.isArray(t?.frameLength) 
              ? [...t.frameLength] 
              : (t?.frameLength ? [t.frameLength] : [""]),
            
            description: t?.description ?? "",
            __editing: true,
          },
        };
      });
    }
  };

  // Input Handlers
  const handleArrayChange = (taskId, index, value) => {
    setEditedRows(prev => {
      const newArr = [...prev[taskId].frameLength];
      newArr[index] = value;
      return { ...prev, [taskId]: { ...prev[taskId], frameLength: newArr } };
    });
  };

  const addArrayField = (taskId) => {
    setEditedRows(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], frameLength: [...prev[taskId].frameLength, ""] }
    }));
  };

  const handleFieldChange = (taskId, field, value) => {
    setEditedRows(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value }
    }));
  };

  const handleCancel = (taskId) => {
    setEditedRows(prev => ({ ...prev, [taskId]: { ...prev[taskId], __editing: false } }));
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to get Operator Name (since updatedBy might be ID string)
  const getOperatorName = (idOrObj) => {
      if(!idOrObj) return "—";
      if(typeof idOrObj === 'object') return idOrObj.name;
      // If it's a string ID, try to find it in our operator list
      const op = operators.find(o => o._id === idOrObj);
      return op ? op.name : "Unknown ID";
  };

  return (
    <div className="review-task-page container">
      <Toaster position="top-right" />
      
      <h1 className="page-title">Operator Validated Tasks</h1>

      {/* --- TOP BAR: Only Operator Dropdown & Date --- */}
      <div className="filters-wrapper">
        <div className="filter">
          <label>Operator Name</label>
          <select value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)}>
            <option value="">-- Select Operator --</option>
            {operators.map(op => (
              <option key={op._id} value={op._id}>{op.name}</option>
            ))}
          </select>
        </div>

        <div className="filter">
          <label>Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div className="filter actions">
          <button className="btn primary" onClick={fetchTasks} disabled={!selectedOperator}>
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
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan="10" className="empty">No tasks found for selected criteria</td></tr>
                )}

                {tasks.map((task, idx) => {
                  const edit = editedRows[task._id] || {};
                  const isEditing = Boolean(edit.__editing);

                  return (
                    <tr key={task._id}>
                      <td>{idx + 1}</td>
                      
                      {/* Submit Time */}
                      <td><span className="badge time">{formatTime(task.createdAt)}</span></td>

                      {/* Correction Time */}
                      <td><span className="badge time" style={{background: '#e3f2fd', color: '#0056b3'}}>{formatTime(task.updatedAt)}</span></td>

                      {/* Frame Length (Array) */}
                      <td>
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            {edit.frameLength.map((val, i) => (
                              <input 
                                key={i}
                                className="small-input mb-1"
                                value={val}
                                onChange={(e) => handleArrayChange(task._id, i, e.target.value)}
                                placeholder="Length"
                              />
                            ))}
                            <button className="text-blue-500 text-xs mt-1" onClick={() => addArrayField(task._id)}>+ Add Field</button>
                          </div>
                        ) : (
                          <div className="frame-badges">
                             {Array.isArray(task.frameLength) 
                                ? task.frameLength.map((f, i) => <span key={i} className="badge frame">{f}</span>)
                                : <span className="badge frame">{task.frameLength}</span>
                             }
                          </div>
                        )}
                      </td>

                      {/* Fields */}
                      <td>{isEditing ? <input className="small-input" value={edit.numberOfBox} onChange={(e) => handleFieldChange(task._id, 'numberOfBox', e.target.value)} /> : task.numberOfBox}</td>
                      <td>{isEditing ? <input className="small-input" value={edit.boxWeight} onChange={(e) => handleFieldChange(task._id, 'boxWeight', e.target.value)} /> : task.boxWeight}</td>
                      <td>{isEditing ? <input className="small-input" value={edit.frameWeight} onChange={(e) => handleFieldChange(task._id, 'frameWeight', e.target.value)} /> : task.frameWeight}</td>
                      <td>{isEditing ? <textarea className="desc-input" value={edit.description} onChange={(e) => handleFieldChange(task._id, 'description', e.target.value)} /> : (task.description || "—")}</td>

                      {/* Names Column */}
                      <td>
                        <div style={{fontSize: '0.8rem', lineHeight:'1.5'}}>
                            <div><span style={{color:'#666'}}>Op:</span> <strong>{getOperatorName(task.updatedBy)}</strong></div>
                            <div><span style={{color:'#666'}}>Hlp:</span> {task.employee?.name || "—"}</div>
                        </div>
                      </td>

                      {/* Action */}
                      <td>
                        {/* {isEditing ? (
                           <div className="row-actions">
                             <button className="btn small primary" onClick={() => handleToggleEdit(task._id)}>Save</button>
                             <button className="btn small outline" onClick={() => handleCancel(task._id)}>X</button>
                           </div>
                        ) : (
                        //    <div onClick={() => handleToggleEdit(task._id)} title="Edit Row">
                        //      <EditIcon />
                        //    </div>
                        )} */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorTable;