import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Service Worker registracija za PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrovan sa uspjehom: ', registration.scope);
      })
      .catch((registrationError) => {
        console.log('SW registracija neuspješna: ', registrationError);
      });
  });
}

// Komponente
const TaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/tasks`, {
        title: title.trim(),
        description: description.trim(),
      });
      
      setTitle("");
      setDescription("");
      onTaskAdded(response.data);
    } catch (error) {
      console.error("Greška prilikom kreiranja zadatka:", error);
      alert("Neuspješno kreiranje zadatka. Molimo pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stats-card mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dodaj novi zadatak</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Naziv zadatka..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-500"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <textarea
            placeholder="Opis zadatka (opcionalno)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-500 resize-none h-20"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {isSubmitting ? "Dodajem..." : "Dodaj zadatak"}
        </button>
      </form>
    </div>
  );
};

const TaskStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="stats-card stats-card-total">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Ukupno zadataka</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="stats-card stats-card-completed">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Završeno</p>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="stats-card stats-card-pending">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">U toku</p>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="stats-card stats-card-rate">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Završenost</p>
            <p className="text-3xl font-bold text-white">{stats.completion_rate}%</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskTable = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const handleStatusToggle = async (task) => {
    const newStatus = task.status === "todo" ? "completed" : "todo";
    try {
      await axios.put(`${API}/tasks/${task.id}`, { status: newStatus });
      onTaskUpdate(task.id, { ...task, status: newStatus });
    } catch (error) {
      console.error("Greška prilikom ažuriranja statusa zadatka:", error);
      alert("Neuspješno ažuriranje statusa. Molimo pokušajte ponovo.");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Da li ste sigurni da želite obrisati ovaj zadatak?")) {
      try {
        await axios.delete(`${API}/tasks/${taskId}`);
        onTaskDelete(taskId);
      } catch (error) {
        console.error("Greška prilikom brisanja zadatka:", error);
        alert("Neuspješno brisanje zadatka. Molimo pokušajte ponovo.");
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="stats-card text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema zadataka</h3>
        <p className="text-gray-500">Kreirajte prvi zadatak da počnete!</p>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Moji radni zadaci</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Zadatak</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Opis</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Kreiran</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleStatusToggle(task)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  >
                    {task.status === "completed" ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Završeno
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        U toku
                      </>
                    )}
                  </button>
                </td>
                <td className="py-4 px-4">
                  <div className={`font-medium ${task.status === "completed" ? "text-gray-500 line-through" : "text-gray-900"}`}>
                    {task.title}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className={`text-sm ${task.status === "completed" ? "text-gray-400" : "text-gray-600"}`}>
                    {task.description || "-"}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-500">
                    {new Date(task.created_at).toLocaleDateString('bs-BA')}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Obriši zadatak"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// PWA Install komponenta
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-purple-200 rounded-2xl shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="bg-purple-100 p-2 rounded-full">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Instaliraj Lakši Rad</h3>
          <p className="text-gray-600 text-xs mt-1">Dodaj aplikaciju na početni ekran za lakši pristup</p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="bg-purple-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Instaliraj
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-gray-500 text-xs px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Možda kasnije
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completion_rate: 0 });
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Greška prilikom dohvaćanja zadataka:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/tasks/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Greška prilikom dohvaćanja statistika:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchTasks(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskAdded = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    fetchStats(); // Osvježi statistike
  };

  const handleTaskUpdate = (taskId, updatedTask) => {
    setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    fetchStats(); // Osvježi statistike
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    fetchStats(); // Osvježi statistike
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="stats-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavam vaše zadatke...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Lakši Rad
          </h1>
          <p className="text-gray-600 text-lg">
            Organiziraj svoj rad i povećaj produktivnost
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <TaskStats stats={stats} />
          <TaskForm onTaskAdded={handleTaskAdded} />
          <TaskTable 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>
      
      <PWAInstallPrompt />
    </div>
  );
}

export default App;