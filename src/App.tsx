import React, { useState, useEffect, useRef } from 'react';
import {
  Folder, FileText, Plus, Search, Trash2, Pin, CheckSquare, Square,
  Tag, Settings, Moon, Sun, Download, Upload, Bold, Italic, List,
  Heading1, Heading2, MoreHorizontal, ChevronRight, ChevronDown, Check,
  Lock, Unlock, Share2, HelpCircle, Image as ImageIcon, Sparkles,
  Palette, Eye, Edit3, X, FolderPlus, FileDown, Printer, Copy
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  password?: string;
  images: string[];
  createdAt: number;
  updatedAt: number;
}

interface CustomFolder {
  id: string;
  name: string;
  icon?: string;
}

const ACCENT_COLORS = [
  { id: 'yellow', name: 'Gold', bg: 'bg-yellow-400', text: 'text-yellow-900', ring: 'ring-yellow-400', activeBg: 'bg-yellow-100/90 text-yellow-900', hoverBg: 'hover:bg-yellow-50', cardActive: 'bg-yellow-500 text-white' },
  { id: 'blue', name: 'San Francisco Blue', bg: 'bg-blue-500', text: 'text-blue-900', ring: 'ring-blue-500', activeBg: 'bg-blue-100/90 text-blue-900', hoverBg: 'hover:bg-blue-50', cardActive: 'bg-blue-500 text-white' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-900', ring: 'ring-emerald-500', activeBg: 'bg-emerald-100/90 text-emerald-900', hoverBg: 'hover:bg-emerald-50', cardActive: 'bg-emerald-500 text-white' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-900', ring: 'ring-purple-500', activeBg: 'bg-purple-100/90 text-purple-900', hoverBg: 'hover:bg-purple-50', cardActive: 'bg-purple-500 text-white' },
];

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: '✨ Welcome to Apple Notes Windows Edition',
    content: `# Welcome to Apple Notes (Windows 10)

Experience an exceptionally polished, ultra-responsive macOS Notes app built for Windows.

- [x] Translucent frosted glass sidebar
- [x] macOS San Francisco typography & visual aesthetics
- [x] Auto hashtag tag extraction (#welcome #guide)
- [x] Interactive round checklists
- [ ] Image attachment support
- [ ] Export to Markdown & PDF

### Quick Tip
Type hashtags like #ideas or #work anywhere in your note, and they will automatically appear in your sidebar tags list!`,
    folder: 'quick',
    tags: ['welcome', 'guide'],
    pinned: true,
    locked: false,
    images: [],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: '2',
    title: '💡 Design System & Aesthetic Checklist',
    content: `# macOS Design System Checklist

- [x] Pixel-perfect macOS Traffic Light window controls
- [x] Smooth light & dark theme transition
- [x] Accent color switcher (Gold, SF Blue, Emerald, Purple)
- [ ] Add sound effects on check completion
- [x] Instant real-time search & folder badges

#design #ui #macOS`,
    folder: 'personal',
    tags: ['design', 'ui', 'macOS'],
    pinned: false,
    locked: false,
    images: [],
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
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
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [showFormatMenu, setShowFormatMenu] = useState<boolean>(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('apple_notes_win10_data', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('apple_notes_win10_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Auto-extract tags from content
  const extractTags = (text: string): string[] => {
    const matches = text.match(/#([a-zA-Z0-9_\-]+)/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(t => t.replace('#', '').toLowerCase())));
  };

  // Filter notes logic
  const filteredNotes = notes.filter(note => {
    if (activeFolder === 'trash') {
      if (note.folder !== 'trash') return false;
    } else {
      if (note.folder === 'trash') return false;
      if (activeFolder !== 'all' && note.folder !== activeFolder) return false;
    }

    if (selectedTag && !note.tags.includes(selectedTag)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
    }

    return true;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  // Action Handlers
  const createNewNote = () => {
    const folderToAssign = (activeFolder === 'all' || activeFolder === 'trash') ? 'quick' : activeFolder;
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      folder: folderToAssign,
      tags: [],
      pinned: false,
      locked: false,
      images: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateActiveNoteContent = (content: string) => {
    if (!activeNote) return;
    const lines = content.split('\n');
    const rawTitle = lines[0]?.replace(/^#+\s*/, '').trim() || 'Untitled Note';
    const tags = extractTags(content);

    setNotes(notes.map(n => n.id === activeNote.id ? {
      ...n,
      title: rawTitle,
      content,
      tags,
      updatedAt: Date.now()
    } : n));
  };

  const togglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.map(n => {
      if (n.id === id) {
        return n.folder === 'trash' ? null : { ...n, folder: 'trash' };
      }
      return n;
    }).filter(Boolean) as Note[]);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folderId = newFolderName.toLowerCase().replace(/\s+/g, '-');
    if (!customFolders.find(f => f.id === folderId)) {
      setCustomFolders([...customFolders, { id: folderId, name: newFolderName.trim() }]);
    }
    setNewFolderName('');
    setShowNewFolderModal(false);
    setActiveFolder(folderId);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeNote) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNotes(notes.map(n => n.id === activeNote.id ? {
          ...n,
          images: [...n.images, dataUrl],
          updatedAt: Date.now()
        } : n));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleChecklistLine = (lineIndex: number) => {
    if (!activeNote) return;
    const lines = activeNote.content.split('\n');
    const targetLine = lines[lineIndex];

    if (targetLine.includes('- [ ]')) {
      lines[lineIndex] = targetLine.replace('- [ ]', '- [x]');
    } else if (targetLine.includes('- [x]')) {
      lines[lineIndex] = targetLine.replace('- [x]', '- [ ]');
    }

    updateActiveNoteContent(lines.join('\n'));
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!activeNote) return;
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      updateActiveNoteContent(activeNote.content + `\n${prefix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content;
    const selection = text.substring(start, end) || 'Text';

    const updated = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
    updateActiveNoteContent(updated);
    setShowFormatMenu(false);
  };

  const exportAsFile = (type: 'md' | 'txt') => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_')}.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  // Word count stats
  const wordCount = activeNote ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = activeNote ? activeNote.content.length : 0;

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#181818] text-gray-100' : 'bg-white text-gray-900'
    }`}>

      {/* 1. SIDEBAR (Folders, Tags & Settings) */}
      <aside className={`w-64 border-r flex flex-col mac-sidebar transition-colors duration-200 ${
        darkMode ? 'bg-[#212124]/90 border-[#333]' : 'bg-[#f4f4f6]/90 border-[#e3e3e6]'
      }`}>
        {/* macOS Window Controls */}
        <div className="h-11 flex items-center justify-between px-4 border-b border-inherit mac-titlebar">
          <div className="flex items-center gap-2 mac-no-drag">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-80 cursor-pointer shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:opacity-80 cursor-pointer shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:opacity-80 cursor-pointer shadow-sm"></div>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Apple Notes</span>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {/* Scrollable folder tree */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {/* Main folders */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">iCloud Folders</div>
            <div className="space-y-0.5">
              <button
                onClick={() => { setActiveFolder('all'); setSelectedTag(null); }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFolder === 'all'
                    ? accentColor.activeBg + ' shadow-xs font-semibold'
                    : (darkMode ? 'text-gray-300 hover:bg-[#2c2c30]' : 'text-gray-700 hover:bg-gray-200/60')
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder size={15} className={activeFolder === 'all' ? accentColor.text : 'text-gray-400'} />
                  <span>All Notes</span>
                </div>
                <span className="text-[11px] text-gray-400">{notes.filter(n => n.folder !== 'trash').length}</span>
              </button>

              {customFolders.map(folder => {
                const isActive = activeFolder === folder.id;
                const count = notes.filter(n => n.folder === folder.id && n.folder !== 'trash').length;

                return (
                  <button
                    key={folder.id}
                    onClick={() => { setActiveFolder(folder.id); setSelectedTag(null); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? accentColor.activeBg + ' shadow-xs font-semibold'
                        : (darkMode ? 'text-gray-300 hover:bg-[#2c2c30]' : 'text-gray-700 hover:bg-gray-200/60')
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder size={15} className={isActive ? accentColor.text : 'text-gray-400'} />
                      <span className="truncate max-w-[130px]">{folder.name}</span>
                    </div>
                    {count > 0 && <span className="text-[11px] text-gray-400">{count}</span>}
                  </button>
                );
              })}

              <button
                onClick={() => { setActiveFolder('trash'); setSelectedTag(null); }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFolder === 'trash'
                    ? 'bg-red-100 text-red-900 shadow-xs font-semibold'
                    : (darkMode ? 'text-gray-300 hover:bg-[#2c2c30]' : 'text-gray-700 hover:bg-gray-200/60')
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 size={15} className={activeFolder === 'trash' ? 'text-red-600' : 'text-gray-400'} />
                  <span>Recently Deleted</span>
                </div>
                <span className="text-[11px] text-gray-400">{notes.filter(n => n.folder === 'trash').length}</span>
              </button>
            </div>
          </div>

          {/* Hashtags list */}
          {allTags.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">Tags</div>
              <div className="flex flex-wrap gap-1 px-1">
                {allTags.map(tag => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isActive ? null : tag)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        isActive
                          ? `${accentColor.bg} text-white shadow-xs`
                          : (darkMode ? 'bg-[#2c2c30] text-gray-300 hover:bg-[#37373c]' : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300/70')
                      }`}
                    >
                      <Tag size={10} />
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accent Color theme options */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">Accent Color</div>
            <div className="flex items-center gap-2 px-2">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c)}
                  className={`w-5 h-5 rounded-full ${c.bg} transition transform hover:scale-110 ${
                    accentColor.id === c.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-inherit flex items-center justify-between">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/80 dark:hover:bg-[#333] transition`}
            title="Toggle Dark/Light Theme"
          >
            {darkMode ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} />}
          </button>
          <span className="text-[11px] font-medium text-gray-400">{notes.length} Notes</span>
          <button
            onClick={createNewNote}
            className={`p-1.5 rounded-lg ${accentColor.bg} ${accentColor.text} shadow-xs hover:opacity-90 transition transform active:scale-95`}
            title="Create New Note"
          >
            <Plus size={17} />
          </button>
        </div>
      </aside>

      {/* 2. NOTE LIST COLUMN */}
      <section className={`w-80 border-r flex flex-col ${
        darkMode ? 'bg-[#1c1c1e] border-[#333]' : 'bg-[#fafafa] border-[#e3e3e6]'
      }`}>
        {/* Search Input Bar */}
        <div className="p-3 border-b border-inherit">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search all notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition ${
                darkMode
                  ? 'bg-[#2c2c2e] text-white placeholder-gray-500 focus:ring-1 focus:ring-yellow-500'
                  : 'bg-gray-200/60 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-yellow-500'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Notes Cards Stream */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs gap-2">
              <FileText size={28} className="opacity-40" />
              <span>No notes found</span>
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                    <Pin size={10} className="text-yellow-500" /> Pinned
                  </div>
                  {pinnedNotes.map(n => renderNoteCard(n))}
                </div>
              )}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Notes</div>
                  )}
                  {unpinnedNotes.map(n => renderNoteCard(n))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 3. MAIN EDITOR CANVAS */}
      <main className={`flex-1 flex flex-col ${darkMode ? 'bg-[#181818]' : 'bg-white'}`}>
        {activeNote ? (
          <>
            {/* Action Bar Header */}
            <header className={`h-11 border-b px-6 flex items-center justify-between ${
              darkMode ? 'border-[#333]' : 'border-gray-200'
            }`}>
              <div className="text-xs text-gray-400 font-medium">
                {new Date(activeNote.updatedAt).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>

              {/* Formatting & Controls Toolbar */}
              <div className="flex items-center gap-2 relative">
                {/* Format Aa Popover toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowFormatMenu(!showFormatMenu)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d30] text-gray-600 dark:text-gray-300 font-serif font-bold text-sm px-2 transition"
                    title="Formatting (Aa)"
                  >
                    Aa
                  </button>

                  {showFormatMenu && (
                    <div className={`absolute right-0 top-9 w-48 rounded-xl shadow-xl border p-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                      darkMode ? 'bg-[#252528] border-[#444] text-gray-200' : 'bg-white border-gray-200 text-gray-800'
                    }`}>
                      <button onClick={() => insertFormatting('# ')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-500 hover:text-white rounded-md font-bold flex items-center gap-2">
                        <Heading1 size={14} /> Heading 1
                      </button>
                      <button onClick={() => insertFormatting('## ')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-500 hover:text-white rounded-md font-semibold flex items-center gap-2">
                        <Heading2 size={14} /> Heading 2
                      </button>
                      <button onClick={() => insertFormatting('- [ ] ')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-500 hover:text-white rounded-md flex items-center gap-2">
                        <CheckSquare size={14} /> Checklist
                      </button>
                      <button onClick={() => insertFormatting('- ')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-500 hover:text-white rounded-md flex items-center gap-2">
                        <List size={14} /> Bullet List
                      </button>
                      <button onClick={() => insertFormatting('**', '**')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-500 hover:text-white rounded-md font-bold flex items-center gap-2">
                        <Bold size={14} /> Bold
                      </button>
                      <button onClick={() => insertFormatting('*', '*')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-500 hover:text-white rounded-md italic flex items-center gap-2">
                        <Italic size={14} /> Italic
                      </button>
                    </div>
                  )}
                </div>

                {/* Checklist quick insert */}
                <button
                  onClick={() => insertFormatting('- [ ] ')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d30] text-gray-500 transition"
                  title="Insert Checklist"
                >
                  <CheckSquare size={16} />
                </button>

                {/* Attach Image */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d30] text-gray-500 transition"
                  title="Attach Image"
                >
                  <ImageIcon size={16} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                {/* Preview / Interactive checklist view toggle */}
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`p-1.5 rounded-lg transition ${previewMode ? 'bg-yellow-100 text-yellow-900 font-medium' : 'hover:bg-gray-100 dark:hover:bg-[#2d2d30] text-gray-500'}`}
                  title={previewMode ? "Switch to Raw Editor" : "Switch to Interactive Checklist View"}
                >
                  {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                </button>

                {/* Pin Note toggle */}
                <button
                  onClick={(e) => togglePin(activeNote.id, e)}
                  className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d30] transition ${
                    activeNote.pinned ? 'text-yellow-500 font-bold' : 'text-gray-400'
                  }`}
                  title={activeNote.pinned ? "Unpin Note" : "Pin Note"}
                >
                  <Pin size={16} />
                </button>

                {/* Copy / Export */}
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d30] text-gray-500 transition"
                  title="Copy Text"
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={() => exportAsFile('md')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d30] text-gray-500 transition"
                  title="Export Markdown"
                >
                  <FileDown size={16} />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 transition"
                  title="Delete Note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>

            {/* Notification Toast */}
            {copiedNotification && (
              <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full absolute bottom-12 right-6 shadow-lg animate-bounce z-50">
                Copied to clipboard!
              </div>
            )}

            {/* Editor Canvas Area */}
            <div className="flex-1 overflow-y-auto px-12 py-8 max-w-3xl mx-auto w-full">
              {previewMode ? (
                /* Interactive Checklist & Markdown Preview */
                <div className="space-y-3">
                  {activeNote.content.split('\n').map((line, idx) => {
                    const isChecklist = line.includes('- [ ]') || line.includes('- [x]');
                    const isChecked = line.includes('- [x]');

                    if (isChecklist) {
                      const text = line.replace(/- \[(x| )\]/, '').trim();
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklistLine(idx)}
                          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262628] cursor-pointer group transition"
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-yellow-500 border-yellow-500 text-white'
                              : 'border-gray-400 group-hover:border-yellow-500'
                          }`}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className={`text-base ${isChecked ? 'line-through text-gray-400' : (darkMode ? 'text-gray-100' : 'text-gray-800')}`}>
                            {text}
                          </span>
                        </div>
                      );
                    }

                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-3xl font-bold tracking-tight mb-4 mt-2">{line.replace('# ', '')}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-xl font-semibold tracking-tight mb-2 mt-4">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-lg font-medium mb-1 mt-3">{line.replace('### ', '')}</h3>;
                    }

                    return (
                      <p key={idx} className={`text-base leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                /* Plain Textarea Editor */
                <textarea
                  id="note-textarea"
                  value={activeNote.content}
                  onChange={(e) => updateActiveNoteContent(e.target.value)}
                  placeholder="Start typing your note..."
                  className={`w-full h-full resize-none outline-none bg-transparent font-normal text-base leading-relaxed ${
                    darkMode ? 'text-gray-100 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'
                  }`}
                  style={{ minHeight: 'calc(100vh - 180px)' }}
                />
              )}

              {/* Render Attached Images */}
              {activeNote.images.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-4 border-gray-200 dark:border-gray-800">
                  {activeNote.images.map((img, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                      <img src={img} alt="Attachment" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => {
                          setNotes(notes.map(n => n.id === activeNote.id ? {
                            ...n,
                            images: n.images.filter((_, index) => index !== i)
                          } : n));
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className={`h-8 border-t px-6 flex items-center justify-between text-[11px] text-gray-400 ${
              darkMode ? 'border-[#2c2c2e]' : 'border-gray-100'
            }`}>
              <div>
                {wordCount} words • {charCount} characters
              </div>
              <div className="flex items-center gap-1">
                <Sparkles size={11} className="text-yellow-500" />
                <span>Saved locally</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-3">
            <FileText size={48} className="opacity-20" />
            <span>Select a note from the left, or create a new note to start writing.</span>
            <button
              onClick={createNewNote}
              className={`mt-2 px-4 py-2 rounded-lg text-xs font-semibold ${accentColor.bg} ${accentColor.text} shadow-xs hover:opacity-90 transition`}
            >
              Create New Note
            </button>
          </div>
        )}
      </main>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-150">
          <div className={`w-80 p-5 rounded-2xl shadow-2xl border ${
            darkMode ? 'bg-[#252528] border-[#444] text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <h3 className="text-sm font-bold mb-3">New Folder</h3>
            <input
              type="text"
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
              className={`w-full px-3 py-2 rounded-lg text-xs outline-none mb-4 ${
                darkMode ? 'bg-[#333] text-white border border-[#555]' : 'bg-gray-100 text-gray-900 border border-gray-300'
              }`}
            />
            <div className="flex justify-end gap-2 text-xs font-medium">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#333]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className={`px-3 py-1.5 rounded-lg ${accentColor.bg} ${accentColor.text} font-semibold`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render individual Note card in note list stream
  function renderNoteCard(note: Note) {
    const isActive = note.id === activeNoteId;
    const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const snippet = note.content.replace(/^#+\s*.*/g, '').replace(/- \[(x| )\]/g, '').trim().substring(0, 60) || 'No additional text';

    return (
      <div
        key={note.id}
        onClick={() => setActiveNoteId(note.id)}
        className={`p-3 rounded-xl cursor-pointer transition-all duration-150 relative group ${
          isActive
            ? `${accentColor.cardActive} shadow-sm`
            : (darkMode ? 'hover:bg-[#2c2c2e] text-gray-200' : 'hover:bg-gray-200/60 text-gray-800')
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`font-semibold text-xs truncate max-w-[200px] ${
            isActive ? 'text-white' : (darkMode ? 'text-gray-100' : 'text-gray-900')
          }`}>
            {note.title}
          </span>
          {note.pinned && (
            <Pin size={11} className={isActive ? 'text-white' : 'text-yellow-500'} />
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <span className="font-medium whitespace-nowrap">{dateStr}</span>
          <span className="truncate">{snippet}</span>
        </div>
        {note.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {note.tags.map(t => (
              <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/20 text-white' : (darkMode ? 'bg-[#37373a] text-gray-400' : 'bg-gray-200 text-gray-600')
              }`}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
}
