const BASE_URL = 'https://api.coingecko.com/api/v3';

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

export async function getCoins(page = 1, perPage = 20) {
  return fetchWithRetry(
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`
  );
}

export async function getCoin(id: string) {
  return fetchWithRetry(
    `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
  );
}

export async function getCoinPriceHistory(id: string, days: string) {
  return fetchWithRetry(
    `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  );
}