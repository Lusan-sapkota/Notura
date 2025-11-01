# Notura

<div align="center">
  <img src="src-tauri/icons/icon.png" alt="Notura Logo" width="128" height="128">
  
  **Because your notes deserve better than a plain text editor**
  
  [![Development Status](https://img.shields.io/badge/Status-Active%20Development-green.svg)](https://github.com/Lusan-sapkota/Notura)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Tauri](https://img.shields.io/badge/Tauri-2.0-orange.svg)](https://tauri.app/)
  [![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
  
  **Active Development** - Almost there, I promise!
</div>

## What Makes Notura Special

### The Editor That Actually Gets You

Look, I've tried every note-taking app out there. They're either too simple (looking at you, Notepad) or so complex you need a PhD to figure out where the "New Note" button is. Notura hits that sweet spot where everything just works.

**Live Preview Magic**: Type markdown on the left, see beautiful formatted text on the right. It's like having a crystal ball, but for your notes. The preview auto-scrolls to follow your cursor because it's 2024 and technology should work for you.

**Tab System That Actually Works**: Multiple notes open at once with keyboard shortcuts (Ctrl+Tab, Ctrl+1-9). Switch between notes faster than you switch between browser tabs (which is saying something).

**Auto-Save With Brains**: 2-second debounced saves with visual indicators. Your work is safer than your passwords (hopefully you're using a password manager).

**Zen Mode**: Hide everything except your words. Perfect for when you need to channel your inner minimalist writer or just can't handle any more UI elements.

**Text Selection Superpowers**: Select text and watch a formatting toolbar appear like magic. Bold, italic, code, lang, strikethrough - all without memorizing markdown syntax.

**Version History**: Track every change with restore capabilities. It's like Git for your thoughts, but without the existential crisis of merge conflicts.

**Code Highlighting**: Syntax highlighting for 100+ programming languages because your code snippets deserve to look professional even in your grocery list notes.

### Organization That Makes Sense

**Folders and Subfolders**: Create as many nested folders as your organizational heart desires. Go wild. Make a folder inside a folder inside a folder inside a folder. The app won't judge your folder inception habits.

**Drag & Drop Everything**: Move notes between folders with intuitive drag-and-drop. It's like rearranging furniture but without the back pain and relationship arguments.

**Enhanced Sidebar**: Collapsible sections, note counts, visual indicators for folder depth. It's organized chaos, but the good kind.

**Quick Access**: "All Notes" view for when you can't remember where you put that brilliant idea from last Tuesday (we've all been there).

**Search That Actually Finds Things**: Powered by SQLite FTS5, which is a fancy way of saying "finds your stuff really, really fast" with result highlighting that makes your search terms light up like a Christmas tree.

### Search That Actually Works

**Dual Search Mode**: Toggle between searching notes (content and titles) or folders with a single button. Because sometimes you know it's in a folder, you just can't remember which one.

**Real-time Filtering**: Type and watch results filter instantly. No loading spinners, no "please wait" messages, just immediate results.

**Tag-based Filtering**: Filter notes by tags with a dropdown selector. Perfect for when you remember you tagged something #important but can't remember what.

**Smart Search Bar**: Clean, intuitive search interface that remembers what mode you prefer and shows active filters as removable chips.

### The Details That Matter

**Real-time Stats**: Word count, character count, reading time, line count, paragraph count. For when you need to know if your "quick note" turned into the next Great American Novel.

**Timestamps That Make Sense**: "2 hours ago", "Oct 28, 2025" - readable dates that don't require a computer science degree to understand.

**Tag System That Works**: Add and remove tags with a clean interface. Color-coded tags that you can actually manage without wanting to throw your computer out the window. #productivity #random-thoughts #grocery-lists #existential-crisis

**Comprehensive Metadata Panel**: Everything you need to know about your note in one place - creation date, modification time, word count, character count, reading time, folder location, tags, images, and version history. It's like having a personal assistant for your notes.

**Version History With Time Travel**: Track every change with restore capabilities. See how your brilliant idea evolved (or watch it slowly devolve into madness).

**Image Management That Doesn't Suck**: Upload images, browse your gallery, auto-convert base64 images to managed assets. Your visual content is organized better than your actual photos.

### Themes That Don't Hurt Your Eyes

**Cyber Amber**: Dark theme with amber highlights and neon accents. Perfect for late-night writing sessions when you should probably be sleeping but your brain won't shut up.

**Zen Paper**: Clean, light theme for when you want to pretend you're writing on actual paper but with better search functionality and zero paper cuts.

**Smooth Transitions**: Theme switching so smooth you'll toggle it just to watch the animation. 150-250ms of pure visual satisfaction.

**Responsive Everything**: Looks gorgeous on your phone, tablet, laptop, that ultrawide monitor you bought during the pandemic, or whatever screen you're using.

### Data You Can Trust

**Local Storage**: Everything lives on your computer in a SQLite database. No cloud, no subscriptions, no "oops we accidentally deleted your life's work" emails.

**Export Everything**: Markdown files with proper formatting. Your notes, your rules, your file system.

**Import Support**: Bring your existing Markdown notes from wherever they're currently trapped (looking at you, other note apps).

**Storage Insights**: Real-time database size tracking so you know exactly how much space your brilliant thoughts are consuming.

**Image Asset Management**: Automatic image optimization, gallery browsing, and cleanup. Your images are organized better than your actual photo library.

## Tech Stack (For the Curious)

### Frontend

- **React 19.1** - Because it's 2024 and we're not savages
- **TypeScript 5.8** - Type safety is not optional
- **Tailwind CSS** - Utility-first styling that doesn't make you cry
- **React Markdown** - Turns your markdown into something beautiful
- **Highlight.js** - Makes your code blocks look professional

### Backend

- **Tauri 2.0** - Desktop apps that don't eat your RAM for breakfast
- **Rust** - Fast, safe, and makes me feel smart
- **SQLite** - The database that just works
- **SQLx** - Async SQL that doesn't make you want to quit programming

### Development Tools

- **Vite** - Build tool that's actually fast (sub-second hot reloads)
- **Vitest** - Testing framework that doesn't make you want to quit programming
- **React Testing Library** - Component testing that focuses on user behavior
- **ESLint & Prettier** - Code quality enforcers (the good kind of strict parents)

## Development Status

### What's Done (The Actually Impressive Stuff)

**Editor That Doesn't Suck:**
- Advanced markdown editor with live preview and auto-scroll sync
- Comprehensive tab system with keyboard shortcuts (Ctrl+Tab, Ctrl+1-9, because who has time to click?)
- Auto-save with 2-second debounce (your work is safer than your browser history)
- Zen mode for when you need to pretend the outside world doesn't exist
- Text selection toolbar that appears like magic when you select text
- Version history with restore capabilities (time travel for your thoughts)
- Line numbers because sometimes you need to know you're on line 247 of your grocery list

**Organization That Actually Makes Sense:**
- Hierarchical folder system with drag-and-drop (move stuff around like you're Marie Kondo)
- Enhanced sidebar that collapses when you need more screen real estate
- Full-text search powered by SQLite FTS5 (finds your stuff faster than you can remember where you put it)
- Tag management system with add/remove functionality (because #productivity #life #chaos)
- Search toggle between notes and folders with real-time filtering
- Smart folder navigation with visual depth indicators

**UI/UX That Doesn't Make You Cry:**
- Two gorgeous themes: Cyber Amber (dark mode for night owls) and Zen Paper (light mode for morning people)
- Fully responsive design (works on your phone, tablet, that ancient laptop you refuse to replace)
- Comprehensive keyboard navigation (mouse is optional, carpal tunnel is not)
- Resizable panels with persistent layouts (set it once, forget about it forever)
- Real-time stats (word count, character count, reading time, lines - all the numbers you didn't know you needed)

**Media Management That Actually Works:**
- Advanced image management system with gallery
- Auto-conversion of base64 images to managed assets (because nobody wants bloated files)
- Image insertion via upload, URL, or drag-and-drop
- Image gallery modal for browsing your visual masterpieces
- Markdown table support with visual formatting
- Task lists with interactive checkboxes (finally, a todo list that works)
- Code syntax highlighting for 100+ languages (your code snippets look professional now)

**Data You Can Actually Trust:**
- Local SQLite database with FTS5 search (no cloud, no subscriptions, no "oops we lost everything" emails)
- Export/import functionality for Markdown files
- Storage information and database size tracking
- Comprehensive CRUD operations for notes and folders
- Image asset management with automatic cleanup
- Data persistence that actually persists

**Developer Experience That Doesn't Hate You:**
- Comprehensive test suite (Vitest + React Testing Library + Rust tests)
- TypeScript throughout for type safety (because runtime errors are for other people)
- Modern build tooling (Vite, Tauri 2.0)
- Clean architecture with 25+ reusable UI components
- Custom hooks for everything (useNotes, useTabs, useImageManager, useVersionHistory)

### What's Coming (The Cherry On Top)

**Search Enhancements:**
- Advanced filtering UI with date ranges and tag filters
- Search history and suggestions (because you're probably looking for the same thing again)
- Filter persistence and combination logic
- Related notes suggestions based on content similarity

**Final Polish:**
- Enhanced accessibility features (WCAG 2.1 AA compliance)
- Performance optimizations for large datasets
- Onboarding flow for new users
- Error boundaries and loading states
- Cross-platform testing and optimization

## Getting Started

### What You Need

- Node.js 18+ (because we live in the future)
- Rust 1.70+ (for the backend magic)
- Git (obviously)

### Installation

1. **Clone this beauty**

   ```bash
   git clone https://github.com/Lusan-sapkota/Notura.git
   cd Notura
   ```

2. **Install the dependencies**

   ```bash
   npm install
   ```

3. **Run it in development mode**

   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

### Useful Commands

```bash
# Frontend stuff
npm run dev          # Start Vite dev server
npm run build        # Build frontend
npm run preview      # Preview production build

# Tauri magic
npm run tauri dev    # Run app in development
npm run tauri build  # Build production app

# Testing (yes, there are tests)
npm run test         # Run frontend tests
npm run test:watch   # Run tests in watch mode
cargo test           # Run Rust tests (in src-tauri/)

# Code quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Project Structure

```
Notura/
├── src/                          # Frontend source code
│   ├── components/              # React components (25+ and counting)
│   │   ├── layout/             # Layout components
│   │   │   ├── AppLayout.tsx   # Main app orchestrator
│   │   │   ├── EnhancedSidebar.tsx # Navigation with all the bells and whistles
│   │   │   ├── MainEditor.tsx  # The star of the show (1200+ lines of editor magic)
│   │   │   └── MetadataPanel.tsx # All the nerdy stats you didn't know you needed
│   │   └── ui/                 # Reusable UI components
│   │       ├── TabSystem.tsx   # Multi-tab editing system
│   │       ├── EditorToolbar.tsx # Formatting tools galore
│   │       ├── ImageGalleryModal.tsx # Visual asset management
│   │       ├── TextSelectionToolbar.tsx # Magic formatting popup
│   │       ├── VersionHistoryDropdown.tsx # Time travel for your notes
│   │       └── 20+ other components # Because good UX needs good components
│   ├── contexts/               # React contexts (ThemeProvider and friends)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useNotes.ts        # Note management logic
│   │   ├── useTabs.ts         # Tab system state
│   │   ├── useImageManager.ts # Image asset handling
│   │   ├── useVersionHistory.ts # Change tracking
│   │   └── useLocalStorage.ts # Persistent preferences
│   ├── types/                  # TypeScript definitions (because types matter)
│   └── App.tsx                 # Where the magic begins
├── src-tauri/                   # Tauri backend (Rust powerhouse)
│   ├── src/
│   │   ├── database.rs         # SQLite + FTS5 search magic
│   │   ├── lib.rs              # Tauri commands (the API layer)
│   │   └── test_utils.rs       # Testing utilities (yes, the backend has tests too)
│   ├── Cargo.toml              # Rust dependencies (SQLx, Tokio, the good stuff)
│   └── tauri.conf.json         # Tauri configuration
└── tasks.md                     # Implementation roadmap (mostly checked off)
```

## Testing

Yes, there are actually tests. Comprehensive ones. Both frontend and backend are covered because shipping broken software is for other people.

### Frontend Tests

- Component tests with React Testing Library (testing user behavior, not implementation details)
- Custom hook tests for all the state management logic
- Integration tests for complete user workflows
- Theme switching and responsive behavior tests

### Backend Tests

- Unit tests for individual Tauri commands
- Integration tests for database operations (SQLite + FTS5)
- Performance tests for search functionality
- Error handling and edge case validation

### Test Coverage

- Tab system functionality and keyboard shortcuts
- Auto-save and version history mechanisms
- Image management and asset optimization
- Search and filtering operations
- Theme persistence and UI state management

Run them all:

```bash
# Frontend tests (Vitest + React Testing Library)
npm run test

# Backend tests (Rust + tokio-test)
cd src-tauri && cargo test

# Watch mode for development
npm run test:watch

# Test UI for interactive debugging
npm run test:ui
```

## Contributing

Want to make Notura even better? I'd love the help! Here's how:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome-thing`)
3. Make your changes
4. Add tests (please, for the love of all that is good)
5. Make sure everything passes (`npm run test:all`)
6. Commit your changes (`git commit -m 'Add awesome thing'`)
7. Push to your branch (`git push origin feature/awesome-thing`)
8. Open a Pull Request

## License

MIT License - do whatever you want with it, just don't blame me if something breaks.

## About the Developer

Hi, I'm Lusan Sapkota, and I built this thing because I was tired of note-taking apps that either looked like they were designed in 1995 or required a computer science degree to use.

- **Website**: [lusansapkota.com.np](https://lusansapkota.com.np)
- **Email**: sapkotalusan@gmail.com
- **GitHub**: [@Lusan-sapkota](https://github.com/Lusan-sapkota)

## Support

Something broken? Got a brilliant idea? Here's how to reach me:

- **GitHub Issues**: [Report bugs or request features](https://github.com/Lusan-sapkota/Notura/issues)
- **Email**: sapkotalusan@gmail.com

---

<div align="center">
  <p>Made with caffeine and determination by Lusan Sapkota</p>
  <p>
    <a href="https://github.com/Lusan-sapkota/Notura">Star this repo if it doesn't suck</a>
  </p>
</div>
