import React from "react";

const ProgressModal = ({ isOpen, onClose, progressData = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Machine Progress Details</h2>
          <button onClick={onClose} className="text-red-600 hover:text-red-800">✕</button>
        </div>

        {(!progressData || progressData.length === 0) ? (
          <p className="text-gray-500 text-center py-8">No progress data found for this item.</p>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {progressData.map((machine) => (
              <div key={machine._id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700">{machine.machine?.name}</h3>
                <p className="text-sm text-gray-500">Shift: {machine.shift}</p>

                <div className="mt-2">
                  <h4 className="font-medium text-gray-700 mb-1">Operator Table:</h4>
                  {machine.operatorTable && machine.operatorTable.length > 0 ? (
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Shift</th>
                          <th className="p-2 border">Time</th>
                          <th className="p-2 border">Frame Length</th>
                          <th className="p-2 border">Box Weight</th>
                          <th className="p-2 border">Frame Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machine.operatorTable.map((row) => (
                          <tr key={row._id}>
                            <td className="p-2 border">{row.shift}</td>
                            <td className="p-2 border">{row.time}</td>
                            <td className="p-2 border">{row.frameLength?.join(", ")}</td>
                            <td className="p-2 border">{row.boxWeight}</td>
                            <td className="p-2 border">{row.frameWeight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-400">No operator table data.</p>
                  )}
                </div>

                {machine.operatorImages?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 mb-1">Images:</h4>
                    <div className="flex flex-wrap gap-2">
                      {machine.operatorImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Operator work"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
