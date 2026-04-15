import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import "./ReviewTasks.css";

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
    setTasks([]);
    try {
      const res = await axios.get(
        `https://threebapi-1067354145699.asia-south1.run.app/api/workers/employee-task/${selectedMixture}`
      );

      let allTasks = [];
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
        toast("No validated tasks found.", { icon: "ℹ️" });
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
      toast.error("No data available to download");
      return;
    }

    const excelData = tasks.map((task, idx) => ({
      "S.No": idx + 1,
      "Date": new Date(task.createdAt).toLocaleDateString("en-GB"),
      "Submit Time": formatTime(task.createdAt),
      "Correction Time": formatTime(task.updatedAt),
      "Mixture Name": getEmployeeName(task.updatedBy),
      "Helper Name": task.employee?.name || "—",
      "Frame Lengths": Array.isArray(task.frameLength) ? task.frameLength.join(", ") : task.frameLength,
      "No. of Boxes": task.numberOfBox,
      "Box Weight": task.boxWeight,
      "Frame Weight": task.frameWeight,
      "Description": task.description || "—",
      "Selfie URL": task.selfie?.url || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mixture Tasks");
    XLSX.writeFile(workbook, `Mixture_Tasks_${selectedDate || "All"}.xlsx`);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEmployeeName = (id) => {
    if (!id) {
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

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2 min-w-[240px] flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
              Mixture Name
            </label>
            <div className="relative">
              <select
                value={selectedMixture}
                onChange={(e) => setSelectedMixture(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-800 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"
              >
                <option value="" disabled className="text-gray-400">
                  Select Mixture
                </option>
                {mixtures.map((mix) => (
                  <option key={mix._id} value={mix._id}>
                    {mix.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

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

          <div className="flex gap-2">
            <button
              onClick={fetchTasks}
              disabled={!selectedMixture}
              className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all focus:outline-none focus:ring-4 ${
                !selectedMixture
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 active:scale-95 shadow-md shadow-blue-100'
              }`}
            >
              Get Data
            </button>

            <button
              onClick={downloadExcel}
              disabled={tasks.length === 0}
              className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all focus:outline-none focus:ring-4 ${
                tasks.length === 0
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-300 active:scale-95 shadow-md shadow-green-100'
              }`}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
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
                  <tr><td colSpan="10" className="empty">No tasks found for selected criteria</td></tr>
                ) : (
                  tasks.map((task, idx) => (
                    <tr key={task._id}>
                      <td>{idx + 1}</td>
                      <td>
                        {task.selfie?.url ? (
                          <a href={task.selfie.url} target="_blank" rel="noreferrer">
                            <img 
                              src={task.selfie.url} 
                              alt="task" 
                              className="w-24 h-24 rounded-lg object-cover border-2 border-gray-100 hover:scale-105 transition-transform cursor-zoom-in shadow-sm"
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
                      <td>{task.boxWeight} kg</td>
                      <td>{task.frameWeight} kg</td>
                      <td>{task.description || "—"}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                          <div><span className="text-gray-500">Mixture:</span> <strong className="text-blue-700">{getEmployeeName(task.updatedBy)}</strong></div>
                          <div><span className="text-gray-500">Helper:</span> <span className="font-medium">{task.employee?.name || "—"}</span></div>
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