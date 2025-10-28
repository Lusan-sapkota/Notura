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

**Live Preview Magic**: Type markdown on the left, see beautiful formatted text on the right. It's like having a crystal ball, but for your notes.

**Auto-Scroll Sync**: The preview follows your cursor like a loyal puppy. No more scrolling around trying to find where you were.

**Auto-Save**: Because nobody has time for Ctrl+S every 30 seconds. Your work saves itself while you focus on actually writing.

**Seamless Editing**: No borders, no distractions, no "look at me I'm a text editor" nonsense. Just you and your thoughts.

**Code Highlighting**: Syntax highlighting for 100+ programming languages because sometimes your notes need to look as good as your code.

### Organization That Makes Sense

**Folders and Subfolders**: Create as many nested folders as your heart desires. Go wild. Make a folder inside a folder inside a folder. I won't judge.

**Collections**: Think of them as smart playlists for your notes. Group related stuff together without the rigid folder structure.

**Drag & Drop**: Move notes around like you're rearranging furniture. It's oddly satisfying.

**Smart Sorting**: Everything stays organized automatically because I know you're not going to do it manually.

**Quick Access**: "All Notes" view for when you can't remember where you put that brilliant idea from last Tuesday.

### Search That Actually Works

**Full-Text Search**: Powered by SQLite FTS5, which is a fancy way of saying "finds your stuff really, really fast."

**Search Highlighting**: Your search terms light up like a Christmas tree in the results.

**Filter by Collections**: Search within specific collections because sometimes you know roughly where you put that thing.

**Recent Searches**: Quick access to your recent searches because let's be honest, you're probably looking for the same stuff again.

### The Details That Matter

**Real-time Stats**: Word count, character count, reading time. For when you need to know if your "quick note" turned into a novel.

**Timestamps**: When you created it, when you last touched it. Digital archaeology at its finest.

**Tag System**: Label your notes with whatever makes sense to you. #productivity #random-thoughts #grocery-lists

**Related Notes**: The app suggests other notes you might want to read. It's like having a personal librarian who actually knows where everything is.

**Version History**: Track changes over time because sometimes you want to see how your brilliant idea evolved (or devolved).

### Themes That Don't Hurt Your Eyes

**Cyber Amber**: Dark theme with amber highlights. Perfect for late-night writing sessions when you should probably be sleeping.

**Zen Paper**: Clean, light theme for when you want to pretend you're writing on actual paper but with better search functionality.

**Smooth Transitions**: Theme switching so smooth you'll want to do it just for fun.

### Data You Can Trust

**Local Storage**: Everything lives on your computer. No cloud, no subscriptions, no "oops we lost your data" emails.

**Export Everything**: Markdown, JSON, whatever format makes you happy. Your notes, your rules.

**Import Support**: Bring your existing notes from wherever they're currently trapped.

**Storage Insights**: See how much space your brilliant thoughts are taking up.

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

- **Vite** - Build tool that's actually fast
- **Vitest** - Testing that doesn't make you hate testing
- **ESLint & Prettier** - Code quality enforcers

## Development Status

### What's Done (The Good Stuff)

- Core markdown editor with live preview
- Auto-scrolling preview that follows your cursor
- Auto-save functionality (because I care about your work)
- Hierarchical folders and collections system
- Full-text search with SQLite FTS5
- Complete CRUD operations for notes and collections
- Export/Import functionality
- Responsive design that works on any screen size
- Theme switching between Cyber Amber and Zen Paper
- Metadata panel with all the stats you didn't know you needed
- Local storage with SQLite (your data stays yours)
- Comprehensive test suite (yes, I actually write tests)

### What's Coming (The Even Better Stuff)

- Advanced tag management system
- More search filters
- Note linking and backlinks
- Performance optimizations (making fast things faster)
- More export formats
- Plugin system (maybe, if I'm feeling ambitious)

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
│   ├── components/              # React components
│   │   ├── layout/             # Layout components
│   │   │   ├── AppLayout.tsx   # Main app layout
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── MainEditor.tsx  # The star of the show
│   │   │   └── MetadataPanel.tsx # All the nerdy details
│   │   └── ui/                 # Reusable UI components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   └── App.tsx                 # Where it all begins
├── src-tauri/                   # Tauri backend
│   ├── src/
│   │   ├── database.rs         # Database magic
│   │   ├── lib.rs              # Main Tauri commands
│   │   └── test_utils.rs       # Testing utilities
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
└── docs/                        # Documentation (when I get around to it)
```

## Testing

Yes, there are actually tests. Both frontend and backend are covered because I believe in doing things right.

### Frontend Tests

- Component tests with React Testing Library
- Hook tests for custom functionality
- Integration tests for user workflows

### Backend Tests

- Unit tests for individual functions
- Integration tests for database operations
- Performance tests for search functionality

Run them all:

```bash
# Frontend tests
npm run test

# Backend tests
cd src-tauri && cargo test

# Everything at once
npm run test:all
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
