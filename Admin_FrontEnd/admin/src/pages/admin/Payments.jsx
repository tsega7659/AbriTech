import React, { useState } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    CreditCard, 
    Clock, 
    Download, 
    Filter,
    Search,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Smartphone,
    MoreHorizontal
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const revenueData = [
    { day: 'Mon', amount: 4500 },
    { day: 'Tue', amount: 5200 },
    { day: 'Wed', amount: 4800 },
    { day: 'Thu', amount: 6100 },
    { day: 'Fri', amount: 5900 },
    { day: 'Sat', amount: 7200 },
    { day: 'Sun', amount: 6800 },
];

const transactions = [
    { id: 'TXN-001', student: 'Abebe Bikila', course: 'Full-Stack Web Dev', amount: '2,499 ETB', date: '2024-03-20', status: 'completed', method: 'Telebirr' },
    { id: 'TXN-002', student: 'Martha Haile', course: 'Robotics for Kids', amount: '1,500 ETB', date: '2024-03-19', status: 'completed', method: 'Telebirr' },
    { id: 'TXN-003', student: 'Samuel Desta', course: 'Python Mastery', amount: '1,200 ETB', date: '2024-03-19', status: 'pending', method: 'Telebirr' },
    { id: 'TXN-004', student: 'Betty G.', course: 'UI/UX Design', amount: '2,999 ETB', date: '2024-03-18', status: 'completed', method: 'Telebirr' },
    { id: 'TXN-005', student: 'Kebede Kassaye', course: 'Mobile Dev', amount: '3,500 ETB', date: '2024-03-18', status: 'failed', method: 'Telebirr' },
    { id: 'TXN-006', student: 'Saron Belay', course: 'AI Fundamentals', amount: '4,200 ETB', date: '2024-03-17', status: 'completed', method: 'Telebirr' },
    { id: 'TXN-007', student: 'Dawit L.', course: '3D Modeling', amount: '2,100 ETB', date: '2024-03-17', status: 'completed', method: 'Telebirr' },
    { id: 'TXN-008', student: 'Elias T.', course: 'React Native', amount: '3,800 ETB', date: '2024-03-16', status: 'pending', method: 'Telebirr' },
];

const Payments = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const stats = [
        { label: 'Total Revenue', value: '145,280 ETB', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Weekly Average', value: '42,400 ETB', change: '+5.2%', trend: 'up', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Pending Deposits', value: '8,500 ETB', change: '-2.1%', trend: 'down', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Success Rate', value: '98.2%', change: '+0.5%', trend: 'up', icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const filteredTransactions = transactions.filter(txn => 
        txn.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Overview</h1>
                    <p className="text-slate-500 font-bold text-sm mt-1">Track your revenue and course enrollments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart - Now full width of the main area */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                        {['7D', '1M', '3M', '1Y'].map((t) => (
                            <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${t === '7D' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800">Revenue Growth</h3>
                    <p className="text-sm font-bold text-slate-400">Daily earnings overview</p>
                </div>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4dbfec" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4dbfec" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                                itemStyle={{ fontWeight: 800, color: '#4dbfec' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#4dbfec" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorRev)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Recent Transactions</h3>
                        <p className="text-sm font-bold text-slate-400">Details of latest enrollment payments</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search transactions..."
                                className="pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none font-bold text-sm w-full md:w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Course</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentItems.map((txn) => (
                                <tr key={txn.id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg">#{txn.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {txn.student.charAt(0)}
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{txn.student}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-500">{txn.course}</span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-slate-800 text-sm">
                                        {txn.amount}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            txn.status === 'completed' ? 'bg-green-50 text-green-600' :
                                            txn.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                txn.status === 'completed' ? 'bg-green-500' :
                                                txn.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'
                                            }`} />
                                            {txn.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-transparent hover:border-primary/20"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-transparent hover:border-primary/20"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
