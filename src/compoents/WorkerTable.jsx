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

const WorkerTable = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editedRows, setEditedRows] = useState({});

  // 1. Fetch Employees & Filter for 'Helper' or 'Worker' Role ONLY
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await axios.get(
          "https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees"
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Filter logic for Workers/Helpers
        const onlyWorkers = list.filter(emp => {
          if (!emp.role) return false;
          if (Array.isArray(emp.role)) {
            return emp.role.some(r => r.toLowerCase().includes("helper") || r.toLowerCase().includes("worker"));
          } else if (typeof emp.role === 'string') {
            return emp.role.toLowerCase().includes("helper") || emp.role.toLowerCase().includes("worker");
          }
          return false;
        });

        setWorkers(onlyWorkers);
      } catch (err) {
        console.error("Error fetching staff:", err);
        toast.error("Could not load worker list");
      }
    };
    fetchWorkers();
  }, []);

  // 2. Fetch Tasks using the New API Endpoint
  const fetchTasks = async () => {
    if (!selectedWorker) {
      toast.error("Please select a Worker first");
      return;
    }

    setLoading(true);
    try {
      // API call to get tasks for the selected worker
      const res = await axios.get(
        `https://threebapi-1067354145699.asia-south1.run.app/api/workers/employee-task/${selectedWorker}?lang=kn`
      );

      let allTasks = [];
      if (Array.isArray(res.data)) allTasks = res.data;
      else if (Array.isArray(res.data?.data)) allTasks = res.data.data;
      else if (Array.isArray(res.data?.tasks)) allTasks = res.data.tasks;

      // Filter Logic (Only Date needed now, since API already filters by Worker)
      const filteredTasks = allTasks.filter((task) => {
        if (selectedDate) {
          const taskDate = new Date(task.createdAt).toLocaleDateString("en-CA");
          return taskDate === selectedDate;
        }
        return true;
      });

      setTasks(filteredTasks);
      setEditedRows({});

      if (filteredTasks.length === 0) {
        toast("No validated tasks found for this worker.", { icon: "ℹ️" });
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

  // Helper to get Worker Name
  const getWorkerName = (idOrObj) => {
    if (!idOrObj && selectedWorker) {
      const w = workers.find(o => o._id === selectedWorker);
      return w ? w.name : "—";
    }
    if (typeof idOrObj === 'object') return idOrObj.name;
    const w = workers.find(o => o._id === idOrObj);
    return w ? w.name : "Unknown ID";
  };

  return (
    <div className="review-task-page container">
      <Toaster position="top-right" />

      <h1 className="page-title">Worker Validated Tasks</h1>

      {/* --- TOP BAR: Worker Dropdown & Date --- */}
      {/* --- TOP BAR: Enhanced Worker Filter Wrapper --- */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">

          {/* Worker Name Filter */}
          <div className="flex flex-col gap-2 min-w-[240px] flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
              Worker Name
            </label>
            <div className="relative">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-800 shadow-sm transition-all 
                hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"
              >
                <option value="" disabled className="text-gray-400">
                  Select Worker
                </option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>

              {/* Custom Arrow Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Action Button */}
          <div className="flex-none">
            <button
              onClick={fetchTasks}
              disabled={!selectedWorker}
              className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all focus:outline-none focus:ring-4 
          ${!selectedWorker
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 active:scale-95 shadow-md shadow-blue-100'
                }`}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Get Data
            </button>
          </div>

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
                      <td><span className="badge time" style={{ background: '#e3f2fd', color: '#0056b3' }}>{formatTime(task.updatedAt)}</span></td>

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
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                          <div><span style={{ color: '#666' }}>Op:</span> {task.updatedBy?.name || task.updatedBy || "—"}</div>
                          <div><span style={{ color: '#666' }}>Hlp:</span> <strong>{getWorkerName(task.employee)}</strong></div>
                        </div>
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

export default WorkerTable;