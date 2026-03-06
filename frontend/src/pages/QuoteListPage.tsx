import { Link } from 'react-router-dom';
import { FileText, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listQuotes, deleteQuote } from '../api/client';

function formatMoney(n: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function QuoteListPage() {
  const queryClient = useQueryClient();
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: listQuotes,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="size-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-slate-600">Loading quotes…</p>
      </div>
    );
  }

  if (!quotes?.length) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My quotes</h1>
          <p className="mt-1 text-slate-600">Create and manage your quotes here.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500">
            <FileText className="size-8" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">No quotes yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Create a quote from voice input or start from scratch.
          </p>
          <Link
            to="/quotes/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="size-5" />
            New quote
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My quotes</h1>
          <p className="mt-1 text-slate-600">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/quotes/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
        >
          <Plus className="size-5" />
          New quote
        </Link>
      </div>

      <ul className="space-y-3">
        {quotes.map((q) => (
          <li
            key={q.id}
            className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {q.clientName || `Quote`}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">{formatDate(q.createdAt)}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold tabular-nums text-slate-900">
                {formatMoney(q.total)}
              </span>
              <div className="flex items-center gap-1">
                <Link
                  to={`/quotes/${q.id}`}
                  className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Edit quote"
                >
                  <Pencil className="size-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete this quote? This cannot be undone.')) {
                      deleteMutation.mutate(q.id);
                    }
                  }}
                  className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete quote"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
