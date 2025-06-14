'use client';

import React, { use, useEffect, useState } from 'react';
import { Plus, Check, Trash2, Edit3, X, Save, Calendar, User } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { API } from '@/app/constant';
import { useRouter } from 'next/navigation';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    created_at: string;
    user_id: number;
}

interface User {
    id: number;
    full_name: string;
    email: string;
    image_url: string;
}


type filterType = 'all' | 'pending' | 'completed'

interface NewTodo {
    title: string;
    description: string;
}

interface Stats {
    total: number;
    completed: number;
    pending: number;
}

const TodoApp: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([
        {
            id: 1,
            title: "Complete project proposal",
            description: "Finish the Q2 project proposal and send it to the team for review",
            is_completed: false,
            created_at: "2024-06-10T10:30:00Z",
            user_id: 1
        },
        {
            id: 2,
            title: "Review code changes",
            description: "Go through the pull requests and provide feedback",
            is_completed: true,
            created_at: "2024-06-09T14:20:00Z",
            user_id: 1
        },
        {
            id: 3,
            title: "Update documentation",
            description: null,
            is_completed: false,
            created_at: "2024-06-08T09:15:00Z",
            user_id: 1
        }
    ]);
    const router = useRouter();
    const [newTodo, setNewTodo] = useState<NewTodo>({ title: '', description: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTodo, setEditingTodo] = useState<NewTodo>({ title: '', description: '' });
    const [filter, setFilter] = useState<filterType>('all');
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const addTodo = (): void => {
        if (!newTodo.title.trim()) return;

        const todo: Todo = {
            id: Date.now(),
            title: newTodo.title.trim(),
            description: newTodo.description.trim() || null,
            is_completed: false,
            created_at: new Date().toISOString(),
            user_id: 1
        };

        setTodos(prev => [todo, ...prev]);
        setNewTodo({ title: '', description: '' });
        setShowAddForm(false);
    };

    const toggleTodo = (id: number): void => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo
        ));
    };

    const deleteTodo = (id: number): void => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    const startEditing = (todo: Todo): void => {
        setEditingId(todo.id);
        setEditingTodo({ title: todo.title, description: todo.description || '' });
    };

    const saveEdit = (): void => {
        if (!editingTodo.title.trim()) return;

        setTodos(prev => prev.map(todo =>
            todo.id === editingId
                ? { ...todo, title: editingTodo.title.trim(), description: editingTodo.description.trim() || null }
                : todo
        ));
        setEditingId(null);
        setEditingTodo({ title: '', description: '' });
    };

    const cancelEdit = (): void => {
        setEditingId(null);
        setEditingTodo({ title: '', description: '' });
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'completed') return todo.is_completed;
        if (filter === 'pending') return !todo.is_completed;
        return true;
    });

    const stats: Stats = {
        total: todos.length,
        completed: todos.filter(t => t.is_completed).length,
        pending: todos.filter(t => !t.is_completed).length
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            console.log("Token not found, redirecting to login");
        }

        axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(response => {
            console.log("User data:", response.data);
            setUser(response.data?.data)
        }
        ).catch(error => {
            console.error("Error fetching user data:", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error(`Error: ${error.response.data.message}`);
            } else {
                console.error("An unexpected error occurred.");
            }
        }
        );
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className='flex items-center gap-2 justify-between mb-8'>
                    <div className=" flex items-center justify-center gap-2 mb-8">
                        <img src={user?.image_url} alt="User Avatar" className="w-12 h-12 rounded-full mx-auto mb-2" />
                        <div className='flex flex-col'>
                            <h1 className="text-lg font-bold text-gray-800">{user?.full_name}</h1>
                            <h1 className="text-base font-bold text-gray-800">{user?.email}</h1>
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            Cookies.remove('token');
                            router.push('/');
                        }}
                        className='text-red-400 cursor-pointer'>Log Out</div>
                </div>



                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo App</h1>
                    <p className="text-gray-600 mt-2">A practice to stay organized and productive</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <User className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'pending', 'completed'] as const).map(filterType => (
                                <button
                                    key={filterType}
                                    onClick={() => setFilter(filterType)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === filterType
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                    {filterType === 'all' && ` (${stats.total})`}
                                    {filterType === 'pending' && ` (${stats.pending})`}
                                    {filterType === 'completed' && ` (${stats.completed})`}
                                </button>
                            ))}
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Task title..."
                                    value={newTodo.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:border-transparent outline-none"
                                    autoFocus
                                />
                                <textarea
                                    placeholder="Description (optional)..."
                                    value={newTodo.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:border-transparent outline-none resize-none"
                                    rows={3}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={addTodo}
                                        disabled={!newTodo.title.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        Add Task
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewTodo({ title: '', description: '' });
                                        }}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Todo List */}
                <div className="space-y-4">
                    {filteredTodos.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                            <p className="text-gray-500">
                                {filter === 'all' ? 'Add your first task to get started!' :
                                    filter === 'completed' ? 'No completed tasks yet.' :
                                        'All tasks are completed!'}
                            </p>
                        </div>
                    ) : (
                        filteredTodos.map(todo => (
                            <div
                                key={todo.id}
                                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md ${todo.is_completed ? 'opacity-75' : ''
                                    }`}
                            >
                                {editingId === todo.id ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={editingTodo.title}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTodo(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                                        />
                                        <textarea
                                            value={editingTodo.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingTodo(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Description (optional)..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={saveEdit}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleTodo(todo.id)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${todo.is_completed
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-300 hover:border-green-400'
                                                }`}
                                        >
                                            {todo.is_completed && <Check className="w-4 h-4" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium mb-2 ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                                                }`}>
                                                {todo.title}
                                            </h3>
                                            {todo.description && (
                                                <p className={`text-sm mb-3 ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                    {todo.description}
                                                </p>
                                            )}
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDate(todo.created_at)}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => startEditing(todo)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoApp;