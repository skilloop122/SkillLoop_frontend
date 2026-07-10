"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Clock,
  Star,
  Quote,
  CheckCircle,
  FileText,
  Send,
  Zap,
  MessageCircle,
  File,
  Users,
  Trash2,
} from "lucide-react";
import { AdminSideNav } from "@/components/AdminSideNav";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import Image from "next/image";

export default function FeedbackDetailsPage() {
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

          <div className="flex flex-col gap-6">
            
            {/* Top User & Rating Card */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
              
              {/* Reviewer */}
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  <Image src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Larkson" className="w-full h-full object-cover" width={20} height={20}/>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg text-gray-900">Sarah Larkson</h3>
                  <p className="text-xs text-gray-500">larksonsarah01@gmail.com</p>
                  <button className="text-[#0ea5e9] border border-sky-200 bg-sky-50 rounded-full px-4 py-1 text-xs font-semibold w-fit mt-1">
                    View Profile
                  </button>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-100"></div>

              {/* Middle Context */}
              <div className="flex flex-col items-center justify-center w-full md:w-1/3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={16} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Feedback for</p>
                    <p className="font-bold text-sm text-gray-800">UI/UX Design</p>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 uppercase tracking-widest relative px-4 w-full text-center my-1">
                  <span className="bg-white relative z-10 px-2">With</span>
                  <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 z-0" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <Image src="https://i.pravatar.cc/150?u=jamie" alt="Jamie Lecthin" className="w-full h-full object-cover" width={20} height={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Jamie Lecthin</p>
                    <button className="text-[#0ea5e9] border border-sky-200 bg-sky-50 rounded-full px-3 py-0.5 text-[10px] font-semibold w-fit mt-0.5">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-100"></div>

              {/* Rating */}
              <div className="flex flex-col items-center justify-center w-full md:w-1/3">
                <p className="font-semibold text-gray-800 mb-2">Rating</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                  <Star className="w-8 h-8 text-gray-200 fill-gray-200" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  4<span className="text-lg text-gray-400 font-medium">/5</span>
                </p>
              </div>

            </div>

            {/* Feedback Content */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Feedback</h3>
              <div className="relative p-4">
                <Quote className="absolute top-0 left-0 w-8 h-8 text-[#0ea5e9] fill-[#0ea5e9] -scale-x-100" />
                <p className="text-sm text-gray-600 px-10 leading-relaxed font-medium">
                  Great session! Jamie explained the concepts clearly and was very patient throughout the entire session. I was able to understand the fundamentals of UI/UX Design much better thanks to him. Looking forward to another session!
                </p>
                <Quote className="absolute bottom-0 right-0 w-8 h-8 text-[#0ea5e9] fill-[#0ea5e9] rotate-180" />
              </div>
            </div>

            {/* Session Context */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 text-gray-900">Session Context</h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                
                <div className="flex-1 flex flex-col items-center justify-center border-r-0 md:border-r border-gray-100 pb-6 md:pb-0 gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Request ID</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-gray-900">REQ-2026-0124</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Request Date</p>
                    <p className="text-sm font-bold text-gray-900">June 20,2026</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center border-r-0 md:border-r border-gray-100 pb-6 md:pb-0 gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <span className="px-4 py-1 rounded-full border border-green-300 text-green-600 text-xs font-semibold bg-green-50 inline-block">Reviewed</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Session Date</p>
                    <p className="text-sm font-bold text-gray-900">June 20,2026 at 4:00 PM</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 pl-0 md:pl-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-2">Requester</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <Image src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-full h-full object-cover" width={20} height={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">Sarah Larkson</span>
                        <button className="text-[#0ea5e9] border border-sky-200 bg-sky-50 rounded-full px-3 py-0.5 text-[10px] font-semibold w-fit mt-0.5">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-2">Receiver</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <Image src="https://i.pravatar.cc/150?u=jamie" alt="Jamie" className="w-full h-full object-cover" width={20} height={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">Jamie Lecthin</span>
                        <button className="text-[#0ea5e9] border border-sky-200 bg-sky-50 rounded-full px-3 py-0.5 text-[10px] font-semibold w-fit mt-0.5">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Section (Timeline & Right panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Timeline */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-8 text-gray-900">Timeline</h3>
                
                <div className="relative pl-10 space-y-12 before:absolute before:inset-0 before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-400">
                  
                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shadow z-10">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-32 text-center">
                        <div className="text-xs font-bold text-gray-900">June 15,2026</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">12:30 PM</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-900 text-sm">Request Created</div>
                        <div className="text-[11px] text-gray-500 mt-1">Sarah created this request.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow z-10">
                      <Send size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-32 text-center">
                        <div className="text-xs font-bold text-gray-900">June 15,2026</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">12:30 PM</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-900 text-sm">Request Submitted</div>
                        <div className="text-[11px] text-gray-500 mt-1 px-2">Request was submitted and awaiting review.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow z-10">
                      <CheckCircle size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-32 text-center">
                        <div className="text-xs font-bold text-gray-900">June 17,2026</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">12:30 PM</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-900 text-sm">Request Accepted</div>
                        <div className="text-[11px] text-gray-500 mt-1 px-2">Receiver has agreed to the session request.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow z-10">
                      <CheckCircle size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-32 text-center">
                        <div className="text-xs font-bold text-gray-900">June 18,2026</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">11:30 AM</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-900 text-sm">Session Scheduled</div>
                        <div className="text-[11px] text-gray-500 mt-1 px-4">Session between Sarah and Jamie have been scheduled.</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-[-2.15rem] w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow z-10">
                      <CheckCircle size={16} />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-32 text-center">
                        <div className="text-xs font-bold text-gray-900">June 20,2026</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">10:30 AM</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-gray-900 text-sm">Session Completed</div>
                        <div className="text-[11px] text-gray-500 mt-1 px-4">Session between both users has been completed.</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Reports & Actions */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-between w-full mb-6">
                    <h3 className="font-bold text-gray-900">Reports</h3>
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">0</span>
                  </div>
                  <CheckCircle size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">No reports were found in this request.</p>
                </div>

                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-6 text-gray-900">
                    <Zap size={18} className="text-[#0ea5e9] fill-[#0ea5e9]" /> Quick Action
                  </h3>
                  <div className="space-y-5 text-sm">
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                      <MessageCircle size={16} className="text-[#0ea5e9]" />
                      View Conversation.
                    </button>
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                      <File size={16} className="text-purple-500" />
                      View related requests.
                    </button>
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                      <Clock size={16} className="text-amber-500" />
                      View Session History.
                    </button>
                    <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                      <Users size={16} className="text-sky-400" />
                      View users profile.
                    </button>
                    <button className="flex items-center gap-3 text-red-600 hover:text-red-700 transition w-full text-left font-medium">
                      <Trash2 size={16} />
                      Delete feedback history.
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button className="px-8 py-3 rounded-lg border border-[#0ea5e9] bg-white text-[#0ea5e9] font-semibold text-sm hover:bg-sky-50 transition">
                View Conversation
              </button>
              <button className="px-8 py-3 rounded-lg bg-[#0ea5e9] text-white font-semibold text-sm hover:bg-sky-600 transition">
                Mark as Completed
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
