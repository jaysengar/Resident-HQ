import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-gray-900 font-sans selection:bg-brand/30 pb-20">
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:text-brand-hover font-bold mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">About Resident HQ</h1>
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-elevated border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            We built Resident HQ to solve the immense friction in managing modern residential communities. Our goal is to replace fragmented WhatsApp groups, manual ledgers, and messy notice boards with a single, elegant platform that treats residents like premium customers.
          </p>
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 text-gray-600 text-lg space-y-3">
            <li>Enterprise-grade security for your data.</li>
            <li>Beautiful, Apple-inspired interface that is easy to use for everyone.</li>
            <li>Complete automation of billing and finances.</li>
            <li>Seamless gate management for ultimate safety.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
