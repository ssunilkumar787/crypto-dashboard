import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CoinList } from '../components/CoinList';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('CoinList', () => {
  beforeEach(() => {
    render(<CoinList />, { wrapper });
  });

  it('renders search input', () => {
    expect(screen.getByPlaceholderText(/search cryptocurrencies/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('updates search input value', () => {
    const searchInput = screen.getByPlaceholderText(/search cryptocurrencies/i);
    fireEvent.change(searchInput, { target: { value: 'bitcoin' } });
    expect(searchInput).toHaveValue('bitcoin');
  });

  it('toggles filters panel', () => {
    const filterButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filterButton);
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });
});