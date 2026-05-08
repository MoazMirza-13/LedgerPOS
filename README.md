# LedgerPOS

A modern, full-featured Point of Sale (POS) system built with cutting-edge web technologies. LedgerPOS is designed to streamline sales management, inventory tracking, and business operations with an intuitive and responsive interface.

🌐 **Live Demo**: [https://ledgerpos.vercel.app](https://ledgerpos.vercel.app)

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router, Turbopack, and server components
- **React 19** - Latest React with enhanced features
- **TypeScript** - Type-safe development for robust code
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful, consistent icon library

### UI & Interactions
- **Motion** - Smooth animations and transitions
- **Sonner** - Toast notifications system
- **React Hook Form** - Efficient form state management
- **React Day Picker** - Accessible date picker component
- **React Dropzone** - File upload handling
- **HTML2Canvas & jsPDF** - Document generation and export

### Data Management & State
- **Zustand** - Lightweight state management
- **TanStack React Query** - Powerful server state management
- **TanStack React Table** - Headless table library for data displays
- **Zod** - TypeScript-first schema validation

### Backend & Database
- **Supabase** - Open-source Firebase alternative with PostgreSQL
- **Supabase-js SDK** - JavaScript client for Supabase

### AI Integration
- **OpenAI API** - Intelligent features powered by AI

### Utilities & Tools
- **date-fns & date-fns-tz** - Date manipulation and timezone handling
- **Nuqs** - Next.js URL query state management
- **kbar** - Command palette interface
- **match-sorter** - Filtering and sorting library
- **UUID** - Unique identifier generation
- **next-themes** - Dark mode and theme management

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Husky & lint-staged** - Git hooks for code quality
- **Turbopack** - Next-gen bundler with faster builds

---

## Key Features

✨ **Modern POS Dashboard**
- Real-time sales tracking and analytics
- Comprehensive dashboard with key business metrics
- Interactive charts and visualizations with Recharts

📊 **Inventory Management**
- Track products and stock levels
- Drag-and-drop interface for organizing items
- Bulk operations and import/export capabilities

💳 **Sales & Transactions**
- Quick checkout process
- Multiple payment method support
- Receipt generation and printing (PDF export)
- Transaction history and detailed receipts

📈 **Analytics & Reporting**
- Sales reports and insights
- Revenue tracking and performance metrics
- Data visualization and trend analysis
- Export reports to PDF

🔐 **User Authentication**
- Secure authentication with Supabase
- User roles and permissions
- Session management with cookies

🎨 **Modern UI/UX**
- Fully responsive design for desktop, tablet, and mobile
- Dark mode support with theme switching
- Accessible UI components (WCAG compliant)
- Smooth animations and transitions
- Command palette for power users (Kbar)

🤖 **AI-Powered Features**
- Intelligent insights and recommendations
- OpenAI integration for smart analytics

🔄 **Drag & Drop Interface**
- Intuitive drag-and-drop functionality using dnd-kit
- Sortable lists and customizable layouts

📱 **Mobile Responsive**
- Works seamlessly on all devices
- Touch-friendly interface
- Optimized performance for mobile networks

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MoazMirza-13/LedgerPOS.git
   cd LedgerPOS
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm lint:strict      # Strict linting (no warnings)
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

---

## Project Structure

```
LedgerPOS/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── styles/           # Global styles and CSS
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── next.config.js        # Next.js configuration
```

---

## Code Quality

This project follows strict code quality standards:

- **ESLint** enforces code style and best practices
- **Prettier** ensures consistent code formatting
- **Husky** runs pre-commit hooks via lint-staged
- **TypeScript** provides type safety

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Performance

- ⚡ **Turbopack** for ultra-fast builds
- 🔄 **Server-Side Rendering (SSR)** for optimal performance
- 📦 **Code splitting** with Next.js
- 🎯 **Image optimization** with Sharp
- 🚀 **Deployed on Vercel** for global CDN

---

## License

This project is private. All rights reserved.

---

## Author

**Moaz Mirza** - [@MoazMirza-13](https://github.com/MoazMirza-13)

---

## Support & Feedback

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Built with ❤️ using modern web technologies**
