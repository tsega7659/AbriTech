import React from 'react';

const PlaceholderPage = ({ title, description }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-[#00B4D8]/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[#00B4D8]/20 rounded-full animate-pulse flex items-center justify-center text-[#00B4D8] font-bold text-2xl">
                A
            </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 max-w-md mx-auto">
            {description || "We're currently building this feature to enhance your experience. Stay tuned!"}
        </p>
        <div className="mt-8 flex gap-4">
            <div className="h-2 w-2 rounded-full bg-[#00B4D8]"></div>
            <div className="h-2 w-2 rounded-full bg-[#00B4D8]/60"></div>
            <div className="h-2 w-2 rounded-full bg-[#00B4D8]/30"></div>
        </div>
    </div>
);

// Student Placeholder Pages
export const StudentProgress = () => <PlaceholderPage title="My Progress" description="Track your learning journey and milestones here. Coming soon!" />;
export const StudentPortfolio = () => <PlaceholderPage title="My Portfolio" description="Showcase your best projects and certificates. Coming soon!" />;
export const StudentProjects = () => <PlaceholderPage title="My Projects" description="Manage your current and completed projects. Coming soon!" />;
export const StudentAITutor = () => <PlaceholderPage title="AI Tutor" description="Your personal AI learning assistant is being prepared. Coming soon!" />;

// Parent Placeholder Pages
export const ParentChildren = () => <PlaceholderPage title="My Children" description="Monitor your children's learning path and linked accounts. Coming soon!" />;
export const ParentReports = () => <PlaceholderPage title="Learning Reports" description="Detailed insights into learning progress and assessments. Coming soon!" />;
export const ParentEvents = () => <PlaceholderPage title="Upcoming Events" description="Stay updated with school events and deadlines. Coming soon!" />;
