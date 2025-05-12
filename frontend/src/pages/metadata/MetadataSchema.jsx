import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';

const MetadataSchema = () => {
  const { schemaId } = useParams();
  const [fields, setFields] = useState([]);
  const [schemaDetails, setSchemaDetails] = useState(null);
  
  // States for create field form
  const [element, setElement] = useState('');
  const [qualifier, setQualifier] = useState('');
  const [scopeNote, setScopeNote] = useState('');

  // Fetch fields and schema details on component mount using async/await
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/metadata/schema/${schemaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await response.json();
        if (json.success) {
          setFields(json.data);
          // If fields exist, extract schema details from the first field's "schema" property
          if (json.data.length > 0 && json.data[0].schema) {
            setSchemaDetails(json.data[0].schema);
          }
        } else {
          console.error('Error fetching metadata fields:', json.message);
        }
      } catch (error) {
        console.error('Error fetching metadata fields:', error);
      }
    };

    fetchFields();
  }, [schemaId]);

  // Handle creation of new metadata field using async/await
  const handleCreateField = async () => {
    const payload = { element, qualifier, scopeNote };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/metadata/schema/${schemaId}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const newFieldResponse = await response.json();
      if (newFieldResponse.success) {
        // Append the newly created field to the list
        setFields(prev => [...prev, newFieldResponse.data]);
        // Reset form fields
        setElement('');
        setQualifier('');
        setScopeNote('');
      } else {
        console.error('Error creating field:', newFieldResponse.message);
      }
    } catch (error) {
      console.error('Error creating field:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-orange-500 text-white p-2 pl-48">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="text-white">Home</a> &gt; {schemaDetails ? `Metadata Schema: "${schemaDetails.name}"` : "Metadata Schema"}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 pl-20 pr-20">
        <h1 className="text-3xl font-medium text-gray-700 mb-4">
          {schemaDetails ? `Metadata Schema: "${schemaDetails.name}"` : "Metadata Schema"}
        </h1>
        <div className="border-b border-gray-400 mb-4"></div>

        <p className="text-sm text-gray-600 mb-4">
          {schemaDetails ? schemaDetails.description : "Loading schema details..."}
        </p>

        {/* Create Metadata Field */}
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-gray-700 mb-3">Create Metadata Field</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Element *</label>
              <input
                type="text"
                placeholder="Enter element"
                className="w-full border border-gray-300 rounded p-2"
                value={element}
                onChange={(e) => setElement(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qualifier *</label>
              <input
                type="text"
                placeholder="Enter qualifier"
                className="w-full border border-gray-300 rounded p-2"
                value={qualifier}
                onChange={(e) => setQualifier(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Scope note *</label>
            <input
              type="text"
              placeholder="Enter scope note"
              className="w-full border border-gray-300 rounded p-2"
              value={scopeNote}
              onChange={(e) => setScopeNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 border border-orange-500 text-orange-500 rounded">
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-orange-500 text-white rounded flex items-center"
              onClick={handleCreateField}
            >
              <Save size={16} className="mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Table for metadata fields */}
        <div>
          <div className="text-sm text-gray-500 mb-2">
            Now Showing {fields.length} of {fields.length}
          </div>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300 text-left">Element</th>
                <th className="p-2 border border-gray-300 text-left">Qualifier</th>
                <th className="p-2 border border-gray-300 text-left">Scope Note</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="bg-white">
                  <td className="p-2 border border-gray-300">{field.element}</td>
                  <td className="p-2 border border-gray-300">{field.qualifier}</td>
                  <td className="p-2 border border-gray-300">{field.scopeNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetadataSchema;