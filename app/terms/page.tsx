"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const sections = [
    { num: 1, title: "Introduction", text: "These Terms of Service (“Terms”) govern your use of SkilLoop. By creating an account or using SkilLoop, you agree to these Terms. If you do not agree with these Terms, you should not use the platform." },
    { num: 2, title: "Eligibility", text: "You must be at least 18 years old to create or use a SkilLoop account. By using SkilLoop, you confirm that:\n• You are at least 18 years old.\n• The information you provide is accurate.\n• You will keep your account information up to date.\n• You will use the platform in accordance with these Terms." },
    { num: 3, title: "Your Account", text: "You are responsible for maintaining the security of your account. You must not:\n• Share your password with another person.\n• Allow another person to use your account.\n• Create accounts using false identities.\n• Impersonate another person.\n• Use another person's account without authorization.\nYou are responsible for activity occurring through your account." },
    { num: 4, title: "Your Profile", text: "You may create a profile containing information such as your name, biography, skills you can teach, and skills you want to learn. You agree that information you provide should be accurate and should not intentionally mislead other users. You should only list skills you are reasonably able to teach." },
    { num: 5, title: "Skill Exchange", text: "SkilLoop facilitates peer-to-peer skill exchange between users. SkilLoop does not guarantee:\n• The skill level of another user.\n• The quality of a teaching session.\n• That another user will provide accurate information.\n• That a user will attend a scheduled session.\n• That a particular learning outcome will be achieved.\nUsers are responsible for evaluating information and deciding whether it is appropriate for their individual circumstances." },
    { num: 6, title: "Sessions", text: "Users may request and accept skill-exchange sessions through the platform. A session may include:\n• A selected skill\n• A teacher and learner\n• A scheduled date and time\n• A session duration\n• A Zoom meeting link.\nUsers are expected to attend sessions they accept or communicate as early as reasonably possible if they cannot attend." },
    { num: 7, title: "Zoom Sessions", text: "SkilLoop may use Zoom to facilitate video sessions. Zoom is a third-party service and is subject to Zoom's own terms and policies. SkilLoop does not currently record or store session video or audio. Users should avoid sharing sensitive personal information during sessions unless necessary and appropriate." },
    { num: 8, title: "SkillPoints", text: "SkilLoop uses SkillPoints as an internal platform credit system. Users may receive SkillPoints through eligible activities, which may include:\n• Signing up\n• Teaching skills\n• Completing sessions\n• Providing reviews or feedback\n• Completing eligible platform activities\nSkillPoint rules may change as SkilLoop develops. SkillPoints are not cash. Unless SkilLoop expressly introduces a feature allowing otherwise, SkillPoints:\n• Cannot be withdrawn as money.\n• Cannot be transferred for cash outside the platform.\n• Do not represent a monetary deposit.\n• Have no cash value." },
    { num: 9, title: "Future Paid Features", text: "SkilLoop may introduce paid features in the future, including paid SkillPoints, subscriptions, premium functionality, or other services. If paid features are introduced, additional terms, pricing information, refund rules, and payment conditions may apply. Nothing in these Terms requires SkilLoop to introduce paid services." },
    { num: 10, title: "Reviews and Feedback", text: "Users may be allowed to provide feedback or reviews after sessions. Reviews should be:\n• Honest\n• Relevant\n• Respectful\n• Based on actual experiences.\nUsers must not manipulate reviews, create fake reviews, threaten others for reviews, or use reviews to harass another user." },
    { num: 11, title: "Prohibited Conduct", text: "You must not use SkilLoop to:\n• Harass, threaten, intimidate, or abuse another person.\n• Discriminate against another person.\n• Scam or defraud users.\n• Impersonate another person.\n• Share malicious software.\n• Attempt unauthorized access to accounts or systems.\n• Exploit security vulnerabilities.\n• Manipulate SkillPoints.\n• Create fake accounts for abuse or manipulation.\n• Misrepresent your skills intentionally.\n• Use SkilLoop for unlawful activities.\n• Attempt to interfere with the operation of the platform.\n• Circumvent platform restrictions.\n• Share another user's private information without authorization." },
    { num: 12, title: "User Content", text: "You retain ownership of content you create and submit to SkilLoop, subject to the rights necessary for SkilLoop to operate the platform. By submitting content, you grant SkilLoop permission to host, store, display, and process that content as reasonably necessary to provide the service. You must not submit content that:\n• Violates applicable law.\n• Infringes another person's intellectual property rights.\n• Contains malicious code.\n• Is fraudulent or intentionally misleading.\n• Violates these Terms or our Community Guidelines." },
    { num: 13, title: "Intellectual Property", text: "SkilLoop's branding, website, software, designs, logos, content, and other platform materials are owned by or licensed to SkilLoop unless otherwise stated. You may not copy, reproduce, modify, distribute, sell, or commercially exploit SkilLoop's proprietary materials without authorization." },
    { num: 14, title: "Safety", text: "SkilLoop connects people with one another, and users are responsible for exercising reasonable judgment when interacting with others. Do not share sensitive information unnecessarily. If another user behaves inappropriately, violates these Terms, or creates a safety concern, report the issue to SkilLoop." },
    { num: 15, title: "Reporting and Enforcement", text: "SkilLoop may investigate reports of violations. Depending on the circumstances, we may:\n• Issue warnings.\n• Remove content.\n• Restrict platform functionality.\n• Suspend an account.\n• Terminate an account.\n• Take other appropriate action.\nWe may also take action where necessary to protect users, SkilLoop, or the integrity of the platform." },
    { num: 16, title: "Suspension and Termination", text: "You may stop using SkilLoop at any time. SkilLoop may suspend or terminate accounts that:\n• Violate these Terms.\n• Abuse the platform.\n• Create security or safety risks.\n• Engage in fraudulent activity.\n• Provide materially false information.\n• Otherwise create serious risks for the platform or community.\nWhere appropriate, we may provide notice before taking action." },
    { num: 17, title: "Platform Availability", text: "We aim to keep SkilLoop available and reliable, but we do not guarantee uninterrupted access. The platform may occasionally be unavailable because of:\n• Maintenance\n• Updates\n• Technical failures\n• Third-party service outages\n• Security incidents\n• Circumstances beyond our reasonable control." },
    { num: 18, title: "Third-Party Services", text: "SkilLoop may rely on third-party services including Supabase, Google, Zoom, hosting providers, and other infrastructure providers. Third-party services may have their own terms, policies, limitations, and availability." },
    { num: 19, title: "Disclaimers", text: "SkilLoop provides a platform for people to connect and exchange skills. SkilLoop does not guarantee the accuracy, completeness, or quality of information provided by users. Information shared by users should not automatically be treated as professional advice. Users are responsible for determining whether information received through SkilLoop is suitable for their circumstances." },
    { num: 20, title: "Limitation of Liability", text: "To the extent permitted by applicable law, SkilLoop will not be responsible for losses arising from:\n• User-to-user interactions.\n• Information provided by users.\n• Third-party services.\n• Temporary platform interruptions.\n• Unauthorized actions outside SkilLoop's reasonable control.\nNothing in these Terms excludes liability that cannot legally be excluded under applicable law." },
    { num: 21, title: "Changes to These Terms", text: "We may update these Terms as SkilLoop develops. Material changes may be communicated through the platform or other appropriate channels. Your continued use of SkilLoop after updated Terms take effect may constitute acceptance of the updated Terms to the extent permitted by applicable law." },
    { num: 22, title: "Governing Law", text: "These Terms are intended to be governed by applicable laws of Nigeria, subject to any mandatory legal requirements that may apply." },
    { num: 23, title: "Contact", text: "SkilLoop\nEmail: support.skilloop@gmail.com]" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-black">
      <div className="max-w-12xl mx-auto px-6 py-12">
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">SKILLOOP TERMS OF SERVICE</h1>
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
