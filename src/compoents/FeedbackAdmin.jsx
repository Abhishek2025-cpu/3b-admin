import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FeedbackAdmin.css'; // We'll create this CSS file for styling

const API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app';

const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch all feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/feedback/getall/admin`);
      // The sample response doesn't include `isEnabled`, but our backend does.
      // We assume it's coming from the API now.
      setFeedbacks(response.data.feedbacks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch feedbacks. Please try again later.');
      toast.error('Could not load feedback data.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Function to handle toggling the feedback status
  const handleToggleStatus = async (feedbackId, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Optimistically update the UI for a better user experience
    setFeedbacks(prevFeedbacks =>
      prevFeedbacks.map(fb =>
        fb._id === feedbackId ? { ...fb, isEnabled: newStatus } : fb
      )
    );

    try {
      await axios.patch(`${API_BASE_URL}/api/feedback/status/${feedbackId}`, {
        isEnabled: newStatus,
      });
      toast.success('✅ Status updated successfully!');
    } catch (err) {
      // If the API call fails, revert the change and show an error
      setFeedbacks(prevFeedbacks =>
        prevFeedbacks.map(fb =>
          fb._id === feedbackId ? { ...fb, isEnabled: currentStatus } : fb
        )
      );
      toast.error('❌ Failed to update status. Please try again.');
      console.error('Toggle status error:', err);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading feedback...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="feedback-admin-container">
      <h2>All User Feedbacks</h2>
      <table className="feedback-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Message</th>
            <th>Rating</th>
            <th>Date</th>
            <th>Privacy</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <tr key={feedback._id}>
                <td>{feedback.user?.name || 'Unknown User'}</td>
                <td className="message-cell">{feedback.message}</td>
                <td>{'⭐'.repeat(feedback.rating)}</td>
                <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                <td>{feedback.isPrivate ? 'Private' : 'Public'}</td>
                <td>
                  <span className={`status-badge ${feedback.isEnabled ? 'status-enabled' : 'status-disabled'}`}>
                    {feedback.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td>
                 <button
  onClick={() => handleToggleStatus(feedback._id, feedback.isEnabled)}
  className={`toggle-button ${feedback.isEnabled ? 'toggle-disable' : 'toggle-enable'}`}
  style={{ color: 'white' }}
>
  {feedback.isEnabled ? 'Disable' : 'Enable'}
</button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No feedback found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackAdmin;