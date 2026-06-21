import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, Lock, Server } from "lucide-react";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-gray-900 font-sans selection:bg-brand/30 pb-20">
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:text-brand-hover font-bold mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Enterprise Security</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-elevated border border-gray-200">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Bank-Grade Encryption</h3>
            <p className="text-gray-600">All data in transit and at rest is protected with AES-256 encryption. Your community's financial data is strictly isolated.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-elevated border border-gray-200">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
              <Lock size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Access Control</h3>
            <p className="text-gray-600">Role-based permissions ensure that guards, committee members, and residents only see what they are authorized to see.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-elevated border border-gray-200">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
              <Server size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Cloud Infrastructure</h3>
            <p className="text-gray-600">Hosted on reliable, auto-scaling cloud infrastructure with 99.99% guaranteed uptime and regular backups.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
