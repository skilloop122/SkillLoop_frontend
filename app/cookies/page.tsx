"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const sections = [
  { num: 1, title: "Introduction", text: "This Cookie Policy explains how SkilLoop uses cookies and similar technologies when you use our website and platform.\n\nWe aim to keep our use of cookies simple and limited to what is reasonably necessary to operate and improve SkilLoop." },
  { num: 2, title: "What Are Cookies?", text: "Cookies are small files or pieces of information stored on your device by websites.\n\nThey can help websites:\n• Remember information.\n• Maintain login sessions.\n• Improve security.\n• Understand how a service is being used.\n• Provide certain functionality." },
  { num: 3, title: "How SkilLoop Uses Cookies", text: "At launch, SkilLoop may use cookies or similar technologies primarily for essential purposes, including:\n\nAuthentication and Session Management\nThese technologies may help:\n• Keep you signed in.\n• Maintain your authentication session.\n• Protect your account.\n• Recognize an authenticated session.\n\nSecurity\nCookies or similar technologies may help us:\n• Detect suspicious activity.\n• Protect authentication processes.\n• Maintain platform security.\n\nPlatform Functionality\nSome technologies may be required for features of the website or platform to work correctly." },
  { num: 4, title: "Third-Party Services", text: "SkilLoop uses third-party services that may use cookies or similar technologies as part of their services.\n\nThese may include:\n• Supabase\n• Google\n• Zoom\n• Hosting and infrastructure providers\n\nThird-party providers may have their own cookie and privacy policies." },
  { num: 5, title: "Analytics and Advertising", text: "At launch, SkilLoop does not currently use cookies for:\n• Targeted advertising\n• Advertising profiles\n• Selling personal information to advertisers\n\nSkilLoop also does not currently operate a dedicated advertising network.\n\nIf this changes in the future, we may update this Cookie Policy and provide any notices or choices required by applicable law." },
  { num: 6, title: "Managing Cookies", text: "Most modern browsers allow you to manage or disable cookies through browser settings.\n\nHowever, disabling certain cookies may affect the functionality of SkilLoop, particularly authentication and security-related features." },
  { num: 7, title: "Changes to This Cookie Policy", text: "We may update this Cookie Policy when our technology, services, or legal requirements change.\n\nThe \"Last Updated\" date will be updated when changes are made." },
  { num: 8, title: "Contact", text: "If you have questions about how SkilLoop uses cookies:\n\nSkilLoop\nEmail: support.skilloop@gmail.com" },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-black">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">SKILLOOP COOKIE POLICY</h1>
        <p className="text-sm text-slate-500 mb-8">Effective Date: September 28, 2026 | Last Updated: September 28, 2026</p>
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.num} className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Section {sec.num}: {sec.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{sec.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
