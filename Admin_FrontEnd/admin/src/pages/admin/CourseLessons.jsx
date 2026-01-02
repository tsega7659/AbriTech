import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

const CourseLessons = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="self-start text-slate-500 hover:text-primary flex items-center gap-2 font-bold mb-10 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Courses
            </button>

            <div className="bg-primary/5 p-10 rounded-full">
                <Construction className="w-20 h-20 text-primary" />
            </div>

            <h1 className="text-4xl font-black text-slate-800">Lessons Management</h1>
            <p className="text-xl text-slate-500 font-medium max-w-md">
                We are currently building the lesson management functionality for Course ID: <span className="text-primary font-bold">{courseId}</span>.
            </p>
            <span className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full font-black uppercase tracking-widest text-sm">
                Coming Soon
            </span>
        </div>
    );
};

export default CourseLessons;
