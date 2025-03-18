import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const DataGridDemo = () => {
  // State
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  
  const pageSize = 5; // Smaller page size for demonstration

  // Sample data for demo
  const sampleData = [
    { id: 1, title: "Task 1", completed: true, userId: 1, priority: "High" },
    { id: 2, title: "Task 2", completed: false, userId: 1, priority: "Medium" },
    { id: 3, title: "Task 3", completed: false, userId: 2, priority: "Low" },
    { id: 4, title: "Task 4", completed: true, userId: 2, priority: "High" },
    { id: 5, title: "Task 5", completed: false, userId: 3, priority: "Medium" },
    { id: 6, title: "Task 6", completed: true, userId: 3, priority: "Low" },
    { id: 7, title: "Task 7", completed: false, userId: 4, priority: "High" },
    { id: 8, title: "Task 8", completed: true, userId: 4, priority: "Medium" },
    { id: 9, title: "Task 9", completed: false, userId: 5, priority: "Low" },
    { id: 10, title: "Task 10", completed: true, userId: 5, priority: "High" },
    { id: 11, title: "Task 11", completed: false, userId: 6, priority: "Medium" },
    { id: 12, title: "Task 12", completed: true, userId: 6, priority: "Low" },
  ];

  // Fetch data (simulated for demo)
  const fetchData = () => {
    setLoading(true);
    setStatus({ message: '', type: '' });

    // Simulate API call
    setTimeout(() => {
      setData([...sampleData]);
      setOriginalData([...sampleData]);
      setSelectedRows(new Set());
      setSelectAll(false);
      setCurrentPage(1);
      setLoading(false);
    }, 800);
  };

  // Initialize on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Format value for display
  const formatValueForDisplay = (value) => {
    if (value === null || value === undefined) {
      return '';
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    } else {
      return String(value);
    }
  };

  // Handle row selection
  const toggleRowSelection = (index, selected, event) => {
    const newSelectedRows = new Set(selectedRows);

    if (event.shiftKey && lastSelectedIndex !== null) {
      // Select range of rows
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      for (let i = start; i <= end; i++) {
        newSelectedRows.add(i);
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle individual row selection
      if (selected) {
        newSelectedRows.add(index);
      } else {
        newSelectedRows.delete(index);
      }
    } else {
      // Single selection behavior
      if (selected) {
        newSelectedRows.add(index);
      } else {
        newSelectedRows.delete(index);
      }
    }

    setLastSelectedIndex(index);
    setSelectedRows(newSelectedRows);
    updateSelectAllState(newSelectedRows);
  };

  // Handle row click
  const handleRowClick = (index, event) => {
    if (event.target.type !== 'checkbox') {
      const isSelected = selectedRows.has(index);
      toggleRowSelection(index, !isSelected, event);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedRows = new Set(selectedRows);
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, data.length);

    for (let i = start; i < end; i++) {
      if (newSelectAll) {
        newSelectedRows.add(i);
      } else {
        newSelectedRows.delete(i);
      }
    }

    setSelectedRows(newSelectedRows);
  };

  // Update select all checkbox state
  const updateSelectAllState = (selected) => {
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, data.length);

    let allSelected = true;
    for (let i = start; i < end; i++) {
      if (!selected.has(i)) {
        allSelected = false;
        break;
      }
    }

    setSelectAll(allSelected);
  };

  // Save changes
  const saveChanges = () => {
    setStatus({ message: 'Changes saved successfully!', type: 'success' });
    setOriginalData(JSON.parse(JSON.stringify(data)));

    // Clear status after 3 seconds
    setTimeout(() => {
      setStatus({ message: '', type: '' });
    }, 3000);
  };

  // Delete selected rows
  const deleteSelected = () => {
    if (selectedRows.size === 0) {
      setStatus({ message: 'No rows selected', type: 'error' });
      return;
    }

    // Convert Set to Array and sort in descending order
    const indicesToDelete = Array.from(selectedRows).sort((a, b) => b - a);

    // Create a new array without the deleted items
    const newData = [...data];
    indicesToDelete.forEach(index => {
      newData.splice(index, 1);
    });

    setData(newData);
    setSelectedRows(new Set());
    setSelectAll(false);

    // Adjust current page if needed
    const totalPages = Math.ceil(newData.length / pageSize);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }

    setStatus({ message: `Deleted ${indicesToDelete.length} row(s)`, type: 'success' });
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    try {
      // Determine which data to export: all data or only selected rows
      let dataToExport = [];
      
      if (selectedRows.size > 0) {
        // Export only selected rows
        Array.from(selectedRows).sort((a, b) => a - b).forEach(index => {
          dataToExport.push(data[index]);
        });
      } else {
        // Export all data
        dataToExport = data;
      }
      
      if (dataToExport.length === 0) {
        setStatus({ message: 'No data to export', type: 'error' });
        return;
      }
      
      setStatus({ message: `Exported ${dataToExport.length} row(s) to Excel`, type: 'success' });
      
      // Hide status after 3 seconds
      setTimeout(() => {
        setStatus({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setStatus({ message: `Error exporting to Excel: ${error.message}`, type: 'error' });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const currentPageData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Pagination component
  const Pagination = () => {
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    return (
      <div className="flex justify-center mt-4 gap-1">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ←
        </button>

        {[...Array(endPage - startPage + 1)].map((_, i) => {
          const pageNumber = startPage + i;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-1 rounded ${
                pageNumber === currentPage ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">DataGrid with Checkboxes</h1>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh Data
        </button>
        <button 
          onClick={saveChanges} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Changes
        </button>
        <button 
          onClick={deleteSelected} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Delete Selected
        </button>
        <button 
          onClick={handleExportToExcel} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export to Excel
        </button>
      </div>

      {status.message && (
        <div className={`p-3 rounded mb-4 ${
          status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status.message}
        </div>
      )}

      {loading ? (
        <div className="text-center p-6 italic text-gray-500">Loading data...</div>
      ) : (
        <>
          {data.length > 0 ? (
            <div className="overflow-x-auto border rounded">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="transform scale-125"
                      />
                    </th>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="p-2 border-b">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((item, index) => {
                    const rowIndex = (currentPage - 1) * pageSize + index;
                    return (
                      <tr
                        key={rowIndex}
                        onClick={(e) => handleRowClick(rowIndex, e)}
                        className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer`}
                      >
                        <td className="p-2 border-b text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(rowIndex)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleRowSelection(rowIndex, e.target.checked, e);
                            }}
                            className="transform scale-125"
                          />
                        </td>
                        {Object.entries(item).map(([key, value]) => (
                          <td
                            key={`${rowIndex}-${key}`}
                            className={`p-2 border-b ${
                              typeof value === 'object' && value !== null ? 'font-mono text-sm whitespace-pre-wrap max-w-xs overflow-auto' : ''
                            }`}
                          >
                            {formatValueForDisplay(value)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 p-3 rounded">No data available</div>
          )}

          {data.length > 0 && <Pagination />}
        </>
      )}
    </div>
  );
};

export default DataGridDemo;