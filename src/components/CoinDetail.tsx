import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowDown, ArrowUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getCoin, getCoinPriceHistory } from '../services/api';
import { formatCurrency, formatMarketCap, formatPercentage } from '../lib/utils';
import type { TimeFrame } from '../types';

const timeFrames: { label: string; value: TimeFrame }[] = [
  { label: '24h', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '365d' },
];

export function CoinDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>('7d');

  const { data: coin, isLoading: isLoadingCoin } = useQuery({
    queryKey: ['coin', id],
    queryFn: () => getCoin(id!),
    enabled: !!id,
  });

  const { data: priceHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['priceHistory', id, timeFrame],
    queryFn: () => getCoinPriceHistory(id!, timeFrame),
    enabled: !!id,
  });

  const chartData = React.useMemo(() => {
    if (!priceHistory?.prices) return [];
    return priceHistory.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price,
    }));
  }, [priceHistory]);

  if (isLoadingCoin || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading coin details. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back to list
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <img src={coin.image.large} alt={coin.name} className="w-16 h-16" />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {coin.name}
              <span className="text-gray-500 text-lg uppercase">{coin.symbol}</span>
            </h1>
            <p className="text-gray-600">Rank #{coin.market_cap_rank}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Price</h3>
            <p className="text-xl font-semibold">
              {formatCurrency(coin.market_data.current_price.usd)}
            </p>
            <span
              className={`flex items-center gap-1 text-sm ${
                coin.market_data.price_change_percentage_24h >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {coin.market_data.price_change_percentage_24h >= 0 ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              {formatPercentage(Math.abs(coin.market_data.price_change_percentage_24h))}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Market Cap</h3>
            <p className="text-xl font-semibold">
              {formatMarketCap(coin.market_data.market_cap.usd)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">24h Volume</h3>
            <p className="text-xl font-semibold">
              {formatMarketCap(coin.market_data.total_volume.usd)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            {timeFrames.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeFrame(value)}
                className={`px-4 py-2 rounded-lg ${
                  timeFrame === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">About {coin.name}</h2>
            <div
              dangerouslySetInnerHTML={{ __html: coin.description.en }}
              className="text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}