import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DoubtCreation = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // Use userService to upload file
      const response = await userService.uploadImage(file);
      console.log("Upload response:", response);

      if (response.file?.extractedText) {
        localStorage.setItem(`doubt:${response.doubtId}:text`, response.file.extractedText);
      }
  
      // Match with teacher if doubtId is returned
      if (response.doubtId) {
        const matchResponse = await userService.matchDoubt(response.doubtId);
        console.log("Match response:", matchResponse);
  
        // Navigate with matched data
        navigate(`/doubt/${response.doubtId}/matched`, {
          state: {
            matchedData: matchResponse
          }
        });
      }
    } catch (error) {
      console.error('Error creating doubt:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black/40 rounded-lg border border-white/10 mt-24">
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          id="doubt-file"
        />
        <label htmlFor="doubt-file" className="cursor-pointer block">
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-[#00FF9D]" />
            <p className="text-lg mb-2">Upload your doubt image</p>
          </div>
        </label>
        {file && (
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-2 bg-[#00FF9D]/10 text-[#00FF9D] rounded-lg"
          >
            {loading ? 'Uploading...' : 'Submit Doubt'}
          </button>
        )}
      </form>
    </div>
  );
};

export default DoubtCreation;