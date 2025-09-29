import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <span>←</span>
                <span>Back to Projects</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {projectId === 'halling' ? 'Huset Halling' : `Project: ${projectId}`}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">⚙️ Settings</button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Export Tree
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Family Tree Display Area */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Family Tree</h2>

            {/* Placeholder for family tree SVG */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
              <div className="text-6xl mb-4">🌳</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Family Tree Will Appear Here
              </h3>
              <p className="text-gray-500 mb-4">
                Once the SVG rendering engine is implemented, your beautiful family tree will be
                displayed here.
              </p>
              {projectId === 'halling' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-700">
                    <strong>Demo Note:</strong> The Halling family tree from our manual work will be
                    automatically rendered here once Phase 2 (SVG rendering) is completed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Natural Language Input */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Family Members</h2>
            <p className="text-gray-600 mb-4">
              Describe family relationships in natural language. For example:
            </p>

            {/* Example inputs */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Examples:</div>
              <div className="space-y-1 text-sm font-mono text-gray-700">
                <div>• "Halvard's father is Holmfast"</div>
                <div>• "Elanor married Halli and they had a son named Arnhelm"</div>
                <div>• "Harald, Halldis, Frode, and Steorra are children of Halvard"</div>
              </div>
            </div>

            {/* Input area */}
            <div className="space-y-4">
              <textarea
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe family relationships here..."
                disabled
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  🤖 AI processing will be available in Phase 3
                </div>
                <button
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Process with AI
                </button>
              </div>
            </div>

            {/* Development Status */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🚧 Development Status</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>✅ Phase 1: Project setup and basic React frontend</div>
                <div>⏳ Phase 2: SVG rendering engine (next)</div>
                <div>⏳ Phase 3: AI integration for natural language processing</div>
                <div>⏳ Phase 4: Advanced layout algorithms</div>
                <div>⏳ Phase 5: Production polish and features</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
