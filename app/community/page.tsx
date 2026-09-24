"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const sections = [
  { num: 1, title: "Our Community", text: "SkilLoop is built around a simple idea:\nEveryone has something to teach. Everyone has something to learn.\n\nFor that to work, users need to feel respected, safe, and comfortable participating.\n\nThese Community Guidelines explain the behavior we expect from everyone using SkilLoop." },
  { num: 2, title: "Be Respectful", text: "Treat other users with respect.\n\nDo not:\n• Insult or demean people.\n• Harass or threaten others.\n• Discriminate against people.\n• Make unwanted sexual or offensive comments.\n• Bully or intimidate another user.\n\nDisagreements are normal.\nDisrespect is not." },
  { num: 3, title: "Be Honest About Your Skills", text: "Only list skills you can reasonably teach.\n\nYou do not need to be the world's leading expert.\nYou simply need to have useful knowledge or experience that another person can learn from.\n\nBe honest about your experience and level of expertise." },
  { num: 4, title: "Come Ready to Teach and Learn", text: "SkilLoop works best when both people participate actively.\n\nIf you're teaching:\n• Prepare for the session.\n• Keep the session focused.\n• Explain clearly.\n• Encourage questions.\n• Respect the learner's level.\n\nIf you're learning:\n• Come prepared.\n• Ask questions.\n• Participate.\n• Respect the teacher's time.\n• Be open to learning." },
  { num: 5, title: "Respect the 15-Minute Session", text: "SkilLoop sessions are designed to be short and focused.\n\nUse the available time effectively.\nAvoid unnecessary delays, distractions, or behavior that prevents the session from being useful." },
  { num: 6, title: "Attend Sessions You Accept", text: "If you accept a session, make a reasonable effort to attend.\n\nIf you cannot attend:\nCommunicate as early as possible.\nDo not repeatedly accept sessions and fail to attend without explanation." },
  { num: 7, title: "Reviews and Feedback", text: "Give honest and constructive feedback.\n\nDo not:\n• Create fake reviews.\n• Manipulate ratings.\n• Threaten another user over a review.\n• Leave intentionally abusive feedback.\n• Use reviews to settle personal disputes.\n\nFeedback should help the community improve." },
  { num: 8, title: "SkillPoint Integrity", text: "SkillPoints are designed to encourage meaningful participation.\n\nDo not attempt to:\n• Create fake accounts to collect SkillPoints.\n• Manipulate sessions.\n• Fake completion.\n• Abuse reviews or feedback.\n• Exploit technical vulnerabilities.\n• Circumvent SkillPoint rules.\n\nAttempts to manipulate the SkillPoint system may result in account restrictions or termination." },
  { num: 9, title: "Privacy and Personal Information", text: "Respect other people's privacy.\n\nDo not share another user's:\n• Private contact information\n• Personal documents\n• Account information\n• Private communications\n• Other sensitive information\n\nwithout appropriate authorization.\n\nYou should also avoid sharing sensitive personal information unnecessarily." },
  { num: 10, title: "Zoom Conduct", text: "During video sessions, users must follow the same standards of respect that apply throughout SkilLoop.\n\nDo not use sessions for:\n• Harassment\n• Sexual misconduct\n• Hate speech\n• Fraud\n• Threats\n• Malicious activity\n• Unwanted solicitation" },
  { num: 11, title: "No Scams or Fraud", text: "SkilLoop is for genuine skill exchange.\n\nDo not use the platform to:\n• Scam users.\n• Request money through deceptive means.\n• Sell fraudulent services.\n• Misrepresent qualifications.\n• Conduct illegal activities.\n• Manipulate users." },
  { num: 12, title: "Report Problems", text: "If you experience inappropriate behavior, suspicious activity, harassment, fraud, or another serious issue, report it to SkilLoop.\n\nWhen reporting an issue, provide as much useful information as possible.\n\nReports may be reviewed by SkilLoop and appropriate action may be taken." },
  { num: 13, title: "Enforcement", text: "Violations may result in:\n• Warnings\n• Removal of content\n• Restrictions\n• Suspension\n• Account termination\n• Other appropriate action\n\nThe response may depend on the seriousness and frequency of the violation." },
  { num: 14, title: "The SkilLoop Standard", text: "Before every interaction, remember:\n\nTeach with patience.\nLearn with curiosity.\nCommunicate clearly.\nRespect people's time.\nGive honest feedback.\nKeep the community safe." },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-black">
      <div className="max-w-12xl mx-auto px-6 py-12">
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">SKILLOOP COMMUNITY GUIDELINES</h1>
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
