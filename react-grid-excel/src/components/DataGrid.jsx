import React, { useState, useEffect, useCallback } from 'react';
import Pagination from './Pagination';
import { exportToExcel } from '../utils/excelExport';
import '../styles/DataGrid.css';

const DataGrid = ({ dataUrl, data: inputData, pageSize, editableColumns }) => {
  // State
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  // Process data helper function
  const processData = useCallback((jsonData) => {
    let processedData;

    // Handle different data structures
    if (Array.isArray(jsonData)) {
      processedData = jsonData;
    } else if (typeof jsonData === 'object') {
      // If it's an object with an array property, try to find the array
      const arrayProps = Object.keys(jsonData).filter(key => Array.isArray(jsonData[key]));
      if (arrayProps.length > 0) {
        processedData = jsonData[arrayProps[0]];
      } else {
        // Convert object to array if needed
        processedData = [jsonData];
      }
    }

    return processedData;
  }, []);

  // Handle direct data input
  useEffect(() => {
    if (inputData) {
      const processedData = processData(inputData);
      setData(processedData);
      setOriginalData(JSON.parse(JSON.stringify(processedData)));
      setSelectedRows(new Set());
      setSelectAll(false);
      setCurrentPage(1);
      setLoading(false);
    }
  }, [inputData, processData]);

  // Fetch data from URL
  const fetchData = useCallback(async () => {
    // Skip if we have direct input data
    if (inputData) {
      return;
    }
    
    // Only proceed if we have a dataUrl
    if (!dataUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      const processedData = processData(jsonData);

      setData(processedData);
      setOriginalData(JSON.parse(JSON.stringify(processedData)));
      setSelectedRows(new Set());
      setSelectAll(false);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStatus({
        message: `Error loading data: ${error.message}`,
        type: 'error'
      });
      setLoading(false);
    }
  }, [dataUrl, inputData, processData]);

  // Initialize on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      
      exportToExcel(dataToExport, 'datagrid_export.xlsx');
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

  return (
    <div className="data-grid">
      <div className="actions">
        {dataUrl && <button onClick={fetchData}>Refresh Data</button>}
        <button onClick={saveChanges}>Save Changes</button>
        <button onClick={deleteSelected}>Delete Selected</button>
        <button onClick={handleExportToExcel} className="export-btn">Export to Excel</button>
      </div>

      {status.message && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          {data.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-header">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    {Object.keys(data[0]).map(key => (
                      <th key={key}>
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
                      >
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(rowIndex)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleRowSelection(rowIndex, e.target.checked, e);
                            }}
                          />
                        </td>
                        {Object.entries(item).map(([key, value]) => (
                          <td
                            key={`${rowIndex}-${key}`}
                            className={typeof value === 'object' && value !== null ? 'object-cell' : ''}
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
            <div className="status error">No data available</div>
          )}

          {data.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataGrid;