import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddExpense } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Tag,
  FileText,
  Type,
  LogIn,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORIES = [
  { value: 'Movies', label: '🎬 Movies', description: 'Cinema, OTT subscriptions' },
  { value: 'Gadgets', label: '💻 Gadgets', description: 'Electronics, tech accessories' },
  { value: 'Clothes', label: '👗 Clothes', description: 'Apparel, footwear, accessories' },
  { value: 'Food', label: '🍔 Food', description: 'Restaurants, groceries, delivery' },
  { value: 'Travel', label: '✈️ Travel', description: 'Transport, hotels, trips' },
  { value: 'Health', label: '💊 Health', description: 'Medical, fitness, wellness' },
  { value: 'Education', label: '📚 Education', description: 'Courses, books, tuition' },
  { value: 'Other', label: '📦 Other', description: 'Miscellaneous expenses' },
];

interface FormErrors {
  title?: string;
  price?: string;
  category?: string;
}

function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === 'User is already authenticated'
      ) {
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border shadow-card-lg p-10 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <LogIn className="w-8 h-8 text-gold" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            You need to be logged in to add expenses. Please log in to continue.
          </p>
        </div>
        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="bg-gold text-charcoal hover:bg-gold-dark font-semibold px-8 h-11 shadow-gold-glow"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Login to Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AddExpense() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const addExpenseMutation = useAddExpense();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.trim().length < 2) newErrors.title = 'Title must be at least 2 characters';

    const priceNum = parseFloat(price);
    if (!price) newErrors.price = 'Amount is required';
    else if (isNaN(priceNum) || priceNum <= 0) newErrors.price = 'Amount must be a positive number';

    if (!category) newErrors.category = 'Please select a category';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSuccess(false);
    try {
      await addExpenseMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
      });
      setTitle('');
      setPrice('');
      setDescription('');
      setCategory('');
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      // error handled by mutation state
    }
  };

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>
        <h2 className="font-display text-2xl font-bold text-foreground">Add New Expense</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Record a new expense with category and details
        </p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-6 flex items-center gap-3 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Expense added successfully!</p>
            <p className="text-xs opacity-80">Your expense has been recorded.</p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {addExpenseMutation.isError && (
        <div className="mb-6 flex items-center gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {addExpenseMutation.error instanceof Error
              ? addExpenseMutation.error.message
              : 'Failed to add expense. Please try again.'}
          </p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border shadow-card-lg p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
              <Type className="w-4 h-4 text-muted-foreground" />
              Expense Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Netflix Subscription, Grocery Shopping"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`h-11 ${errors.title ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-gold'}`}
            />
            {errors.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2 text-sm font-semibold">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                ₹
              </span>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                }}
                className={`h-11 pl-8 ${errors.price ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-gold'}`}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.price}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Category
            </Label>
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
            >
              <SelectTrigger
                id="category"
                className={`h-11 ${errors.category ? 'border-destructive focus:ring-destructive' : 'focus:ring-gold'}`}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Description{' '}
              <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add any notes or details about this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none focus-visible:ring-gold"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/dashboard' })}
              className="flex-1"
              disabled={addExpenseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addExpenseMutation.isPending}
              className="flex-1 bg-gold text-charcoal hover:bg-gold-dark font-semibold h-11 shadow-gold-glow"
            >
              {addExpenseMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-muted/50 rounded-xl border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          💡 Tips
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use descriptive titles to easily identify expenses later</li>
          <li>• Select the most relevant category for better reports</li>
          <li>• Add notes in the description for future reference</li>
        </ul>
      </div>
    </div>
  );
}
