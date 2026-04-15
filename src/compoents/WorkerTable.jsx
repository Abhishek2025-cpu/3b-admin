import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import "./ReviewTasks.css";

const WorkerTable = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editedRows, setEditedRows] = useState({});

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await axios.get(
          "https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees"
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const onlyWorkers = list.filter(emp => {
          if (!emp.role) return false;
          const roles = Array.isArray(emp.role) ? emp.role : [emp.role];
          return roles.some(r => 
            r.toLowerCase().includes("helper") || r.toLowerCase().includes("worker")
          );
        });

        setWorkers(onlyWorkers);
      } catch (err) {
        toast.error("Could not load worker list");
      }
    };
    fetchWorkers();
  }, []);

  const fetchTasks = async () => {
    if (!selectedWorker) {
      toast.error("Please select a Worker first");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `https://threebapi-1067354145699.asia-south1.run.app/api/workers/employee-task/${selectedWorker}`
      );

      let allTasks = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.tasks || []);

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
        toast("No tasks found.", { icon: "ℹ️" });
      } else {
        toast.success(`Found ${filteredTasks.length} tasks`);
      }
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (tasks.length === 0) {
      toast.error("No data to download");
      return;
    }

    const excelData = tasks.map((t, idx) => ({
      "S.No": idx + 1,
      "Date": new Date(t.createdAt).toLocaleDateString("en-GB"),
      "Submit Time": formatTime(t.createdAt),
      "Correction Time": formatTime(t.updatedAt),
      "Worker Name": getWorkerName(t.employee),
      "Operator": t.updatedBy?.name || t.updatedBy || "—",
      "Frame Lengths": Array.isArray(t.frameLength) ? t.frameLength.join(", ") : t.frameLength,
      "No. Boxes": t.numberOfBox,
      "Box Weight": t.boxWeight,
      "Frame Weight": t.frameWeight,
      "Description": t.description || "—",
      "Selfie URL": t.selfie?.url || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Worker Tasks");
    XLSX.writeFile(workbook, `Worker_Tasks_${selectedDate || "All"}.xlsx`);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWorkerName = (idOrObj) => {
    if (!idOrObj && selectedWorker) {
      const w = workers.find(o => o._id === selectedWorker);
      return w ? w.name : "—";
    }
    if (typeof idOrObj === 'object') return idOrObj?.name || "—";
    const w = workers.find(o => o._id === idOrObj);
    return w ? w.name : "Unknown";
  };

  return (
    <div className="review-task-page container">
      <Toaster position="top-right" />
      <h1 className="page-title">Worker Validated Tasks</h1>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2 min-w-[240px] flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Worker Name</label>
            <div className="relative">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-800 shadow-sm outline-none cursor-pointer"
              >
                <option value="" disabled>Select Worker</option>
                {workers.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchTasks}
              disabled={!selectedWorker}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-md transition-all ${!selectedWorker ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Get Data
            </button>
            <button
              onClick={downloadExcel}
              disabled={tasks.length === 0}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-md transition-all ${tasks.length === 0 ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Excel
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
                  <th>Selfie</th>
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
                  <tr><td colSpan="10" className="empty">No tasks found</td></tr>
                ) : (
                  tasks.map((task, idx) => (
                    <tr key={task._id}>
                      <td>{idx + 1}</td>
                      <td>
                        {task.selfie?.url ? (
                          <a href={task.selfie.url} target="_blank" rel="noreferrer">
                            <img 
                              src={task.selfie.url} 
                              alt="selfie" 
                              className="w-24 h-24 rounded-lg object-cover border-2 border-gray-100 shadow-sm hover:scale-105 transition-transform"
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No Image</span>
                        )}
                      </td>
                      <td><span className="badge time">{formatTime(task.createdAt)}</span></td>
                      <td><span className="badge time" style={{ background: '#e3f2fd', color: '#0056b3' }}>{formatTime(task.updatedAt)}</span></td>
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
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                          <div><span style={{ color: '#666' }}>Op:</span> {task.updatedBy?.name || task.updatedBy || "—"}</div>
                          <div><span style={{ color: '#666' }}>Hlp:</span> <strong>{getWorkerName(task.employee)}</strong></div>
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

export default WorkerTable;