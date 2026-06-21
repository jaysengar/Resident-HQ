import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-gray-900 font-sans selection:bg-brand/30 pb-20">
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:text-brand-hover font-bold mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Privacy Policy</h1>
        <div className="prose prose-lg prose-gray max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-elevated border border-gray-200">
          <p>Last updated: June 2026</p>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, financial and credit card information, and other information you choose to provide.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Information</h2>
          <p>We may use the information we collect about you to Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates and administrative messages.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
          <p>Resident HQ takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </div>
      </div>
    </div>
  );
}
