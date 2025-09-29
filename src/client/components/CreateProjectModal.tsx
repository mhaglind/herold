/**
 * Create Project Modal
 * Modal component for creating new family tree projects
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services';
import { ApiClientError } from '../services/api-config';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mainPersonId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || `Family tree for ${formData.name.trim()}`,
        ...(formData.mainPersonId.trim() && { mainPersonId: formData.mainPersonId.trim() })
      };

      const project = await projectService.createProject(projectData);

      // Reset form
      setFormData({ name: '', description: '', mainPersonId: '' });
      onClose();

      // Navigate to the new project
      navigate(`/project/${project.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', description: '', mainPersonId: '' });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Family Tree</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Project Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={isLoading}
              placeholder="e.g., The Smith Family, Huset Halling"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              disabled={isLoading}
              placeholder="Brief description of your family tree project"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 resize-none"
            />
          </div>

          {/* Main Person ID (Advanced) */}
          <details className="mb-4">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Advanced Options
            </summary>
            <div className="mt-3">
              <label htmlFor="mainPersonId" className="block text-sm font-medium text-gray-700 mb-2">
                Main Person ID
              </label>
              <input
                type="text"
                id="mainPersonId"
                value={formData.mainPersonId}
                onChange={handleInputChange('mainPersonId')}
                disabled={isLoading}
                placeholder="huvudperson (leave empty for default)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Custom ID for the main person in your family tree
              </p>
            </div>
          </details>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:cursor-not-allowed disabled:opacity-50 min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};