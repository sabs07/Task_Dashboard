

## Getting Started

First, run the development server:

```bash
npm run dev

```


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Flow Of Project

/task-dashboard
│
├── app/                        # Next.js App Router pages and API routes
│   ├── layout.tsx              # Root layout (theme, context providers, global structure)
│   ├── globals.css             # Global CSS (resets, base styles, variables)
│   ├── Dashboard.module.css    # Dashboard-specific styles
│   ├── page.module.css         # Additional dashboard styles
│   ├── page.tsx                # Dashboard page (main summary, charts, quick add)
│   │
│   ├── tasks/                  # Tasks page and routes
│   │   └── page.tsx            # Full task management interface (list, filter, search, analytics)
│   │
│   ├── profile/                # Profile page
│   │   └── page.tsx            # User settings, preferences, statistics, theme toggle
│   │
│   ├── api/                    # Next.js API routes (mock backend)
│   │   ├── tasks/
│   │   │   └── route.ts        # CRUD operations for tasks (GET, POST, PUT, DELETE)
│   │   └── user/
│   │       └── route.ts        # User data operations (GET, PUT)
│   │
│   └── favicon.ico             # App icon
│
├── public/                     # Static assets (images, icons, etc.)
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Card.tsx            # Stat/info card component
│   │   ├── Card.module.css     # Styles for Card
│   │   ├── TaskItem.tsx        # Task list item with priority/status
│   │   ├── TaskItem.module.css # Styles for TaskItem
│   │   ├── Button.tsx          # Custom button (primary, secondary, danger)
│   │   ├── Button.module.css   # Styles for Button
│   │   ├── Modal.tsx           # Modal/dialog for editing/adding tasks
│   │   ├── Modal.module.css    # Styles for Modal
│   │   ├── PieChart.tsx        # Pie chart for priority distribution
│   │   ├── BarChart.tsx        # Bar chart for daily/weekly completion
│   │   ├── LineChart.tsx       # Line chart for progress trends
│   │   └── ...                 # (Add Spinner, Toast, ThemeToggle if present)
│   │
│   ├── context/                # React Contexts for global state
│   │   ├── TaskContext.tsx     # Task state, actions, and provider
│   │   └── UserContext.tsx     # User preferences, theme, and provider
│   │
│   ├── types/                  # TypeScript interfaces and types
│   │   └── models.ts           # Task, User, ChartData, TaskStats interfaces
│   │
│   ├── utils/                  # Utility/helper functions
│   │   └── taskStats.ts        # Functions for calculating task statistics
│   │
│   └── ...                     # (Add hooks/ if you have custom hooks)
│
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Dependency lock file
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── next-env.d.ts               # Next.js TypeScript environment
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules


