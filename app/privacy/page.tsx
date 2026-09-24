"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const sections = [
  { num: 1, title: "Introduction", text: "SkilLoop (\"SkilLoop,\" \"we,\" \"our,\" or \"us\") is a peer-to-peer skill exchange platform that connects people who want to teach skills with people who want to learn them.\n\nThis Privacy Policy explains how SkilLoop collects, uses, stores, and protects personal information when you use our website, platform, and related services.\n\nBy using SkilLoop, you acknowledge the practices described in this Privacy Policy." },
  { num: 2, title: "Information We Collect", text: "Account Information\nWhen you create an account, we may collect:\n• Name\n• Email address\n• Password information\n• Profile photo\n• Account authentication information\n• Information provided through Google authentication\n\nPasswords are handled through our authentication provider and are not stored by SkilLoop in plain text.\n\nProfile Information\nTo help users discover and connect with one another, you may provide:\n• Skills you can teach\n• Skills you want to learn\n• Short biography\n• Profile information\n• Session-related preferences\n• Other information you voluntarily add to your profile\n\nSession Information\nWhen you request or participate in a session, we may collect:\n• Session participants\n• Session date and time\n• Session status\n• Session requests and acceptances\n• Session completion information\n• Zoom meeting information associated with the session\n\nSkilLoop does not currently record or store session video or audio.\n\nSkillPoints\nSkilLoop uses SkillPoints as an internal platform credit system.\nWe may record:\n• SkillPoints awarded to your account\n• SkillPoints used for eligible platform activities\n• SkillPoint-related activity\n• Activities that result in SkillPoint rewards\n\nSkillPoints are currently not cash and cannot be withdrawn or redeemed for money." },
  { num: 3, title: "Information We Do Not Currently Collect", text: "At launch, SkilLoop does not intentionally collect:\n• Precise location information\n• GPS information\n• Location history\n• Private messages between users\n• Session recordings\n• Advertising profiles\n• Analytics data for advertising purposes\n\nSome third-party services may process limited technical information as necessary to provide their services." },
  { num: 4, title: "How We Use Information", text: "We may use personal information to:\n• Create and maintain your account\n• Authenticate users\n• Provide the SkilLoop platform\n• Help users discover relevant skills\n• Facilitate skill-exchange sessions\n• Manage session requests and scheduling\n• Provide Zoom meeting functionality\n• Manage SkillPoints\n• Send important account and service notifications\n• Respond to support requests\n• Protect the security of the platform\n• Detect and prevent abuse, fraud, or unauthorized activity\n• Improve the reliability and functionality of SkilLoop\n• Enforce our Terms of Service and Community Guidelines\n\nWe do not currently use personal information for targeted advertising." },
  { num: 5, title: "Authentication Services", text: "SkilLoop supports account authentication through email/password and Google authentication.\n\nWhen you use Google authentication, Google may process information according to Google's own privacy practices.\n\nSkilLoop only receives information necessary to create and authenticate your SkilLoop account." },
  { num: 6, title: "Third-Party Services", text: "SkilLoop uses third-party services to operate parts of the platform. These may include:\n• Supabase — authentication, database, storage and related infrastructure\n• Google — authentication services\n• Zoom — video meeting services\n\nThese services may process information according to their respective privacy policies and terms.\n\nSkilLoop does not control the privacy practices of third-party services." },
  { num: 7, title: "Data Storage and Security", text: "SkilLoop uses reasonable technical and organizational measures to protect personal information from unauthorized access, loss, misuse, alteration, or disclosure.\n\nHowever, no internet-based service can guarantee absolute security.\n\nUsers are responsible for protecting their account credentials and should notify SkilLoop if they believe their account has been compromised." },
  { num: 8, title: "Data Retention", text: "We retain personal information for as long as reasonably necessary to:\n• Provide the platform\n• Maintain account records\n• Fulfill legitimate business purposes\n• Resolve disputes\n• Prevent abuse\n• Comply with applicable legal obligations\n\nWhen information is no longer reasonably required, we may delete or anonymize it, subject to applicable legal and operational requirements." },
  { num: 9, title: "Your Privacy Rights", text: "Depending on applicable law, you may have rights concerning your personal information, including the right to:\n• Request access to your personal information\n• Request correction of inaccurate information\n• Request deletion where applicable\n• Request information about how your data is processed\n• Withdraw certain forms of consent\n• Raise a privacy complaint\n\nTo make a privacy-related request, contact us using the contact details below." },
  { num: 10, title: "Children's Privacy", text: "SkilLoop is intended for individuals who are 18 years of age or older.\n\nWe do not knowingly provide accounts to individuals under 18.\n\nIf we become aware that an account belongs to someone under 18, we may take appropriate steps to remove the account and associated information where applicable." },
  { num: 11, title: "Changes to This Privacy Policy", text: "We may update this Privacy Policy from time to time.\n\nWhen we make material changes, we may update the \"Last Updated\" date and provide additional notice where appropriate." },
  { num: 12, title: "Contact", text: "SkilLoop\nEmail: support.skilloop@gmail.com" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-black">
      <div className="max-w-12xl mx-auto px-6 py-12">
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">SKILLOOP PRIVACY POLICY</h1>
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
