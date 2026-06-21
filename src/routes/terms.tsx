import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-gray-900 font-sans selection:bg-brand/30 pb-20">
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:text-brand-hover font-bold mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Terms of Service</h1>
        <div className="prose prose-lg prose-gray max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-elevated border border-gray-200">
          <p>Last updated: June 2026</p>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using the Resident HQ platform, you agree to be bound by these Terms. If you do not agree to these terms, please do not use our services.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p>Resident HQ provides a community management system for residential complexes, including gate management, financial accounting, and community communication tools.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Conduct</h2>
          <p>You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. We reserve the right to terminate access to any user who violates these conditions.</p>
        </div>
      </div>
    </div>
  );
}
