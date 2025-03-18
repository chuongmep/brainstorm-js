import React from 'react';
import DataGrid from './components/DataGrid';
import './App.css';

function App() {
  // Sample data that you would normally fetch or import
  const sampleData = [
    { id: 1, title: "Task 1", completed: false },
    { id: 2, title: "Task 2", completed: true },
    { id: 3, title: "Task 3", completed: false },
    // ... more data
  ];

  return (
    <div className="container">
      <h1>DataGrid with Checkboxes</h1>
      <DataGrid
        data={sampleData}  // Pass data directly
        // dataUrl="./assets/data.json"  // You can comment this out or remove it
        pageSize={10}
        editableColumns={['title', 'completed']}
      />
    </div>
  );
}

export default App;