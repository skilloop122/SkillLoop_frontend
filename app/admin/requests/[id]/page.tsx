"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Calendar,
  Video,
  Clock,
  TrendingUp,
  Link as LinkIcon,
  FileText,
  Trash2,
  CheckCircle,
  Clock3,
  Send,
  Zap,
} from "lucide-react";
import { AdminSideNav } from "@/components/AdminSideNav";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import Image from "next/image";

export default function RequestDetailsPage() {
  const router = useRouter();
  // const { id } = useParams<{ id: string }>();
  const { hydrated, token } = useAdminAuthStore();

  if (!hydrated) return null;
  if (!token) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 flex text-black">
      <AdminSideNav />
      <main className="flex-1 md:ml-64 pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
          <button
            onClick={() => router.back()}
            className="mb-6 h-10 w-10 rounded-lg border bg-white flex items-center justify-center shadow-sm hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-3xl font-bold mb-1">Requests Details</h1>
          <p className="text-gray-500 mb-8">View and manage the details of this skill request.</p>

          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Request ID</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">REQ-2026-0124</span>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-sm font-medium border border-amber-200">
                Pending
              </span>
              <span className="text-sm text-gray-500">This request is awaiting approval.</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Skill summary card */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex items-center gap-5 md:w-1/3">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-4 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">UI/UX Design</h2>
                  <span className="px-3 py-1 bg-purple-50 text-purple-500 rounded-full text-xs font-medium border border-purple-200">Design</span>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-100"></div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8 md:flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Requested on</p>
                    <p className="text-sm font-semibold">May 20, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <Video size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Session Type</p>
                    <p className="text-sm font-semibold">Zoom Meeting</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                    <p className="text-sm font-semibold">1-2 hours per session.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Demand Level</p>
                    <span className="px-3 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-200">High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Involved */}
            <div>
              <h3 className="text-lg font-bold mb-4">Users Involved</h3>
              <div className="flex flex-col md:flex-row items-stretch gap-4 relative">
                {/* Link icon in the middle */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full items-center justify-center text-sky-500 z-10 border border-white">
                  <LinkIcon size={20} className="stroke-3" />
                </div>

                <div className="flex-1 bg-white border rounded-2xl p-5 shadow-sm">
                  <p className="text-sm font-semibold mb-4">Requester</p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        <Image src="https://i.pravatar.cc/150?u=hannah" alt="Hannah Stevenson" className="w-full h-full object-cover" width={20} height={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Hannah Stevenson</p>
                        <p className="text-xs text-gray-500">stevensonhannah01@gmail.com</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 rounded-full border border-sky-200 text-sky-500 text-xs font-semibold hover:bg-sky-50 transition">
                      View Profile
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-center pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-semibold flex items-center justify-center gap-1"><span className="text-amber-400 text-sm">★</span> 4.6</p>
                      <p className="text-[10px] text-gray-500 mt-1">Avg. Rating</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">12</p>
                      <p className="text-[10px] text-gray-500 mt-1">Completed Sessions</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">10</p>
                      <p className="text-[10px] text-gray-500 mt-1">Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border rounded-2xl p-5 shadow-sm">
                  <p className="text-sm font-semibold mb-4">Receiver</p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        <Image src="https://i.pravatar.cc/150?u=jamie" alt="Jamie Lecthin" className="w-full h-full object-cover" width={20} height={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Jamie Lecthin</p>
                        <p className="text-xs text-gray-500">lecthinjamie01@gmail.com</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 rounded-full border border-sky-200 text-sky-500 text-xs font-semibold hover:bg-sky-50 transition">
                      View Profile
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-center pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-semibold flex items-center justify-center gap-1"><span className="text-amber-400 text-sm">★</span> 4.7</p>
                      <p className="text-[10px] text-gray-500 mt-1">Avg. Rating</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">15</p>
                      <p className="text-[10px] text-gray-500 mt-1">Completed Sessions</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">12</p>
                      <p className="text-[10px] text-gray-500 mt-1">Reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="text-sm font-semibold w-40">Preferred Schedule :</span>
                <div className="flex flex-wrap gap-3 text-xs items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0ea5e9] text-white px-3 py-1 rounded-full font-medium">Monday</span>
                    <span className="text-gray-500">12:00 AM-1:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0ea5e9] text-white px-3 py-1 rounded-full font-medium">Wednesday</span>
                    <span className="text-gray-500">10:00 AM-11:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0ea5e9] text-white px-3 py-1 rounded-full font-medium">Friday</span>
                    <span className="text-gray-500">12:00 AM-1:00 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="text-sm font-semibold w-40">Session Format :</span>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-[#0ea5e9] rounded-full flex items-center justify-center text-white">
                    <Video size={10} />
                  </div>
                  Zoom Meeting
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <span className="text-sm font-semibold w-40">Additional Notes :</span>
                <span className="text-sm text-gray-600">I prefer short sessions and hands on projects.</span>
              </div>
            </div>

            {/* Bottom Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Timeline */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-8">Timeline</h3>
                
                <div className="relative pl-10 space-y-12 before:absolute before:inset-0 before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-400">
                  
                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shadow z-10">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-24 text-xs font-medium text-gray-600">10:30 AM</div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-800 text-sm">Request Created</div>
                        <div className="text-xs text-gray-400 mt-1">Hannah created this request.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow z-10">
                      <Send size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-24 text-xs font-medium text-gray-600">10:35 AM</div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-800 text-sm">Request Submitted</div>
                        <div className="text-xs text-gray-400 mt-1">Request was submitted and awaiting review.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-gray-300 text-white flex items-center justify-center shadow z-10">
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-24 text-xs font-medium text-gray-500"></div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-800 text-sm">Request Accepted</div>
                        <div className="text-xs text-gray-400 mt-1">Waiting on receiver&apos;s decision.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-gray-300 text-white flex items-center justify-center shadow z-10">
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-24 text-xs font-medium text-gray-500"></div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-800 text-sm">Session Scheduled</div>
                        <div className="text-xs text-gray-400 mt-1">No schedules yet.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-gray-300 text-white flex items-center justify-center shadow z-10">
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-24 text-xs font-medium text-gray-500"></div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-800 text-sm">Completed</div>
                        <div className="text-xs text-gray-400 mt-1">Not yet completed.</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Reports & Actions */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-between w-full mb-6">
                    <h3 className="font-bold">Reports</h3>
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">0</span>
                  </div>
                  <CheckCircle size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">No reports were found in this request.</p>
                </div>

                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-6">
                    <Zap size={18} className="text-[#0ea5e9] fill-[#0ea5e9]" /> Quick Action
                  </h3>
                  <div className="space-y-5 text-sm">
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left">
                      <Send size={16} className="text-green-500" />
                      Send a message to the Requester.
                    </button>
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left">
                      <Send size={16} className="text-green-500" />
                      Send a message to the Receiver.
                    </button>
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left">
                      <Clock3 size={16} className="text-amber-500" />
                      View Session History.
                    </button>
                    <button className="flex items-center gap-3 text-red-600 hover:text-red-700 transition w-full text-left">
                      <Trash2 size={16} />
                      Delete this Request.
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-end gap-4 mt-2">
              <button className="px-6 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition">
                Delete Feedback
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-[#0ea5e9] text-white font-semibold text-sm hover:bg-sky-600 transition">
                Mark as Completed
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
