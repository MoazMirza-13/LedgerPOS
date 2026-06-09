# LedgerPOS

A modern, full-featured Point of Sale (POS) system built with cutting-edge web technologies. LedgerPOS is designed to streamline sales management, inventory tracking, and business operations with an intuitive and responsive interface.

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

### Backend & Database
- **Supabase** - Open-source Firebase alternative with PostgreSQL
- **Supabase-js SDK** - JavaScript client for Supabase

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

📊 **Inventory Management**
- Track products and stock levels
- Manage your prodects by adding them in brands and categories

💳 **Sales & Transactions**
- Quick checkout process
- Receipt generation and printing (PDF export)
- Transaction history and detailed receipts

📈 **Analytics & Reporting**
- Sales reports and insights
- Revenue tracking and performance metrics

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

📱 **Mobile Responsive**
- Works seamlessly on all devices
- Touch-friendly interface
- Optimized performance for mobile networks

---

## Project Screenshots
**Inventory Managament**

<img width="1800" height="999" alt="Screenshot 2026-05-08 at 11 25 34 PM" src="https://github.com/user-attachments/assets/2cafb982-b7b3-4948-8e92-e539701a08fa" />
<br><br>

**Create Invoice** 

<img width="1800" height="999" alt="Screenshot 2026-05-08 at 11 25 42 PM" src="https://github.com/user-attachments/assets/b98abbf2-c448-48de-a394-3f7f006c4a8d" />
<br><br>

**Ledger Management**

<img width="1800" height="999" alt="Screenshot 2026-05-08 at 11 25 53 PM" src="https://github.com/user-attachments/assets/76bb25b5-9c38-4bba-961b-97de79087b31" />


---

## Demo Credentials

Use the following account to test the application:

**Email:** `moazmirza13@gmail.com`

**Password:** `asdasd`

> ⚠️ Note:
> * This is a shared test account.
> * Data may change or be deleted at any time.

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

## Support & Feedback

For issues, feature requests, or questions, please open an issue on GitHub.
