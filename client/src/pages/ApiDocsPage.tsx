import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/code";

const ApiDocsPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">CryptoPulse API Documentation</h1>
      
      <div className="mb-8 text-lg">
        <p>Access our powerful cryptocurrency data APIs to integrate real-time crypto market data, NFT analytics, and AI insights into your own applications.</p>
      </div>
      
      <Tabs defaultValue="rest">
        <TabsList className="mb-6">
          <TabsTrigger value="rest">RESTful API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rest">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>How to authenticate with our APIs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">All API requests require an API key that should be included in the HTTP headers:</p>
                <CodeBlock language="bash">
                  {`curl -X GET "https://api.cryptopulse.com/v1/crypto/markets" \\ 
  -H "x-api-key: YOUR_API_KEY"`}
                </CodeBlock>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>API usage limitations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Our API enforces rate limits based on your subscription tier:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Free: 100 requests/day</li>
                  <li>Pro: 10,000 requests/day</li>
                  <li>Enterprise: 100,000+ requests/day</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-2xl font-bold mt-12 mb-6">Endpoints</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>GET /api/crypto/coins/markets</CardTitle>
              <CardDescription>Get current market data for multiple cryptocurrencies</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Parameters:</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><span className="font-mono">vs_currency</span> - The target currency (Default: usd)</li>
                <li><span className="font-mono">ids</span> - Filter by comma-separated list of coin IDs</li>
                <li><span className="font-mono">category</span> - Filter by coin category</li>
                <li><span className="font-mono">order</span> - Sort by field (market_cap_desc, volume_desc, etc.)</li>
                <li><span className="font-mono">per_page</span> - Results per page (Default: 100, Max: 250)</li>
                <li><span className="font-mono">page</span> - Page number (Default: 1)</li>
              </ul>
              
              <h3 className="font-semibold mb-2">Example Response:</h3>
              <CodeBlock language="json">
                {`[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "current_price": 57324.12,
    "market_cap": 1098765432109,
    "market_cap_rank": 1,
    "total_volume": 32109876543,
    "high_24h": 58100.00,
    "low_24h": 56800.75,
    "price_change_24h": 524.37,
    "price_change_percentage_24h": 0.92,
    "circulating_supply": 19145643,
    "ath": 69000.00,
    "ath_date": "2025-01-10T14:24:11.849Z"
  },
  // Additional coins...
]`}
              </CodeBlock>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>GET /api/nft/collections</CardTitle>
              <CardDescription>Get trending NFT collections with market data</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Parameters:</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><span className="font-mono">chain</span> - Blockchain (ethereum, solana, etc.)</li>
                <li><span className="font-mono">time_range</span> - Data range (24h, 7d, 30d)</li>
                <li><span className="font-mono">sort_by</span> - Sort by field (volume, floor_price, etc.)</li>
                <li><span className="font-mono">limit</span> - Number of results (Default: 20, Max: 100)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Notifications</CardTitle>
              <CardDescription>Real-time event notifications via webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our webhook system allows you to receive real-time notifications when specific events occur:
              </p>
              
              <h3 className="font-semibold mb-2">Available Events:</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Price Alerts - When a cryptocurrency reaches a specified price threshold</li>
                <li>Volume Alerts - When trading volume exceeds a specified threshold</li>
                <li>News Events - When significant market news is published</li>
                <li>NFT Sales - When notable NFT sales occur in tracked collections</li>
              </ul>
              
              <h3 className="font-semibold mb-2">Webhook Setup:</h3>
              <p>
                Configure webhooks through the API Dashboard in your account settings.
                Specify a secure endpoint URL that can receive POST requests with JSON payloads.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sdks">
          <Card>
            <CardHeader>
              <CardTitle>Official SDK Libraries</CardTitle>
              <CardDescription>Client libraries for popular programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">JavaScript/TypeScript</h3>
                  <CodeBlock language="bash">
                    {`npm install @cryptopulse/sdk`}
                  </CodeBlock>
                  
                  <CodeBlock language="javascript" className="mt-4">
                    {`import { CryptoPulse } from '@cryptopulse/sdk';

const api = new CryptoPulse('YOUR_API_KEY');

// Get market data
const markets = await api.crypto.getMarkets({
  vs_currency: 'usd',
  ids: ['bitcoin', 'ethereum']
});

console.log(markets);`}
                  </CodeBlock>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Python</h3>
                  <CodeBlock language="bash">
                    {`pip install cryptopulse-sdk`}
                  </CodeBlock>
                  
                  <CodeBlock language="python" className="mt-4">
                    {`from cryptopulse import CryptoPulse

api = CryptoPulse(api_key='YOUR_API_KEY')

# Get market data
markets = api.crypto.get_markets(
    vs_currency='usd',
    ids=['bitcoin', 'ethereum']
)

print(markets)`}
                  </CodeBlock>
                </div>
              </div>
              
              <p className="mt-6">
                Additional SDK libraries are available for Java, C#, Go, and Ruby.
                Visit our GitHub repository for documentation and examples.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocsPage;