import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🏰</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Herold</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="https://github.com/mhaglind/herold" className="text-gray-600 hover:text-gray-900" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Family Stories into{' '}
            <span className="text-indigo-600">Beautiful Family Trees</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create stunning family trees through natural language. Just say "Halvard's father is Holmfast"
            and watch as AI automatically generates your family genealogy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors">
              Create Your First Family Tree
            </button>
            <Link
              to="/project/halling"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
            >
              View Demo (Halling Family)
            </Link>
          </div>

          {/* Feature Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Natural Language Input</h3>
            <div className="bg-gray-50 rounded-lg p-6 font-mono text-left">
              <div className="text-gray-600 mb-2">💬 You type:</div>
              <div className="text-lg text-gray-900 mb-4">"Add Elanor as Galrandir's daughter and Halli's wife"</div>
              <div className="text-gray-600 mb-2">🤖 AI understands:</div>
              <div className="text-sm text-gray-700">
                • Creates new person: Elanor<br/>
                • Sets parent relationship: Galrandir → Elanor<br/>
                • Sets marriage: Elanor ⚭ Halli<br/>
                • Updates family tree layout automatically
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced natural language processing understands family relationships and converts them to precise genealogical data.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful Layouts</h3>
              <p className="text-gray-600">
                Automatically generates publication-quality family trees with elegant typography and perfect positioning.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Intelligence</h3>
              <p className="text-gray-600">
                Supports different naming traditions: Nordic, Elvish, English, and geographic identifiers.
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Family Projects</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-gray-600 mb-6">No projects yet. Create your first family tree to get started!</p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                + New Family Project
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold">🏰</span>
            </div>
            <span className="text-xl font-bold">Herold</span>
          </div>
          <p className="text-gray-400 mb-4">AI-powered family tree creation through natural language</p>
          <p className="text-gray-500 text-sm">
            Built with ❤️ using React, TypeScript, and Claude AI •
            <a href="https://github.com/mhaglind/herold" className="text-indigo-400 hover:text-indigo-300 ml-1" target="_blank" rel="noopener noreferrer">
              Open Source on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;