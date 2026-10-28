import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    QrCode,
    Download,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    Calendar,
    Search,
    BookOpen,
    KeyRound,
    RefreshCw,
    X,
    ExternalLink,
    Printer,
    Edit3,
    Link
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL, getAuthHeaders } from '../../config/apiConfig';
import Loading from '../../components/Loading';

export default function AdminKits() {
    const [activeTab, setActiveTab] = useState('kits'); // 'kits' | 'generate' | 'batches'
    const [kits, setKits] = useState([]);
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Kit creation modal state
    const [isCreateKitOpen, setIsCreateKitOpen] = useState(false);
    const [kitForm, setKitForm] = useState({ name: '', description: '', courseId: '' });
    const [kitSubmitting, setKitSubmitting] = useState(false);

    // Kit editing / re-linking modal state
    const [editKit, setEditKit] = useState(null); // { id, name, description, courseId }
    const [editKitSubmitting, setEditKitSubmitting] = useState(false);

    // Key generator state
    const [genForm, setGenForm] = useState({
        kitId: '',
        name: '',
        description: '',
        quantity: 50,
        expiresAt: ''
    });
    const [genSubmitting, setGenSubmitting] = useState(false);

    // Batch Keys inspection modal
    const [inspectBatch, setInspectBatch] = useState(null);
    const [batchKeys, setBatchKeys] = useState([]);
    const [keysLoading, setKeysLoading] = useState(false);
    const [keySearch, setKeySearch] = useState('');
    const [previewKey, setPreviewKey] = useState(null);

    // Feedback banner
    const [feedback, setFeedback] = useState(null);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 5000);
    };

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const headers = getAuthHeaders();

            const [kitsRes, batchesRes, coursesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/kits`, { headers }),
                fetch(`${API_BASE_URL}/kits/batches`, { headers }),
                fetch(`${API_BASE_URL}/courses`, { headers })
            ]);

            if (kitsRes.ok) setKits(await kitsRes.json());
            if (batchesRes.ok) setBatches(await batchesRes.json());
            if (coursesRes.ok) setCourses(await coursesRes.json());
        } catch (err) {
            console.error('Failed to load kit data:', err);
            showFeedback('error', 'Failed to connect to backend server');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Create Kit Handler
    const handleCreateKit = async (e) => {
        e.preventDefault();
        if (!kitForm.name || !kitForm.courseId) {
            showFeedback('error', 'Kit name and target course are required');
            return;
        }

        setKitSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/kits`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(kitForm)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to create kit');
            }

            showFeedback('success', 'Physical Kit defined successfully!');
            setIsCreateKitOpen(false);
            setKitForm({ name: '', description: '', courseId: '' });
            fetchData();
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setKitSubmitting(false);
        }
    };

    // Update Kit Handler
    const handleUpdateKit = async (e) => {
        e.preventDefault();
        if (!editKit) return;
        setEditKitSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/kits/${editKit.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: editKit.name,
                    description: editKit.description,
                    courseId: editKit.courseId || null
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to update kit');
            }

            showFeedback('success', 'Kit updated and course link saved!');
            setEditKit(null);
            fetchData();
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setEditKitSubmitting(false);
        }
    };


    // Generate Batch Handler
    const handleGenerateBatch = async (e) => {
        e.preventDefault();
        if (!genForm.kitId || !genForm.quantity) {
            showFeedback('error', 'Please select a kit and valid quantity');
            return;
        }

        setGenSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/kits/batches/generate`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(genForm)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to generate keys');

            showFeedback('success', `Success! ${data.message}`);
            setGenForm({ kitId: '', name: '', description: '', quantity: 50, expiresAt: '' });
            setActiveTab('batches');
            fetchData();
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setGenSubmitting(false);
        }
    };

    // Inspect Batch Keys Handler
    const handleInspectBatch = async (batch) => {
        setInspectBatch(batch);
        setKeysLoading(true);
        setKeySearch('');
        try {
            const res = await fetch(`${API_BASE_URL}/kits/batches/${batch.id}/keys`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setBatchKeys(await res.json());
            }
        } catch (err) {
            console.error('Failed to load batch keys:', err);
        } finally {
            setKeysLoading(false);
        }
    };

    // Download CSV
    const handleDownloadCSV = (batchId, batchName) => {
        const token = localStorage.getItem('token');
        const url = `${API_BASE_URL}/kits/batches/${batchId}/export`;

        fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.blob())
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `keys-${batchId}-${batchName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(err => {
                console.error('Download error:', err);
                showFeedback('error', 'Failed to download CSV export');
            });
    };

    // Global Stats
    const totalKits = kits.length;
    const totalKeys = batches.reduce((acc, b) => acc + (b.stats?.total || 0), 0);
    const redeemedKeys = batches.reduce((acc, b) => acc + (b.stats?.redeemed || 0), 0);
    const unusedKeys = batches.reduce((acc, b) => acc + (b.stats?.unused || 0), 0);

    if (loading) return <Loading fullScreen={false} message="Loading Physical Kits & Keys..." />;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" /> Physical Kits & Activation Keys
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Link physical hardware kits (Arduino, Robotics) to digital courses and generate print-ready keys & QR codes.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-500 transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsCreateKitOpen(true)}
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Define New Kit
                    </button>
                </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border ${feedback.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                    {feedback.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Package className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Physical Kits</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalKits}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Keys Printed</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalKeys}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Redeemed by Students</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{redeemedKeys}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available in Inventory</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{unusedKeys}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-8">
                <button
                    onClick={() => setActiveTab('kits')}
                    className={`pb-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'kits'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Package className="w-4 h-4" /> Physical Kits Catalog ({kits.length})
                </button>
                <button
                    onClick={() => setActiveTab('generate')}
                    className={`pb-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'generate'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <QrCode className="w-4 h-4" /> Batch Key Generator
                </button>
                <button
                    onClick={() => setActiveTab('batches')}
                    className={`pb-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'batches'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Download className="w-4 h-4" /> Batch Management & Export ({batches.length})
                </button>
            </div>

            {/* TAB 1: KITS CATALOG */}
            {activeTab === 'kits' && (
                <div className="space-y-6">
                    {kits.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
                            <Package className="w-12 h-12 text-slate-300 mx-auto" />
                            <h3 className="text-lg font-bold text-slate-700">No Physical Kits Created Yet</h3>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                Define your first physical hardware kit (e.g. Arduino Starter Kit) and bind it to a digital course.
                            </p>
                            <button
                                onClick={() => setIsCreateKitOpen(true)}
                                className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm"
                            >
                                Define Kit Now
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kits.map((kit) => (
                                <div key={kit.id} className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all space-y-4 ${kit.courseId ? 'border-slate-100' : 'border-amber-200 ring-1 ring-amber-100'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${kit.courseId ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {kit.name.charAt(0)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${kit.courseId ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                                                {kit.courseId ? `Kit #${kit.id}` : '⚠️ Unlinked Kit'}
                                            </span>
                                            <button
                                                onClick={() => setEditKit({
                                                    id: kit.id,
                                                    name: kit.name,
                                                    description: kit.description || '',
                                                    courseId: kit.courseId || ''
                                                })}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-all"
                                                title="Edit Kit / Link Course"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{kit.name}</h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                            {kit.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase">Unlocks Digital Course:</p>
                                            {!kit.courseId && (
                                                <button
                                                    onClick={() => setEditKit({
                                                        id: kit.id,
                                                        name: kit.name,
                                                        description: kit.description || '',
                                                        courseId: ''
                                                    })}
                                                    className="text-[11px] text-amber-700 font-extrabold hover:underline inline-flex items-center gap-1"
                                                >
                                                    <Link className="w-3 h-3" /> Connect Course
                                                </button>
                                            )}
                                        </div>
                                        <p className={`text-sm font-black flex items-center gap-1.5 mt-0.5 ${kit.courseId ? 'text-primary' : 'text-amber-600'}`}>
                                            <BookOpen className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{kit.courseName || 'Unlinked (No course assigned)'}</span>
                                        </p>
                                    </div>

                                    {/* Mini stats */}
                                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                                            <p className="text-sm font-black text-slate-800">{kit.stats?.totalKeys || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Used</p>
                                            <p className="text-sm font-black text-emerald-600">{kit.stats?.redeemedKeys || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase">Unused</p>
                                            <p className="text-sm font-black text-amber-600">{kit.stats?.unusedKeys || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setGenForm(prev => ({ ...prev, kitId: kit.id }));
                                                setActiveTab('generate');
                                            }}
                                            disabled={!kit.courseId}
                                            className={`flex-1 py-2.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
                                                kit.courseId
                                                    ? 'bg-slate-100 hover:bg-primary hover:text-white text-slate-700'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                            title={!kit.courseId ? 'Connect a course first to generate keys' : 'Generate keys for this kit'}
                                        >
                                            <QrCode className="w-4 h-4" /> Generate Keys
                                        </button>
                                        <button
                                            onClick={() => setEditKit({
                                                id: kit.id,
                                                name: kit.name,
                                                description: kit.description || '',
                                                courseId: kit.courseId || ''
                                            })}
                                            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center"
                                            title="Edit Kit / Link Course"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: BATCH KEY GENERATOR */}
            {activeTab === 'generate' && (
                <div className="max-w-2xl bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Generate Activation Key Batch</h2>
                            <p className="text-xs text-slate-400">
                                Produces collision-free, human-friendly keys (`ATK1-XXXX-XXXX`) and auto-generates QR scan links.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerateBatch} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Select Target Physical Kit *
                            </label>
                            <select
                                value={genForm.kitId}
                                onChange={(e) => setGenForm({ ...genForm, kitId: e.target.value })}
                                required
                                className="w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 focus:outline-none focus:border-primary"
                            >
                                <option value="">-- Choose a Kit --</option>
                                {kits.map(k => (
                                    <option key={k.id} value={k.id}>
                                        {k.name} (Course: {k.courseName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Batch Name / Identifier
                            </label>
                            <input
                                type="text"
                                value={genForm.name}
                                onChange={(e) => setGenForm({ ...genForm, name: e.target.value })}
                                placeholder="e.g. Batch #1 - Oct 2026 Production Run"
                                className="w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm text-slate-800 focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Number of Keys to Generate *
                            </label>
                            <div className="flex items-center gap-3">
                                {[25, 50, 100, 250].map(qty => (
                                    <button
                                        type="button"
                                        key={qty}
                                        onClick={() => setGenForm({ ...genForm, quantity: qty })}
                                        className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${genForm.quantity === qty
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {qty} Keys
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={genForm.quantity}
                                    onChange={(e) => setGenForm({ ...genForm, quantity: e.target.value })}
                                    className="w-28 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-center"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Expiration Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={genForm.expiresAt}
                                onChange={(e) => setGenForm({ ...genForm, expiresAt: e.target.value })}
                                className="w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm text-slate-800 focus:outline-none focus:border-primary"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Leave blank for permanent lifetime activation.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={genSubmitting}
                            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm transition-all"
                        >
                            {genSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating {genForm.quantity} Cryptographic Keys...</span>
                                </>
                            ) : (
                                <>
                                    <QrCode className="w-4 h-4" />
                                    <span>Generate {genForm.quantity} Keys</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 3: BATCH MANAGEMENT & EXPORT */}
            {activeTab === 'batches' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Generated Batches</h2>
                            <p className="text-xs text-slate-400">Download CSV files containing raw keys and direct QR scan links for sticker printing.</p>
                        </div>
                    </div>

                    {batches.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">
                            No batches generated yet. Click "Batch Key Generator" to create your first set!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-black tracking-wider">
                                    <tr>
                                        <th className="py-4 px-6">Batch ID & Title</th>
                                        <th className="py-4 px-6">Target Course</th>
                                        <th className="py-4 px-6 text-center">Total Keys</th>
                                        <th className="py-4 px-6 text-center">Redeemed</th>
                                        <th className="py-4 px-6 text-center">Unused</th>
                                        <th className="py-4 px-6">Created At</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {batches.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-slate-900">{b.name}</p>
                                                <p className="text-xs text-slate-400">Batch #{b.id}</p>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-primary">
                                                {b.courseName}
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-slate-900">
                                                {b.stats?.total || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-emerald-600">
                                                {b.stats?.redeemed || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-amber-600">
                                                {b.stats?.unused || 0}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-slate-400">
                                                {new Date(b.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => handleInspectBatch(b)}
                                                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-all inline-flex items-center gap-1.5 text-xs font-bold"
                                                    title="Inspect individual keys"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Keys
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadCSV(b.id, b.name)}
                                                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-bold"
                                                    title="Export CSV for QR / Printer"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Export CSV
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* CREATE KIT MODAL */}
            {isCreateKitOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative">
                        <button
                            onClick={() => setIsCreateKitOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <h3 className="text-xl font-black text-slate-900">Define Physical Kit</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Create a hardware kit profile and connect it to a digital course.
                            </p>
                        </div>

                        <form onSubmit={handleCreateKit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Kit Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Arduino Robotics Explorer Kit"
                                    value={kitForm.name}
                                    onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })}
                                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-800 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Target Digital Course *
                                    <span className="ml-2 text-yellow-500 normal-case font-medium">(Only courses marked "With Activation Key" are shown)</span>
                                </label>
                                <select
                                    required
                                    value={kitForm.courseId}
                                    onChange={(e) => setKitForm({ ...kitForm, courseId: e.target.value })}
                                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:border-primary"
                                >
                                    <option value="">-- Select Course to Unlock --</option>
                                    {courses.filter(c => c.requiresActivationKey).length === 0 ? (
                                        <option disabled value="">No key-enabled courses yet. Create one in Course Management.</option>
                                    ) : (
                                        courses.filter(c => c.requiresActivationKey).map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.level})
                                            </option>
                                        ))
                                    )}
                                </select>
                                {courses.filter(c => c.requiresActivationKey).length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2 font-semibold bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                                        ⚠️ No courses are set to "With Activation Key" yet. Go to Course Management and set the pricing type to "🔑 With Activation Key" first.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Box contents, target age group, sensor list..."
                                    value={kitForm.description}
                                    onChange={(e) => setKitForm({ ...kitForm, description: e.target.value })}
                                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-800 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={kitSubmitting}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 text-sm transition-all"
                            >
                                {kitSubmitting ? 'Saving Kit...' : 'Save Kit Definition'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT KIT / RE-LINK COURSE MODAL */}
            {editKit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative">
                        <button
                            onClick={() => setEditKit(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-blue-50 px-2.5 py-1 rounded-full">
                                Kit #{editKit.id}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">Edit Kit & Connect Course</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Update kit details or bind this hardware kit to an active digital course.
                            </p>
                        </div>

                        <form onSubmit={handleUpdateKit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Kit Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Kit name"
                                    value={editKit.name}
                                    onChange={(e) => setEditKit({ ...editKit, name: e.target.value })}
                                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-800 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Linked Digital Course
                                </label>
                                <select
                                    value={editKit.courseId || ''}
                                    onChange={(e) => setEditKit({ ...editKit, courseId: e.target.value })}
                                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:border-primary"
                                >
                                    <option value="">-- No Course (Keep Unlinked) --</option>
                                    <optgroup label="Key-Enabled Courses (Recommended)">
                                        {courses.filter(c => c.requiresActivationKey).map(c => (
                                            <option key={c.id} value={c.id}>
                                                🔑 {c.name} ({c.level})
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Other Courses">
                                        {courses.filter(c => !c.requiresActivationKey).map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.level})
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Selecting a course connects all keys generated for this kit to that course.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Box contents, target age group, sensor list..."
                                    value={editKit.description || ''}
                                    onChange={(e) => setEditKit({ ...editKit, description: e.target.value })}
                                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-800 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditKit(null)}
                                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editKitSubmitting}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 text-xs transition-all flex items-center justify-center gap-1.5"
                                >
                                    {editKitSubmitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* INSPECT BATCH KEYS MODAL */}
            {inspectBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[85vh] flex flex-col relative">
                        <button
                            onClick={() => setInspectBatch(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{inspectBatch.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Course: <span className="font-bold text-primary">{inspectBatch.courseName}</span> • Total Keys: {batchKeys.length}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDownloadCSV(inspectBatch.id, inspectBatch.name)}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 flex items-center gap-1.5"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>

                        {/* Search key */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search keys or student names..."
                                value={keySearch}
                                onChange={(e) => setKeySearch(e.target.value)}
                                className="w-full py-2.5 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* Keys Table */}
                        <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl">
                            {keysLoading ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading keys...
                                </div>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-400 uppercase font-black sticky top-0">
                                        <tr>
                                            <th className="py-3 px-4">Activation Key</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Redeemed By</th>
                                            <th className="py-3 px-4">Redeemed At</th>
                                            <th className="py-3 px-4 text-right">QR & Sticker</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {batchKeys
                                            .filter(k =>
                                                k.key.toLowerCase().includes(keySearch.toLowerCase()) ||
                                                (k.redeemedBy?.fullName || '').toLowerCase().includes(keySearch.toLowerCase()) ||
                                                (k.redeemedBy?.email || '').toLowerCase().includes(keySearch.toLowerCase())
                                            )
                                            .map(k => (
                                                <tr key={k.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                        {k.key}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${k.status === 'redeemed'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : k.status === 'revoked'
                                                                    ? 'bg-rose-50 text-rose-700'
                                                                    : 'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {k.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600">
                                                        {k.redeemedBy ? (
                                                            <div>
                                                                <p className="font-bold text-slate-800">{k.redeemedBy.fullName}</p>
                                                                <p className="text-[10px] text-slate-400">{k.redeemedBy.email}</p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 italic">— Unclaimed —</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-400">
                                                        {k.redeemedAt ? new Date(k.redeemedAt).toLocaleString() : '—'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => setPreviewKey(k)}
                                                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                                                        >
                                                            <QrCode className="w-3.5 h-3.5" /> View QR
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* QR CODE & PRINT STICKER MODAL */}
            {previewKey && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 relative border border-slate-100">
                        <button
                            onClick={() => setPreviewKey(null)}
                            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Physical Sticker Label Card */}
                        <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-blue-50 px-2.5 py-1 rounded-full">
                                    AbriTech Physical Kit
                                </span>
                                <h4 className="text-sm font-black text-slate-900 mt-2 truncate">
                                    {inspectBatch?.courseName || 'STEM Digital Course'}
                                </h4>
                            </div>

                            <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mx-auto border border-slate-100">
                                <QRCodeSVG
                                    value={`https://www.abritechet.com/activate?code=${previewKey.key}`}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Activation Key</p>
                                <p className="font-mono text-base font-black text-slate-900 tracking-widest mt-0.5">
                                    {previewKey.key}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                            >
                                <Printer className="w-4 h-4" /> Print Sticker
                            </button>
                            <button
                                onClick={() => setPreviewKey(null)}
                                className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
