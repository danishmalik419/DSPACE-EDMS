import React, { useState, useEffect } from 'react';
import { Home, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MetadataRegistry = () => {
  const [metadataSchemas, setMetadataSchemas] = useState([]);

  // States for create schema form
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDescription, setNewSchemaDescription] = useState('');

  const navigate = useNavigate();

  // Fetch all metadata schemas on component mount using async/await
  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/metadata/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await response.json();
        if (json.success) {
          setMetadataSchemas(json.data);
        } else {
          console.error('Error fetching metadata schemas:', json.message);
        }
      } catch (error) {
        console.error('Error fetching metadata schemas:', error);
      }
    };

    fetchSchemas();
  }, []);

  // Handle creation of new metadata schema using async/await
  const handleCreateSchema = async () => {
    const payload = {
      name: newSchemaName,
      description: newSchemaDescription,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/metadata/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const newSchemaResponse = await response.json();
      if (newSchemaResponse.success) {
        // Append the newly created schema to the list
        setMetadataSchemas(prev => [...prev, newSchemaResponse.data]);
        // Reset the form fields
        setNewSchemaName('');
        setNewSchemaDescription('');
      } else {
        console.error('Error creating new metadata schema:', newSchemaResponse.message);
      }
    } catch (error) {
      console.error('Error creating new metadata schema:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-orange-500 text-white p-2 pl-48">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="text-white">Home</a> &gt; Metadata Registry
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 pl-20 pr-20">
        <h1 className="text-2xl font-medium text-gray-700 mb-4">Metadata Registry</h1>
        <div className="border-b border-gray-400 mb-4"></div>

        <p className="text-sm text-gray-600 mb-4">
          The metadata registry maintains a list of all metadata fields available in the repository.
        </p>

        {/* Create Metadata Schema */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-3">Create Metadata Schema</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                placeholder="Enter schema name"
                className="w-full border border-gray-300 rounded p-2"
                value={newSchemaName}
                onChange={(e) => setNewSchemaName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <input
                type="text"
                placeholder="Enter schema description"
                className="w-full border border-gray-300 rounded p-2"
                value={newSchemaDescription}
                onChange={(e) => setNewSchemaDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 border border-orange-500 text-orange-500 rounded">
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-orange-500 text-white rounded flex items-center"
              onClick={handleCreateSchema}
            >
              <Save size={16} className="mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="text-sm text-gray-500 mb-2">
            Now Showing {metadataSchemas.length} of {metadataSchemas.length}
          </div>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300 text-left">ID</th>
                <th className="p-2 border border-gray-300 text-left">Name</th>
                <th className="p-2 border border-gray-300 text-left">Description</th>
                <th className="p-2 border border-gray-300 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {metadataSchemas.map((schema) => (
                <tr key={schema.id} className="bg-white">
                  <td className="p-2 border border-gray-300">{schema.id}</td>
                  <td className="p-2 border border-gray-300">{schema.name}</td>
                  <td className="p-2 border border-gray-300">{schema.description}</td>
                  <td className="p-2 border border-gray-300">
                    <button 
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={()=>navigate(`/metadataSchema/${schema.id}`)}
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetadataRegistry;