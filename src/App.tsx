import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Folder, Plus, Search, Trash2, Pin,
  Moon, Sun, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3,
  Quote, Code, FolderPlus, Copy, ChevronLeft, PanelLeft, Download,
  Image as ImageIcon, Sparkles, Check, Hash, RotateCcw, X
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  updatedAt: number;
}

interface CustomFolder {
  id: string;
  name: string;
}

interface AccentColor {
  id: string;
  name: string;
  hex: string;
  bg: string;
  text: string;
  activeBg: string;
  cardActive: string;
  badge: string;
}

const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'gold',
    name: 'Gold',
    hex: '#D4A017',
    bg: 'bg-[#D4A017]',
    text: 'text-[#D4A017]',
    activeBg: 'bg-[#D4A017]/15 dark:bg-[#D4A017]/25 text-[#8B6A0E] dark:text-[#F3D382]',
    cardActive: 'bg-[#D4A017] text-white',
    badge: 'bg-[#D4A017]/15 text-[#8B6A0E] dark:text-[#F3D382]'
  },
  {
    id: 'blue',
    name: 'SF Blue',
    hex: '#007AFF',
    bg: 'bg-[#007AFF]',
    text: 'text-[#007AFF]',
    activeBg: 'bg-[#007AFF]/15 dark:bg-[#007AFF]/25 text-[#0055B3] dark:text-[#80BFFF]',
    cardActive: 'bg-[#007AFF] text-white',
    badge: 'bg-[#007AFF]/15 text-[#0055B3] dark:text-[#80BFFF]'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    hex: '#34C759',
    bg: 'bg-[#34C759]',
    text: 'text-[#34C759]',
    activeBg: 'bg-[#34C759]/15 dark:bg-[#34C759]/25 text-[#1E7434] dark:text-[#8EE6A6]',
    cardActive: 'bg-[#34C759] text-white',
    badge: 'bg-[#34C759]/15 text-[#1E7434] dark:text-[#8EE6A6]'
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#AF52DE',
    bg: 'bg-[#AF52DE]',
    text: 'text-[#AF52DE]',
    activeBg: 'bg-[#AF52DE]/15 dark:bg-[#AF52DE]/25 text-[#703091] dark:text-[#D19DEB]',
    cardActive: 'bg-[#AF52DE] text-white',
    badge: 'bg-[#AF52DE]/15 text-[#703091] dark:text-[#D19DEB]'
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: '✨ Welcome to Apple Notes',
    content: `<h1>✨ Welcome to Apple Notes</h1>
<p>An exceptionally polished macOS-style notes experience engineered for Windows 10.</p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Authentic Apple San Francisco typography &amp; layout</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Interactive checklists with circular checkboxes</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Automatic hashtag extraction into sidebar tags</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Image attachment support directly in notes</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Export notes to Markdown, Plain Text, or HTML</p></div></li>
</ul>
<h3>💡 Pro Tip</h3>
<p>Type hashtags like #ideas or #work anywhere in your note, and they will automatically appear in your sidebar tags filter!</p>`,
    folder: 'quick',
    tags: ['welcome', 'guide', 'ideas'],
    pinned: true,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: '💡 Design System Checklist',
    content: `<h2>💡 macOS Design System Checklist</h2>
<p>Precision UI elements inspired by modern Apple Notes:</p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>3-column flexbox layout with smooth responsive collapse</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Accent color switcher (Gold, SF Blue, Emerald, Purple)</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Seamless dark mode and light mode switching</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Trash and Recently Deleted note recovery</p></div></li>
</ul>
<blockquote>Crafted with care for Windows desktop users.</blockquote>
<p>Tags: #design #ui #macOS</p>`,
    folder: 'personal',
    tags: ['design', 'ui', 'macos'],
    pinned: false,
    updatedAt: Date.now() - 7200000,
  }
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('apple_notes_win10_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_NOTES;
  });

  const [customFolders, setCustomFolders] = useState<CustomFolder[]>(() => {
    const saved = localStorage.getItem('apple_notes_win10_folders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'quick', name: 'Quick Notes' },
      { id: 'personal', name: 'Personal' },
      { id: 'work', name: 'Work' }
    ];
  });

  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('apple_notes_theme') === 'dark';
  });
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const savedId = localStorage.getItem('apple_notes_accent');
    return ACCENT_COLORS.find(c => c.id === savedId) || ACCENT_COLORS[0];
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showMobileNotes, setShowMobileNotes] = useState<boolean>(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingFromEditor = useRef<boolean>(false);

  // Sync accent color CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-theme-color', accentColor.hex);
    localStorage.setItem('apple_notes_accent', accentColor.id);
  }, [accentColor]);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('apple_notes_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('apple_notes_theme', 'light');
    }
  }, [darkMode]);

  // Save notes & folders
  useEffect(() => {
    localStorage.setItem('apple_notes_win10_data', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('apple_notes_win10_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  // TipTap Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start typing your note...' }),
      Image.configure({ inline: true, allowBase64: true }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      isUpdatingFromEditor.current = true;
      const html = editor.getHTML();
      updateActiveNoteContent(html);
    },
  });

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Load note content into editor when switching active note
  useEffect(() => {
    if (editor && activeNote) {
      if (!isUpdatingFromEditor.current) {
        editor.commands.setContent(activeNote.content || '<p></p>');
      }
      isUpdatingFromEditor.current = false;
    } else if (editor && !activeNote) {
      editor.commands.setContent('');
    }
  }, [activeNoteId]);

  // Extract hashtags from plain text
  const extractTags = (text: string): string[] => {
    const matches = text.match(/#([a-zA-Z0-9_-]+)/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.slice(1).toLowerCase())));
  };

  const updateActiveNoteContent = (content: string) => {
    if (!activeNote) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || '';
    const tags = extractTags(plainText);

    const firstHeading = tempDiv.querySelector('h1, h2, h3, p');
    const rawTitle = firstHeading?.textContent?.trim() || 'Untitled Note';

    setNotes(prevNotes =>
      prevNotes.map(n =>
        n.id === activeNote.id
          ? { ...n, title: rawTitle, content, tags, updatedAt: Date.now() }
          : n
      )
    );
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (activeFolder === 'trash') {
        if (note.folder !== 'trash') return false;
      } else {
        if (note.folder === 'trash') return false;
        if (activeFolder !== 'all' && note.folder !== activeFolder) return false;
      }
      if (selectedTag && !note.tags.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const plainText = note.content.replace(/<[^>]*>?/gm, '').toLowerCase();
        return note.title.toLowerCase().includes(q) || plainText.includes(q);
      }
      return true;
    });
  }, [notes, activeFolder, selectedTag, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.pinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter(n => !n.pinned), [filteredNotes]);

  // All discovered tags across active non-trash notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.filter(n => n.folder !== 'trash').forEach(n => {
      n.tags.forEach(t => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  const createNewNote = () => {
    const targetFolder = (activeFolder === 'all' || activeFolder === 'trash') ? 'quick' : activeFolder;
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '<p></p>',
      folder: targetFolder,
      tags: selectedTag ? [selectedTag] : [],
      pinned: false,
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setShowMobileNotes(false);
    setTimeout(() => {
      if (editor) {
        editor.commands.setContent('<p></p>');
        editor.commands.focus();
      }
    }, 10);
  };

  const togglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const moveToTrash = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, folder: 'trash', pinned: false } : n));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id && n.folder !== 'trash');
      setActiveNoteId(remaining[0]?.id || '');
    }
  };

  const restoreFromTrash = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, folder: 'quick' } : n));
  };

  const permanentlyDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id && n.folder === 'trash');
      setActiveNoteId(remaining[0]?.id || '');
    }
  };

  const emptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all notes in Recently Deleted?')) {
      setNotes(prev => prev.filter(n => n.folder !== 'trash'));
      setActiveNoteId('');
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folderId = 'folder-' + Date.now();
    setCustomFolders([...customFolders, { id: folderId, name: newFolderName.trim() }]);
    setNewFolderName('');
    setShowNewFolderModal(false);
    setActiveFolder(folderId);
  };

  const copyToClipboard = () => {
    if (!activeNote) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = activeNote.content;
    const text = tempDiv.textContent || '';
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const exportNote = (format: 'md' | 'txt' | 'html') => {
    if (!activeNote) return;
    let content = '';
    let mime = 'text/plain';
    const filename = `${(activeNote.title || 'Note').replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`;

    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeNote.title}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;}</style></head><body>${activeNote.content}</body></html>`;
      mime = 'text/html';
    } else if (format === 'md') {
      const temp = document.createElement('div');
      temp.innerHTML = activeNote.content;
      content = `# ${activeNote.title}\n\n${temp.textContent || ''}`;
      mime = 'text/markdown';
    } else {
      const temp = document.createElement('div');
      temp.innerHTML = activeNote.content;
      content = `${activeNote.title}\n\n${temp.textContent || ''}`;
      mime = 'text/plain';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Words & Characters calculation
  const noteStats = useMemo(() => {
    if (!activeNote) return { words: 0, chars: 0 };
    const temp = document.createElement('div');
    temp.innerHTML = activeNote.content;
    const text = (temp.textContent || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    return { words, chars };
  }, [activeNote?.content]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'dark bg-[#121212] text-gray-100' : 'bg-[#F5F5F7] text-gray-900'}`}>

      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ======================================================================= */}
      {/* 1. SIDEBAR (FOLDERS & TAGS)                                             */}
      {/* ======================================================================= */}
      <aside
        className={`flex flex-col h-full border-r flex-shrink-0 transition-all duration-200 z-30 select-none ${
          sidebarOpen ? 'w-64' : 'w-0 border-r-0 overflow-hidden'
        } ${darkMode ? 'bg-[#1C1C1E] border-white/10 text-gray-200' : 'bg-[#F2F2F7] border-black/10 text-gray-800'}`}
      >
        {/* Sidebar Header */}
        <div className="h-13 px-4 flex items-center justify-between border-b border-inherit flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg ${accentColor.bg} flex items-center justify-center text-white text-sm font-bold shadow-xs`}>
              
            </div>
            <span className="text-[13px] font-bold tracking-tight uppercase opacity-75">Folders</span>
          </div>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition opacity-75 hover:opacity-100"
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {/* Library Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5 opacity-45">Library</div>
            <div className="space-y-0.5">
              <SidebarItem
                icon={<Folder size={15} />}
                label="All Notes"
                count={notes.filter(n => n.folder !== 'trash').length}
                active={activeFolder === 'all' && selectedTag === null}
                onClick={() => { setActiveFolder('all'); setSelectedTag(null); }}
                accentColor={accentColor}
              />
              {customFolders.map(f => (
                <SidebarItem
                  key={f.id}
                  icon={<Folder size={15} />}
                  label={f.name}
                  count={notes.filter(n => n.folder === f.id).length}
                  active={activeFolder === f.id && selectedTag === null}
                  onClick={() => { setActiveFolder(f.id); setSelectedTag(null); }}
                  accentColor={accentColor}
                />
              ))}
              <SidebarItem
                icon={<Trash2 size={15} />}
                label="Recently Deleted"
                count={notes.filter(n => n.folder === 'trash').length}
                active={activeFolder === 'trash'}
                onClick={() => { setActiveFolder('trash'); setSelectedTag(null); }}
                accentColor={accentColor}
                isDestructive
              />
            </div>
          </div>

          {/* Tags Section */}
          {allTags.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5 opacity-45 flex items-center gap-1">
                <Hash size={11} />
                <span>Tags</span>
              </div>
              <div className="space-y-0.5">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag ? null : tag);
                      if (activeFolder === 'trash') setActiveFolder('all');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[12px] font-medium transition ${
                      selectedTag === tag
                        ? `${accentColor.cardActive} font-semibold shadow-xs`
                        : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="opacity-60 text-xs">#</span>
                      <span className="truncate">{tag}</span>
                    </div>
                    <span className="text-[10px] opacity-60 ml-2">
                      {notes.filter(n => n.folder !== 'trash' && n.tags.includes(tag)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="h-13 px-4 border-t border-inherit flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition opacity-75 hover:opacity-100"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} />}
          </button>
          <div className="flex items-center gap-2">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setAccentColor(c)}
                className={`w-3.5 h-3.5 rounded-full ${c.bg} transition-transform hover:scale-125 ${
                  accentColor.id === c.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[#1C1C1E]' : ''
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* ======================================================================= */}
      {/* 2. NOTE LIST COLUMN                                                     */}
      {/* ======================================================================= */}
      <section
        className={`flex flex-col h-full border-r flex-shrink-0 transition-all select-none w-72 md:w-80 ${
          showMobileNotes ? 'flex' : 'hidden md:flex'
        } ${darkMode ? 'bg-[#1E1E1E] border-white/10 text-gray-200' : 'bg-[#FAFAFA] border-black/10 text-gray-800'}`}
      >
        {/* Search & Header */}
        <div className="h-13 px-3 flex items-center gap-2 border-b border-inherit flex-shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition opacity-70 hover:opacity-100"
              title="Open Sidebar"
            >
              <PanelLeft size={16} />
            </button>
          )}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" size={13} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-7 py-1.5 rounded-lg text-[12px] outline-none transition focus:ring-1 focus:ring-gray-400/40 ${
                darkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-black/5 text-gray-900 placeholder-gray-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={createNewNote}
            className={`p-1.5 rounded-lg ${accentColor.bg} text-white shadow-xs hover:opacity-90 transition flex-shrink-0`}
            title="Create New Note"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Trash Banner if in Recently Deleted */}
        {activeFolder === 'trash' && (
          <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between text-[11px] text-red-500 font-medium">
            <span>Recently Deleted</span>
            {filteredNotes.length > 0 && (
              <button
                onClick={emptyTrash}
                className="hover:underline font-bold"
              >
                Empty Trash
              </button>
            )}
          </div>
        )}

        {/* Selected Tag Indicator */}
        {selectedTag && (
          <div className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border-b border-inherit flex items-center justify-between text-[11px]">
            <span className="opacity-70 flex items-center gap-1">
              Filter: <strong className="font-semibold text-inherit">#{selectedTag}</strong>
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className="opacity-50 hover:opacity-100 text-[10px] underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Notes Cards Stream */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center px-4 opacity-40">
              <p className="text-xs font-medium">No notes found</p>
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1 opacity-40">Pinned</div>
                  {pinnedNotes.map(n => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      active={activeNoteId === n.id}
                      onClick={() => { setActiveNoteId(n.id); setShowMobileNotes(false); }}
                      accentColor={accentColor}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}

              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <div className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1 opacity-40">Notes</div>
                  )}
                  {unpinnedNotes.map(n => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      active={activeNoteId === n.id}
                      onClick={() => { setActiveNoteId(n.id); setShowMobileNotes(false); }}
                      accentColor={accentColor}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. NOTE EDITOR COLUMN                                                   */}
      {/* ======================================================================= */}
      <main className={`flex-1 min-w-0 flex flex-col h-full overflow-hidden ${darkMode ? 'bg-[#121212] text-gray-100' : 'bg-white text-gray-900'}`}>

        {/* Top Header Bar */}
        <header className={`h-13 px-4 border-b flex items-center justify-between gap-2 flex-shrink-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            {/* Sidebar toggle if sidebar closed and note list not taking it */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition opacity-70 hover:opacity-100"
              title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            >
              <PanelLeft size={16} />
            </button>

            {/* Mobile back to notes button */}
            <button
              onClick={() => setShowMobileNotes(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition opacity-70"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Date timestamp */}
            <div className="text-[12px] font-medium opacity-50 whitespace-nowrap hidden sm:block">
              {activeNote ? new Date(activeNote.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
            </div>
          </div>

          {/* Center: Formatting Toolbar */}
          {editor && activeNote && activeNote.folder !== 'trash' && (
            <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl max-w-full overflow-x-auto no-scrollbar">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
                icon={<Bold size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
                icon={<Italic size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
                icon={<UnderlineIcon size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive('strike')}
                title="Strikethrough"
                icon={<Strikethrough size={14} />}
                accentColor={accentColor}
              />

              <div className="w-[1px] h-3.5 bg-black/15 dark:bg-white/15 mx-1" />

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
                icon={<Heading1 size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
                icon={<Heading2 size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
                icon={<Heading3 size={14} />}
                accentColor={accentColor}
              />

              <div className="w-[1px] h-3.5 bg-black/15 dark:bg-white/15 mx-1" />

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                title="Bullet List"
                icon={<List size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                title="Numbered List"
                icon={<ListOrdered size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                active={editor.isActive('taskList')}
                title="Checklist"
                icon={<CheckSquare size={14} />}
                accentColor={accentColor}
              />

              <div className="w-[1px] h-3.5 bg-black/15 dark:bg-white/15 mx-1" />

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                title="Blockquote"
                icon={<Quote size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive('codeBlock')}
                title="Code Block"
                icon={<Code size={14} />}
                accentColor={accentColor}
              />
              <ToolbarButton
                onClick={() => fileInputRef.current?.click()}
                active={false}
                title="Insert Image"
                icon={<ImageIcon size={14} />}
                accentColor={accentColor}
              />
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {activeNote && activeNote.folder === 'trash' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => restoreFromTrash(activeNote.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1.5 hover:opacity-90 transition"
                  title="Put Back"
                >
                  <RotateCcw size={13} />
                  <span>Put Back</span>
                </button>
                <button
                  onClick={() => permanentlyDelete(activeNote.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white flex items-center gap-1.5 hover:opacity-90 transition"
                  title="Delete Permanently"
                >
                  <Trash2 size={13} />
                  <span>Delete Forever</span>
                </button>
              </div>
            ) : (
              <>
                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    title="Export Note"
                  >
                    <Download size={16} />
                  </button>

                  {showExportMenu && (
                    <div className={`absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl border p-1 z-50 ${
                      darkMode ? 'bg-[#252528] border-white/10 text-white' : 'bg-white border-black/10 text-gray-800'
                    }`}>
                      <button
                        onClick={() => exportNote('md')}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/10 transition"
                      >
                        Export as Markdown (.md)
                      </button>
                      <button
                        onClick={() => exportNote('txt')}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/10 transition"
                      >
                        Export as Plain Text (.txt)
                      </button>
                      <button
                        onClick={() => exportNote('html')}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/10 transition"
                      >
                        Export as HTML (.html)
                      </button>
                    </div>
                  )}
                </div>

                {/* Copy content */}
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition relative"
                  title="Copy Note Text"
                >
                  {copiedNotification ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>

                {/* Pin Note */}
                <button
                  onClick={() => activeNote && togglePin(activeNote.id)}
                  className={`p-1.5 rounded-lg transition ${
                    activeNote?.pinned
                      ? 'text-amber-500'
                      : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  title={activeNote?.pinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin size={16} />
                </button>

                {/* Move to Trash */}
                <button
                  onClick={() => activeNote && moveToTrash(activeNote.id)}
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition"
                  title="Delete Note"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 w-full">
          {activeNote ? (
            <div className="max-w-3xl mx-auto apple-notes-editor">
              <EditorContent editor={editor} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
              <p className="text-sm font-medium">Select a note from the left, or create a new note.</p>
              <button
                onClick={createNewNote}
                className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold ${accentColor.bg} text-white shadow-xs`}
              >
                Create Note
              </button>
            </div>
          )}
        </div>

        {/* Status Bar */}
        {activeNote && (
          <footer className={`h-8 px-6 border-t flex items-center justify-between text-[11px] opacity-60 flex-shrink-0 ${
            darkMode ? 'border-white/10' : 'border-black/5'
          }`}>
            <div>
              {noteStats.words} words • {noteStats.chars} characters
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className={accentColor.text} />
              <span>Saved locally</span>
            </div>
          </footer>
        )}
      </main>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowNewFolderModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className={`relative w-full max-w-xs p-5 rounded-2xl shadow-2xl border ${
            darkMode ? 'bg-[#252528] border-white/10 text-white' : 'bg-white border-black/10 text-gray-900'
          }`}>
            <h3 className="text-sm font-bold mb-3">New Folder</h3>
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder Name"
              className={`w-full px-3 py-2 rounded-xl text-xs outline-none mb-4 ${
                darkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-black/5 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className={`px-3 py-1.5 rounded-lg text-white ${accentColor.bg} shadow-xs`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, active, title, icon, accentColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center ${
        active
          ? `${accentColor.bg} text-white shadow-xs`
          : 'opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

function SidebarItem({ icon, label, count, active, onClick, accentColor, isDestructive = false }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[12px] font-medium transition ${
        active
          ? isDestructive
            ? 'bg-red-500 text-white shadow-xs font-semibold'
            : `${accentColor.cardActive} font-semibold shadow-xs`
          : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? '' : isDestructive ? 'text-red-400' : 'opacity-70'}>{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-[11px] opacity-60">{count}</span>
    </button>
  );
}

function NoteCard({ note, active, onClick, accentColor, darkMode }: any) {
  const plainTextSnippet = useMemo(() => {
    return note.content.replace(/<[^>]*>?/gm, '').trim().substring(0, 60) || 'No text';
  }, [note.content]);

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition relative group mb-1 ${
        active
          ? `${accentColor.cardActive} shadow-md`
          : darkMode
          ? 'hover:bg-white/5 text-gray-200'
          : 'hover:bg-black/5 text-gray-800'
      }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <h4 className={`text-[13px] font-semibold truncate pr-3 ${active ? 'text-white' : ''}`}>
          {note.title || 'Untitled Note'}
        </h4>
        {note.pinned && (
          <Pin size={11} className={active ? 'text-white/90' : 'text-[#D4A017]'} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-white/90' : 'opacity-50'}`}>
          {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <p className={`text-[11px] truncate ${active ? 'text-white/80' : 'opacity-60'}`}>
          {plainTextSnippet}
        </p>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {note.tags.slice(0, 3).map((t: string) => (
            <span
              key={t}
              className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                active
                  ? 'bg-white/20 text-white'
                  : darkMode
                  ? 'bg-white/10 text-gray-300'
                  : 'bg-black/5 text-gray-600'
              }`}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
