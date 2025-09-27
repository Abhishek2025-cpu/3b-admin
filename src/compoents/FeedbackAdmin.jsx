import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FeedbackAdmin.css";

const baseURL = "https://threebtest.onrender.com/api/feedback";

const FeedbackAdmin = () => {
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [displayedFeedbacks, setDisplayedFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 10; // ✅ 10 entries per page

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ show: false, feedbackId: null });

  const fetchAllFeedbacks = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseURL}/getall/admin`);
      setAllFeedbacks(data.feedbacks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("❌ Failed to fetch feedbacks");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

  // Approve handler with confirm modal
  const handleApproveConfirm = async () => {
    const feedbackId = confirmModal.feedbackId;
    try {
      await axios.patch(`${baseURL}/status/${feedbackId}`, { isEnabled: true });
      toast.success("✅ Feedback approved successfully");
      setAllFeedbacks(prev =>
        prev.map(f => (f._id === feedbackId ? { ...f, isEnabled: true } : f))
      );
      setConfirmModal({ show: false, feedbackId: null });
    } catch (error) {
      console.error("Error approving feedback:", error);
      toast.error("❌ Failed to approve feedback");
    }
  };

  // Filter, Search, Sort
  useEffect(() => {
    let filtered = [...allFeedbacks];

    if (searchTerm) {
      filtered = filtered.filter(
        f =>
          (f.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter(f => f.rating === Number(ratingFilter));
    }

    filtered.sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    setDisplayedFeedbacks(filtered);
    setCurrentPage(1);
  }, [allFeedbacks, searchTerm, ratingFilter, sortOrder]);

  // Pagination
  const indexOfLast = currentPage * feedbacksPerPage;
  const indexOfFirst = indexOfLast - feedbacksPerPage;
  const currentFeedbacks = displayedFeedbacks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(displayedFeedbacks.length / feedbacksPerPage);

  return (
    <div className="feedback-admin-container">
      <ToastContainer position="top-right" autoClose={3000} />
   

      {/* Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by user or message..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select
          className="filter-select"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
        >
          <option value="desc">Newest → Oldest</option>
          <option value="asc">Oldest → Newest</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>User</th>
              <th>Message</th>
              <th>Rating</th>
              <th>Date & Time</th>
              <th>Approved</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentFeedbacks.map((f, index) => (
              <tr key={f._id}>
                <td>{indexOfFirst + index + 1}</td> {/* ✅ Sr. No */}
                <td>{f.user?.name || "N/A"}</td>
                <td>{f.message}</td>
                <td>{f.rating}</td>
                <td>{new Date(f.createdAt).toLocaleString()}</td> {/* ✅ Date & Time */}
                <td>
                  {f.isEnabled ? (
                    <span className="badge-approved">Yes</span>
                  ) : (
                    <span className="badge-pending">No</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-approve"
                    disabled={f.isEnabled} // ✅ Disable if approved
                    onClick={() =>
                      setConfirmModal({ show: true, feedbackId: f._id })
                    }
                  >
                    {f.isEnabled ? "Approved" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active-page" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Approval</h3>
            <p>Are you sure you want to approve this feedback?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmModal({ show: false, feedbackId: null })}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleApproveConfirm}>
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAdmin;
