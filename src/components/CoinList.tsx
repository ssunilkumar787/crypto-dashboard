import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Search, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCoins } from '../services/api';
import { formatCurrency, formatMarketCap, formatPercentage } from '../lib/utils';
import type { Coin } from '../types';

type SortField = 'market_cap' | 'price_change_percentage_24h' | 'current_price';
type SortDirection = 'asc' | 'desc';

export function CoinList() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortField, setSortField] = React.useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  
  const { data: coins, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['coins', page],
    queryFn: () => getCoins(page),
  });

  const filteredAndSortedCoins = React.useMemo(() => {
    if (!coins) return [];
    
    let filtered = coins.filter((coin: Coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a: Coin, b: Coin) => {
      const multiplier = sortDirection === 'desc' ? -1 : 1;
      return (a[sortField] - b[sortField]) * multiplier;
    });
  }, [coins, search, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-red-500">Error loading coins. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <SlidersHorizontal size={20} />
        </button>
        <button
          onClick={() => refetch()}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          disabled={isRefetching}
        >
          <RefreshCw size={20} className={isRefetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Sort by</h3>
          <div className="flex gap-4">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="market_cap">Market Cap</option>
              <option value="price_change_percentage_24h">24h Change</option>
              <option value="current_price">Price</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as SortDirection)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-800">
              <th className="px-6 py-3 text-gray-600 dark:text-gray-400">#</th>
              <th className="px-6 py-3 text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-6 py-3 text-gray-600 dark:text-gray-400">Price</th>
              <th className="px-6 py-3 text-gray-600 dark:text-gray-400">24h %</th>
              <th className="px-6 py-3 text-gray-600 dark:text-gray-400">Market Cap</th>
              <th className="px-6 py-3 text-gray-600 dark:text-gray-400">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCoins.map((coin: Coin) => (
              <tr
                key={coin.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => navigate(`/coin/${coin.id}`)}
              >
                <td className="px-6 py-4 text-gray-900 dark:text-white">{coin.market_cap_rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                    <span className="font-medium text-gray-900 dark:text-white">{coin.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">{formatCurrency(coin.current_price)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      coin.price_change_percentage_24h >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    )}
                    {formatPercentage(Math.abs(coin.price_change_percentage_24h))}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">{formatMarketCap(coin.market_cap)}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">{formatMarketCap(coin.total_volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <button
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 text-gray-900 dark:text-white"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}