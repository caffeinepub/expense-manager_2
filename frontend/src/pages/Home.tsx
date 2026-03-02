import { useNavigate } from '@tanstack/react-router';
import {
  BarChart3,
  Tag,
  FileDown,
  IndianRupee,
  ArrowRight,
  TrendingDown,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Monthly Views',
    description:
      'Navigate month-by-month to review your spending history and spot trends over time.',
  },
  {
    icon: Tag,
    title: 'Category Tagging',
    description:
      'Organise every expense into categories like Food, Travel, Gadgets, Health, and more.',
  },
  {
    icon: FileDown,
    title: 'PDF Reports',
    description:
      "Download a clean, print-ready PDF report of any month's expenses in a single click.",
  },
  {
    icon: IndianRupee,
    title: 'INR Currency Tracking',
    description:
      'All amounts are tracked in Indian Rupees with proper formatting for quick readability.',
  },
  {
    icon: BarChart3,
    title: 'Category Breakdown',
    description:
      'Visual bar charts show exactly where your money goes across all spending categories.',
  },
  {
    icon: TrendingDown,
    title: 'Spending Insights',
    description:
      'See your total spend, highest single expense, and lowest expense at a glance each month.',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Subtle radial glow behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.72 0.18 75 / 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative mb-6">
          <img
            src="/assets/generated/expensetrack-logo.dim_128x128.png"
            alt="ExpenseTrack Logo"
            className="w-24 h-24 rounded-2xl shadow-card-lg mx-auto"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* App Name */}
        <h1 className="font-display font-bold text-5xl sm:text-6xl text-foreground tracking-tight mb-4">
          Expense<span className="text-gold">Track</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-3 leading-relaxed">
          Your personal finance companion — track every rupee, understand your
          spending, and take control of your budget.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10">
          Simple. Fast. Built for India.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => navigate({ to: '/dashboard' })}
          className="bg-gold hover:bg-gold-hover text-charcoal font-bold px-8 py-3 text-base rounded-xl shadow-gold-glow transition-all duration-200 hover:scale-105 group"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Trust badge */}
        <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground/60">
          <ShieldCheck className="w-4 h-4 text-gold/60" />
          <span>Stored securely on the Internet Computer blockchain</span>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-4xl px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-foreground mb-3">
            Everything you need to manage expenses
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A focused set of tools designed to make personal expense tracking
            effortless and insightful.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-charcoal border border-sidebar-border rounded-2xl p-6 hover:border-gold/40 hover:shadow-card-lg transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <Icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-base mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-20 text-center">
        <div className="max-w-xl mx-auto bg-charcoal border border-gold/20 rounded-2xl p-10 shadow-card-lg">
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Ready to track your expenses?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Head to the dashboard to add your first expense and start gaining
            clarity on your spending.
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: '/dashboard' })}
            className="bg-gold hover:bg-gold-hover text-charcoal font-bold px-8 rounded-xl shadow-gold-glow transition-all duration-200 hover:scale-105 group"
          >
            Open Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
}
