'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch, getAccessToken } from '@/lib/api';

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  category: string | null;
  description: string;
  status: string;
  requirement_completion_percentage: number;
}

interface Message {
  id: string;
  sender_type: 'user' | 'ai' | 'system';
  message: string;
  created_at: string;
}

interface Requirement {
  id: string;
  category: string;
  requirementKey: string;
  requirementValue: string | null;
  status: string;
}

interface TechRecommendation {
  frontend: string;
  backend: string;
  database: string;
  authentication: string;
  deployment: string;
  rationale: string;
}

interface FeatureRecommendation {
  must_have: string[];
  should_have: string[];
  future: string[];
}

export default function ProjectWorkspace() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { loading, isAuthenticated } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'tech' | 'roadmap' | 'docs'>('chat');
  
  // Project & Chat states
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  
  // Recommendations states
  const [techRec, setTechRec] = useState<TechRecommendation | null>(null);
  const [featureRec, setFeatureRec] = useState<FeatureRecommendation | null>(null);
  const [generatingTech, setGeneratingTech] = useState(false);
  const [generatingFeatures, setGeneratingFeatures] = useState(false);

  // Documentation states
  const [docType, setDocType] = useState<'prd'>('prd');
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [docId, setDocId] = useState<string>('');

  // Loading states
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 150) {
      setShowScrollBtn(true);
    } else {
      setShowScrollBtn(false);
    }
  };

  const promptStarters = [
    { label: '🛍️ E-commerce Web App', text: 'I want to build an e-commerce website for a clothing store.' },
    { label: '🍕 Food Delivery App', text: 'I want to build a food delivery web app connecting restaurants and customers.' },
    { label: '🏋️ Gym Booking Portal', text: 'I want to build a gym class booking portal.' },
    { label: '📊 SaaS Business Dashboard', text: 'I want to build a SaaS dashboard for tracking server performance.' },
  ];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSpeakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear the chat history? This will reset all requirements progress.')) return;
    setClearingChat(true);
    try {
      const res = await apiFetch(`/api/chat/history/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setMessages([]);
        if (project) {
          setProject({
            ...project,
            requirement_completion_percentage: 0,
            status: 'draft'
          });
        }
        const reqsRes = await apiFetch(`/api/requirements/${id}`);
        if (reqsRes.success && reqsRes.data) {
          setRequirements(reqsRes.data);
        }
        alert('Chat history cleared.');
      }
    } catch (err) {
      console.error('Failed to clear chat:', err);
    } finally {
      setClearingChat(false);
    }
  };

  const handleSendStarter = async (text: string) => {
    if (sendingMessage) return;
    setSendingMessage(true);

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender_type: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await apiFetch('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          project_id: id,
          message: text
        })
      });

      if (res.success && res.data) {
        const aiMessage: Message = {
          id: res.data.conversation_id || crypto.randomUUID(),
          sender_type: 'ai',
          message: res.data.ai_response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (project && res.data.requirement_completion_percentage !== undefined) {
          setProject({
            ...project,
            requirement_completion_percentage: res.data.requirement_completion_percentage
          });
        }

        const reqsRes = await apiFetch(`/api/requirements/${id}`);
        if (reqsRes.success && reqsRes.data) {
          setRequirements(reqsRes.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender_type: 'system',
        message: err.error?.message || 'Failed to send message. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, sendingMessage, activeTab]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch project details, requirements, and chat history
  const loadWorkspaceData = async () => {
    try {
      const [projectRes, historyRes, reqsRes, recsRes, docsListRes] = await Promise.all([
        apiFetch(`/api/projects/${id}`),
        apiFetch(`/api/chat/history/${id}`),
        apiFetch(`/api/requirements/${id}`),
        apiFetch(`/api/recommend/${id}`),
        apiFetch(`/api/docs/project/${id}`)
      ]);

      if (projectRes.success && projectRes.data) {
        setProject(projectRes.data);
      }
      if (historyRes.success && historyRes.data?.messages) {
        setMessages(historyRes.data.messages);
      }
      if (reqsRes.success && reqsRes.data) {
        setRequirements(reqsRes.data);
      }
      if (recsRes.success && recsRes.data) {
        const tech = recsRes.data.find((r: any) => r.recommendation_type === 'technology');
        const features = recsRes.data.find((r: any) => r.recommendation_type === 'features');
        if (tech) setTechRec(tech.recommendation_text);
        if (features) setFeatureRec(features.recommendation_text);
      }
      if (docsListRes.success && docsListRes.data && docsListRes.data.length > 0) {
        const activeDocMetadata = docsListRes.data.find((d: any) => d.document_type === docType);
        if (activeDocMetadata) {
          const docDetailRes = await apiFetch(`/api/docs/${activeDocMetadata.id}/export?format=json`);
          if (docDetailRes.success && docDetailRes.data) {
            setGeneratedDoc(docDetailRes.data.content);
            setDocId(docDetailRes.data.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      loadWorkspaceData();
    }
  }, [isAuthenticated, id]);

  // Load existing document of selected type when docType changes
  useEffect(() => {
    const loadExistingDoc = async () => {
      if (!id || !isAuthenticated || fetchingDetails) return;
      try {
        const docsListRes = await apiFetch(`/api/docs/project/${id}`);
        if (docsListRes.success && docsListRes.data) {
          const activeDocMetadata = docsListRes.data.find((d: any) => d.document_type === docType);
          if (activeDocMetadata) {
            setGeneratingDoc(true);
            const docDetailRes = await apiFetch(`/api/docs/${activeDocMetadata.id}/export?format=json`);
            if (docDetailRes.success && docDetailRes.data) {
              setGeneratedDoc(docDetailRes.data.content);
              setDocId(docDetailRes.data.id);
            }
          } else {
            setGeneratedDoc('');
            setDocId('');
          }
        }
      } catch (err) {
        console.error('Failed to load existing document of type:', docType, err);
      } finally {
        setGeneratingDoc(false);
      }
    };

    loadExistingDoc();
  }, [docType, id, isAuthenticated, fetchingDetails]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const currentInput = inputMessage.trim();
    setInputMessage('');
    setSendingMessage(true);

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender_type: 'user',
      message: currentInput,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await apiFetch('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          project_id: id,
          message: currentInput
        })
      });

      if (res.success && res.data) {
        const aiMessage: Message = {
          id: res.data.conversation_id || crypto.randomUUID(),
          sender_type: 'ai',
          message: res.data.ai_response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (project && res.data.requirement_completion_percentage !== undefined) {
          setProject({
            ...project,
            requirement_completion_percentage: res.data.requirement_completion_percentage
          });
        }

        // Fetch updated requirements
        const reqsRes = await apiFetch(`/api/requirements/${id}`);
        if (reqsRes.success && reqsRes.data) {
          setRequirements(reqsRes.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender_type: 'system',
        message: err.error?.message || 'Failed to send message. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Generate Tech Stack Recommendation
  const handleGenerateTech = async () => {
    setGeneratingTech(true);
    try {
      const res = await apiFetch('/api/recommend/technology', {
        method: 'POST',
        body: JSON.stringify({ project_id: id })
      });
      if (res.success && res.data) {
        setTechRec(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingTech(false);
    }
  };

  // Generate Features Recommendation
  const handleGenerateFeatures = async () => {
    setGeneratingFeatures(true);
    try {
      const res = await apiFetch('/api/recommend/features', {
        method: 'POST',
        body: JSON.stringify({ project_id: id })
      });
      if (res.success && res.data) {
        setFeatureRec(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingFeatures(false);
    }
  };

  // Generate Document
  const handleGenerateDoc = async (type: typeof docType) => {
    setGeneratingDoc(true);
    setGeneratedDoc('');
    try {
      const res = await apiFetch(`/api/docs/${type}`, {
        method: 'POST',
        body: JSON.stringify({ project_id: id })
      });
      if (res.success && res.data) {
        setGeneratedDoc(res.data.content);
        setDocId(res.data.document_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingDoc(false);
    }
  };

  // Download Document using authenticated blob fetch
  const handleDownloadDoc = async (format: 'md' | 'pdf' | 'docx') => {
    if (!docId) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${backendUrl}/api/docs/${docId}/export?format=${format}`, {
        headers
      });

      if (!res.ok) {
        throw new Error('Download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const ext = format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'md';
      a.download = `${project?.project_name || 'document'}_prd.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export document. Please try again.');
    }
  };

  if (loading || fetchingDetails) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Project workspace not found</h2>
        <Link 
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = project.requirement_completion_percentage === 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Workspace Sidebar */}
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="text-xs text-slate-400 hover:text-white transition-all font-semibold flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            &larr; Dashboard
          </Link>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {project.status}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight truncate">
            {project.project_name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {project.project_type || 'Web App'}
            </span>
          </div>
        </div>

        {/* Discovery Progress */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Discovery Progress</span>
            <span className="font-bold text-indigo-400">{project.requirement_completion_percentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${project.requirement_completion_percentage}%` }}
            />
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <nav className="flex flex-col gap-1.5 pt-4">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${activeTab === 'chat' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/15' : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            💬 Chat Discovery
          </button>
          <button 
            onClick={() => setActiveTab('summary')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${activeTab === 'summary' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/15' : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            📋 Project Summary
          </button>
          <button 
            onClick={() => setActiveTab('tech')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between gap-2.5 ${activeTab === 'tech' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/15' : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <span className="flex items-center gap-2.5">🚀 Tech Stack</span>
            {!isCompleted && <span className="text-xs">🔒</span>}
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between gap-2.5 ${activeTab === 'roadmap' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/15' : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <span className="flex items-center gap-2.5">📅 Roadmap</span>
            {!isCompleted && <span className="text-xs">🔒</span>}
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between gap-2.5 ${activeTab === 'docs' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/15' : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <span className="flex items-center gap-2.5">📄 Documentation</span>
            {!isCompleted && <span className="text-xs">🔒</span>}
          </button>
        </nav>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col bg-slate-950 h-full relative overflow-hidden">
        
        {/* Chat Discovery Tab */}
        {activeTab === 'chat' && (
          <section className="flex-1 flex flex-col h-full relative overflow-hidden">
            <header className="h-16 border-b border-slate-800 bg-slate-900/10 backdrop-blur-md px-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-slate-200">AI Website Development Mentor</span>
              </div>
              <button
                onClick={handleClearChat}
                disabled={clearingChat || messages.length === 0}
                className="text-xs font-bold text-slate-450 hover:text-red-400 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                🗑️ Clear Chat
              </button>
            </header>

            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col relative"
            >
              {messages.length === 0 && !sendingMessage && (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 py-8">
                  <div className="text-4xl">👋</div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">Start your discovery journey</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Describe details about your project or click one of the quick starters below. Your AI mentor will guide you one step at a time!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-2">
                    {promptStarters.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendStarter(starter.text)}
                        className="text-left p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs hover:border-indigo-500 hover:bg-slate-900 text-slate-300 hover:text-white transition-all shadow-sm hover:shadow-indigo-500/5"
                      >
                        <span className="font-semibold block text-indigo-400 pb-0.5">{starter.label}</span>
                        <span className="text-slate-400 leading-normal block truncate">{starter.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex w-full ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                      m.sender_type === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : m.sender_type === 'system'
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div>{m.message}</div>
                    
                    {m.sender_type !== 'system' && (
                      <div className="flex gap-2.5 mt-2.5 justify-end text-[10px] text-slate-400 border-t border-slate-800/40 pt-1.5 opacity-60 hover:opacity-100 transition-all select-none">
                        <button 
                          onClick={() => handleCopyText(m.message)} 
                          className="hover:text-white flex items-center gap-0.5"
                          title="Copy text"
                        >
                          📋 Copy
                        </button>
                        {m.sender_type === 'ai' && (
                          <button 
                            onClick={() => handleSpeakText(m.message)} 
                            className="hover:text-white flex items-center gap-0.5"
                            title="Read Aloud"
                          >
                            🔊 Listen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sendingMessage && (
                <div className="flex w-full justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce delay-0" />
                      <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce delay-150" />
                      <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce delay-300" />
                    </span>
                    <span>Mentor is formulating recommendations...</span>
                  </div>
                </div>
              )}
              
              {showScrollBtn && (
                <button 
                  onClick={scrollToBottom}
                  className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-4 py-2 shadow-xl border border-slate-850 z-20 transition-all hover:scale-105 active:scale-95 text-xs font-bold flex items-center gap-1"
                >
                  ↓ Scroll to latest
                </button>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/10">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-1.5 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-2xl px-3.5 py-0.5 transition-all">
                    <button 
                      type="button" 
                      onClick={() => alert('Attachments: Document/Image upload is locked in Dev mode.')}
                      className="text-slate-600 hover:text-slate-400 p-2 text-lg transition-all"
                      title="Attach File/Image"
                    >
                      📎
                    </button>
                    <input 
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={sendingMessage}
                      placeholder="Ask a question or provide details... (Supports English, Hindi, Marathi, Hinglish, Maranglish)"
                      className="flex-1 bg-transparent py-3.5 px-1.5 text-sm text-white focus:outline-none placeholder:text-slate-700 disabled:opacity-50"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => alert('Voice: Mic feature is locked in Dev mode.')}
                      className="text-slate-600 hover:text-slate-400 p-2 text-lg transition-all"
                      title="Voice Input"
                    >
                      🎙️
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!inputMessage.trim() || sendingMessage}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 h-12 w-12 rounded-2xl text-white flex items-center justify-center font-bold text-lg transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                  >
                    ➔
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-2.5">
                  Press <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 font-mono text-[9px] font-semibold text-slate-400">Enter</kbd> to send, <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 font-mono text-[9px] font-semibold text-slate-400">Shift + Enter</kbd> for a new line.
                </p>
              </form>
            </div>
          </section>
        )}

        {/* Project Summary Tab */}
        {activeTab === 'summary' && (
          <section className="flex-1 p-8 space-y-6 overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-white">Project Summary</h3>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Initial Idea</h4>
              <p className="text-slate-200 text-sm leading-relaxed">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Project Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Name</span>
                    <span className="font-semibold text-white">{project.project_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Project Type</span>
                    <span className="font-semibold text-indigo-400">{project.project_type || 'Web App'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-bold text-emerald-400">{project.requirement_completion_percentage}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center space-y-2">
                <span className="text-3xl">🎯</span>
                <h4 className="font-bold text-white">Requirement Discovery Status</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  {isCompleted 
                    ? 'All mandatory requirements have been successfully collected. You can now access full tech stack suggestions and roadmaps!'
                    : `Currently answering mandatory questions. Please continue chatting with the AI mentor in the Chat tab.`
                  }
                </p>
              </div>
            </div>

            {/* Requirements Discovery Checklist */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Requirement Discovery Checklist</h4>
              {requirements.length === 0 ? (
                <p className="text-sm text-slate-500">No requirements initialized yet. Start chatting in the Chat Discovery tab to initialize.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requirements.map((req) => (
                    <div 
                      key={req.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                        req.status === 'answered' || req.status === 'validated'
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : 'bg-slate-950 border-slate-800/85'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 capitalize tracking-wider">
                          {req.category.replace('_', ' ')}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          req.status === 'answered' || req.status === 'validated'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {req.requirementValue || 'Waiting for user input...'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tech Stack Tab */}
        {activeTab === 'tech' && (
          <section className="flex-1 p-8 space-y-6 overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-white">Technology Recommendation</h3>
            
            {!isCompleted ? (
              <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-12 backdrop-blur-md">
                <span className="text-4xl">🔒</span>
                <h4 className="text-lg font-bold text-white">Complete Discovery to Unlock</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  You must complete the requirement discovery flow (100% completion) in the Chat tab to unlock customized technology recommendations. Current progress: <strong>{project.requirement_completion_percentage}%</strong>
                </p>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="bg-indigo-650 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Continue Discovery
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Customized technology choices designed for your project scope & constraints.</p>
                  <button 
                    onClick={handleGenerateTech}
                    disabled={generatingTech}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5"
                  >
                    {generatingTech ? 'Generating...' : techRec ? 'Regenerate Stack' : 'Generate Recommendations'}
                  </button>
                </div>

                {techRec ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-indigo-400 uppercase">Frontend</span>
                      <h4 className="text-lg font-bold text-white">{techRec.frontend}</h4>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-violet-400 uppercase">Backend</span>
                      <h4 className="text-lg font-bold text-white">{techRec.backend}</h4>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-emerald-400 uppercase">Database</span>
                      <h4 className="text-lg font-bold text-white">{techRec.database}</h4>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-amber-400 uppercase">Authentication</span>
                      <h4 className="text-lg font-bold text-white">{techRec.authentication}</h4>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Deployment Strategy</span>
                      <h4 className="text-lg font-bold text-white">{techRec.deployment}</h4>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-slate-900/60 border border-slate-850 p-6 rounded-2xl space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Architectural Rationale</span>
                      <p className="text-sm text-slate-300 leading-relaxed">{techRec.rationale}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-sm">
                    No recommendations generated yet. Click "Generate Recommendations" above to start.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <section className="flex-1 p-8 space-y-6 overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-white">Development Roadmap</h3>

            {!isCompleted ? (
              <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-12 backdrop-blur-md">
                <span className="text-4xl">🔒</span>
                <h4 className="text-lg font-bold text-white">Complete Discovery to Unlock</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  You must complete the requirement discovery flow (100% completion) in the Chat tab to unlock the development roadmap. Current progress: <strong>{project.requirement_completion_percentage}%</strong>
                </p>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="bg-indigo-650 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Continue Discovery
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Step-by-step phases mapping tasks and deliverables for your project.</p>
                  <button 
                    onClick={handleGenerateFeatures}
                    disabled={generatingFeatures}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                  >
                    {generatingFeatures ? 'Generating...' : featureRec ? 'Regenerate Roadmap' : 'Generate Roadmap'}
                  </button>
                </div>

                {featureRec ? (
                  <div className="space-y-6 max-w-3xl">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                      <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-indigo-500/20" />
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="bg-indigo-600 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10">1</span>
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-white">Phase 1: Must-Have Features (MVP Core)</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                              {featureRec.must_have.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="bg-violet-600 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10">2</span>
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-white">Phase 2: Should-Have Features (Enhancements)</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                              {featureRec.should_have.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="bg-emerald-600 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10">3</span>
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-white">Phase 3: Future Releases (Scale)</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                              {featureRec.future.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-sm">
                    No roadmap phases generated yet. Click "Generate Roadmap" to fetch suggestions.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <section className="flex-1 p-8 space-y-6 overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-white">Project Documentation</h3>

            {!isCompleted ? (
              <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-12 backdrop-blur-md">
                <span className="text-4xl">🔒</span>
                <h4 className="text-lg font-bold text-white">Complete Discovery to Unlock</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  You must complete the requirement discovery flow (100% completion) in the Chat tab to generate documentation guides. Current progress: <strong>{project.requirement_completion_percentage}%</strong>
                </p>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="bg-indigo-650 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Continue Discovery
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Product Requirements Document (PRD)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleGenerateDoc(docType)}
                    disabled={generatingDoc}
                    className="bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                  >
                    {generatingDoc ? 'Generating Document...' : 'Generate New version'}
                  </button>
                  {generatedDoc && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDownloadDoc('md')}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                      >
                        ⬇ Export Markdown (.md)
                      </button>
                      <button
                        onClick={() => handleDownloadDoc('pdf')}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                      >
                        ⬇ Export PDF (.pdf)
                      </button>
                      <button
                        onClick={() => handleDownloadDoc('docx')}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                      >
                        ⬇ Export Word (.docx)
                      </button>
                    </div>
                  )}
                </div>

                {generatingDoc && (
                  <div className="bg-slate-900 border border-slate-850 p-12 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <span className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-semibold">Mentor is generating your custom document guide...</p>
                  </div>
                )}

                {generatedDoc && !generatingDoc && (
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-4 max-w-4xl shadow-lg">
                    <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Document Preview</h4>
                    <pre className="text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed bg-slate-950 p-6 rounded-xl border border-slate-850">
                      {generatedDoc}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
