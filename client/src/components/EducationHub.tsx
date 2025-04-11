import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import RealCourses from "./RealCourses";

const EducationHub = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("basics");
  const [view, setView] = useState<"topics" | "resources" | "courses" | "realCourses">("topics");
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState("");
  
  const educationCategories = [
    {
      id: "basics",
      icon: "school",
      title: t("education.basics.title", "Basics"),
      description: t("education.basics.description", "Basic concepts of cryptocurrencies and blockchain"),
      content: [
        {
          id: "what-are-cryptocurrencies",
          question: t("education.basics.what.question", "What are cryptocurrencies?"),
          answer: t("education.basics.what.answer", "Cryptocurrencies are digital or virtual currencies that use cryptography for security and operate on a technology called blockchain, which is a distributed ledger enforced by a network of computers. Cryptocurrencies are typically not issued by any central authority, making them potentially immune to government interference or manipulation."),
        },
        {
          id: "what-is-blockchain",
          question: t("education.basics.blockchain.question", "What is blockchain?"),
          answer: t("education.basics.blockchain.answer", "Blockchain is a distributed database or ledger that is shared among the nodes of a computer network. As a database, a blockchain stores information electronically in digital format. Blockchains are best known for their crucial role in cryptocurrency systems, such as Bitcoin, for maintaining a secure and decentralized record of transactions. The innovation with blockchain is that it guarantees the fidelity and security of a record of data and generates trust without the need for a trusted third party."),
        },
        {
          id: "how-do-wallets-work",
          question: t("education.basics.wallet.question", "How do wallets work?"),
          answer: t("education.basics.wallet.answer", "Cryptocurrency wallets are software programs that store your public and private keys and interface with various blockchain networks to enable users to send and receive digital currency and monitor their balance. If you want to use cryptocurrency, you will need to have a digital wallet.<br><br>Wallets contain a private key (a secret number that allows you to spend your cryptocurrency) and a public key (similar to an account number). When you send cryptocurrency, you're essentially signing off ownership of the coins to a new owner's public key."),
        },
        {
          id: "what-is-mining",
          question: t("education.basics.mining.question", "What is cryptocurrency mining?"),
          answer: t("education.basics.mining.answer", "Cryptocurrency mining is the process by which new coins are created and transactions are added to a blockchain. Miners use computer processing power to solve complex mathematical problems. The first miner to solve the problem gets to add a new block of verified transactions to the blockchain and receives a reward in the form of cryptocurrency.<br><br>Mining serves two purposes: it adds transactions to the blockchain in a way that is immutable and secure, and it creates new currency units."),
        },
      ],
    },
    {
      id: "defi",
      icon: "account_balance",
      title: t("education.defi.title", "DeFi"),
      description: t("education.defi.description", "Decentralized Finance and its applications"),
      content: [
        {
          id: "what-is-defi",
          question: t("education.defi.what.question", "What is DeFi?"),
          answer: t("education.defi.what.answer", "Decentralized Finance (DeFi) is a blockchain-based form of finance that does not rely on central financial intermediaries such as brokerages, exchanges, or banks to offer traditional financial instruments, and instead utilizes smart contracts on blockchains. DeFi platforms allow people to lend or borrow funds from others, speculate on price movements on a range of assets using derivatives, trade cryptocurrencies, insure against risks, and earn interest in savings-like accounts."),
        },
        {
          id: "how-does-defi-differ",
          question: t("education.defi.differ.question", "How does DeFi differ from traditional finance?"),
          answer: t("education.defi.differ.answer", "Unlike traditional financial systems which rely on centralized authorities like banks and financial institutions, DeFi operates on decentralized networks, primarily blockchain technology. This means there are no intermediaries controlling your assets or transactions.<br><br>Key differences include:<br>• No central authority - operates via smart contracts<br>• 24/7 operation - no business hours<br>• No personal identification requirements in many cases<br>• Transparent and open-source code<br>• Composability - DeFi applications can be built on top of each other"),
        },
        {
          id: "defi-protocols",
          question: t("education.defi.protocols.question", "What are popular DeFi protocols?"),
          answer: t("education.defi.protocols.answer", "There are numerous DeFi protocols offering various services:<br><br>• Lending platforms: Aave, Compound<br>• Decentralized exchanges (DEXs): Uniswap, SushiSwap<br>• Yield farming: Yearn Finance<br>• Synthetic assets: Synthetix<br>• Stablecoins: MakerDAO (DAI), USDC<br>• Insurance: Nexus Mutual<br>• Derivatives: dYdX<br><br>Each of these protocols offers specific functionalities within the DeFi ecosystem, allowing users to access financial services in a decentralized manner."),
        },
        {
          id: "defi-risks",
          question: t("education.defi.risks.question", "What are the risks of DeFi?"),
          answer: t("education.defi.risks.answer", "While DeFi offers exciting possibilities, it also comes with significant risks:<br><br>• Smart Contract Risk - vulnerabilities in code can be exploited<br>• Impermanent Loss - risk specific to providing liquidity<br>• Regulatory Risk - unclear or changing regulations<br>• Market Risk - volatility in cryptocurrency prices<br>• Collateralization Risk - for lending platforms<br>• Oracle Risk - reliance on external data sources<br>• User Error - complex interfaces can lead to mistakes<br><br>It's important to thoroughly research and understand these risks before participating in DeFi activities."),
        },
      ],
    },
    {
      id: "nft",
      icon: "filter_none",
      title: t("education.nft.title", "NFTs"),
      description: t("education.nft.description", "Non-fungible tokens and digital ownership"),
      content: [
        {
          id: "what-are-nfts",
          question: t("education.nft.what.question", "What are NFTs?"),
          answer: t("education.nft.what.answer", "NFTs (Non-Fungible Tokens) are unique digital tokens that represent ownership of a specific item, such as digital art, music, videos, virtual real estate, or other digital collectibles. Unlike cryptocurrencies like Bitcoin or Ethereum, which are fungible (each unit is identical to another), NFTs are unique and cannot be exchanged on a like-for-like basis."),
        },
        {
          id: "how-do-nfts-work",
          question: t("education.nft.work.question", "How do NFTs work?"),
          answer: t("education.nft.work.answer", "NFTs operate on blockchain technology, primarily Ethereum, although other blockchains like Solana, Binance Smart Chain, and Flow also support them. When an NFT is created ('minted'), a unique token ID is assigned to it and stored on the blockchain.<br><br>This token contains metadata including:<br>• A link to the digital asset it represents<br>• Information about the creator<br>• Ownership history<br>• Other relevant details<br><br>The blockchain provides a verifiable record of ownership, authenticity, and transaction history."),
        },
        {
          id: "nft-use-cases",
          question: t("education.nft.use.question", "What are NFT use cases?"),
          answer: t("education.nft.use.answer", "NFTs have a variety of applications across different industries:<br><br>• Digital Art - Artists can sell their work directly to global audiences<br>• Gaming - In-game items that can be owned and traded across platforms<br>• Music - Musicians can sell limited editions of songs or albums<br>• Virtual Real Estate - Ownership of land in virtual worlds<br>• Collectibles - Digital trading cards and collectibles<br>• Event Tickets - Verifiable and transferable digital tickets<br>• Identity and Certification - Academic credentials, memberships<br>• Intellectual Property - Royalty distributions for creators<br><br>This technology continues to evolve with new use cases emerging regularly."),
        },
      ],
    },
    {
      id: "trading",
      icon: "candlestick_chart",
      title: t("education.trading.title", "Trading"),
      description: t("education.trading.description", "Cryptocurrency trading strategies and analysis"),
      content: [
        {
          id: "technical-vs-fundamental",
          question: t("education.trading.analysis.question", "Technical vs. Fundamental Analysis"),
          answer: t("education.trading.analysis.answer", "There are two primary approaches to analyzing cryptocurrency markets:<br><br><strong>Technical Analysis</strong> involves studying price charts and using statistical patterns to predict future price movements. Technical analysts use tools like:<br>• Moving averages<br>• Chart patterns<br>• Support and resistance levels<br>• Indicators like RSI, MACD, and Bollinger Bands<br><br><strong>Fundamental Analysis</strong> focuses on evaluating a cryptocurrency's intrinsic value based on:<br>• Project technology and innovation<br>• Team expertise and track record<br>• Adoption metrics and network effects<br>• Tokenomics and supply mechanisms<br>• Competitive landscape and market potential<br><br>Many successful traders use a combination of both approaches."),
        },
        {
          id: "trading-strategies",
          question: t("education.trading.strategy.question", "Common Trading Strategies"),
          answer: t("education.trading.strategy.answer", "Several strategies are popular among cryptocurrency traders:<br><br><strong>Day Trading</strong> - Opening and closing positions within the same day<br><strong>Swing Trading</strong> - Holding positions for several days to weeks to profit from expected price movements<br><strong>Position Trading</strong> - Long-term holdings based on fundamental beliefs about the asset<br><strong>Dollar-Cost Averaging (DCA)</strong> - Regularly purchasing fixed amounts regardless of price<br><strong>HODL</strong> - Buying and holding long-term regardless of price fluctuations<br><strong>Arbitrage</strong> - Exploiting price differences between different exchanges<br><strong>Trend Following</strong> - Entering positions in the direction of established trends<br><br>The best strategy depends on your time availability, risk tolerance, and market knowledge."),
        },
        {
          id: "risk-management",
          question: t("education.trading.risk.question", "Risk Management"),
          answer: t("education.trading.risk.answer", "Effective risk management is crucial for cryptocurrency trading success:<br><br>• <strong>Position Sizing</strong> - Never risk more than a small percentage (1-5%) of your portfolio on a single trade<br>• <strong>Stop-Loss Orders</strong> - Automatically exit positions if they move against you beyond a predetermined point<br>• <strong>Take-Profit Levels</strong> - Set targets to lock in profits<br>• <strong>Risk/Reward Ratio</strong> - Only take trades with favorable risk-to-reward ratios (typically at least 1:2)<br>• <strong>Portfolio Diversification</strong> - Spread risk across different cryptocurrencies<br>• <strong>Emotional Control</strong> - Develop disciplined trading with a clear plan<br>• <strong>Never Invest More Than You Can Afford to Lose</strong> - Cryptocurrency markets are highly volatile<br><br>Consistent risk management is often what separates successful traders from unsuccessful ones."),
        },
      ],
    },
  ];
  
  const courses = [
    {
      id: "blockchain-101",
      title: "Blockchain 101",
      level: "Beginner",
      duration: "4 hours",
      description: "Introduction to blockchain technology, cryptocurrencies, and their applications.",
      lessons: 12,
      progress: 75,
      tags: ["Blockchain", "Basics", "Crypto"],
      image: "school"
    },
    {
      id: "defi-masterclass",
      title: "DeFi Masterclass",
      level: "Intermediate",
      duration: "8 hours",
      description: "Deep dive into decentralized finance protocols, lending, borrowing, and yield farming.",
      lessons: 24,
      progress: 30,
      tags: ["DeFi", "Ethereum", "Finance"],
      image: "account_balance"
    },
    {
      id: "trading-fundamentals",
      title: "Trading Fundamentals",
      level: "All Levels",
      duration: "6 hours",
      description: "Learn the basics of cryptocurrency trading, chart analysis, and risk management.",
      lessons: 18,
      progress: 0,
      tags: ["Trading", "Analysis", "Strategy"],
      image: "candlestick_chart"
    },
    {
      id: "nft-creation",
      title: "NFT Creation & Marketing",
      level: "Advanced",
      duration: "5 hours",
      description: "Create, mint, and market your own NFT collections on various marketplaces.",
      lessons: 15,
      progress: 0,
      tags: ["NFT", "Art", "Marketing"],
      image: "filter_none"
    }
  ];
  
  const featuredResources = [
    {
      id: "bitcoin-whitepaper",
      title: t("education.resources.bitcoin", "Bitcoin Whitepaper"),
      icon: "menu_book",
      description: t("education.resources.bitcoinDesc", "The original document by Satoshi Nakamoto that introduced Bitcoin to the world"),
      link: "https://bitcoin.org/bitcoin.pdf",
      type: "Document"
    },
    {
      id: "ethereum-whitepaper",
      title: t("education.resources.ethereum", "Ethereum Whitepaper"),
      icon: "menu_book",
      description: t("education.resources.ethereumDesc", "Vitalik Buterin's vision for a smart contract platform"),
      link: "https://ethereum.org/en/whitepaper/",
      type: "Document"
    },
    {
      id: "defi-primer",
      title: t("education.resources.defiPrimer", "DeFi Primer"),
      icon: "web",
      description: t("education.resources.defiPrimerDesc", "A comprehensive guide to understanding decentralized finance"),
      link: "https://blog.coinbase.com/a-beginners-guide-to-decentralized-finance-defi-574c68ff43c4",
      type: "Article"
    },
    {
      id: "crypto-glossary",
      title: t("education.resources.cryptoGlossary", "Cryptocurrency Glossary"),
      icon: "format_list_bulleted",
      description: t("education.resources.cryptoGlossaryDesc", "Comprehensive glossary of cryptocurrency terms and definitions"),
      link: "https://www.coinbase.com/learn/crypto-basics/crypto-glossary",
      type: "Reference"
    },
    {
      id: "nft-guide",
      title: t("education.resources.nftGuide", "NFT Beginner's Guide"),
      icon: "article",
      description: t("education.resources.nftGuideDesc", "Everything you need to know to get started with non-fungible tokens"),
      link: "https://ethereum.org/en/nft/",
      type: "Guide"
    },
    {
      id: "trading-basics",
      title: t("education.resources.tradingBasics", "Crypto Trading Fundamentals"),
      icon: "video_library",
      description: t("education.resources.tradingBasicsDesc", "Video series explaining the basics of cryptocurrency trading"),
      link: "https://www.coinbase.com/learn/crypto-basics/what-is-cryptocurrency-trading",
      type: "Video"
    },
  ];
  
  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const markAsCompleted = (id: string) => {
    if (completedTopics.includes(id)) {
      setCompletedTopics(completedTopics.filter(topicId => topicId !== id));
    } else {
      setCompletedTopics([...completedTopics, id]);
    }
  };
  
  const toggleBookmark = (id: string) => {
    if (bookmarkedResources.includes(id)) {
      setBookmarkedResources(bookmarkedResources.filter(resourceId => resourceId !== id));
    } else {
      setBookmarkedResources([...bookmarkedResources, id]);
    }
  };
  
  const getTotalProgress = () => {
    const totalTopics = educationCategories.reduce((acc, category) => acc + category.content.length, 0);
    return Math.round((completedTopics.length / totalTopics) * 100);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">{t("education.title", "Education Hub")}</h2>
          <div className="flex items-center text-sm text-gray-400">
            <span className="mr-2">{t("education.progress", "Your Progress")}:</span>
            <span className="font-medium">{getTotalProgress()}%</span>
          </div>
        </div>
        <Progress value={getTotalProgress()} className="h-2 mb-2" />
        <p className="text-sm text-gray-400">{t("education.subtitle", "Learn about cryptocurrencies, blockchain, and decentralized finance")}</p>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-4 mb-6">
        <div className="flex space-x-4">
          <Button 
            variant={view === "topics" ? "default" : "outline"} 
            onClick={() => setView("topics")}
            className="flex items-center"
          >
            <span className="material-icons mr-2 text-sm">subject</span>
            {t("education.topicsView", "Topics")}
          </Button>
          <Button 
            variant={view === "courses" ? "default" : "outline"} 
            onClick={() => setView("courses")}
            className="flex items-center"
          >
            <span className="material-icons mr-2 text-sm">school</span>
            {t("education.coursesView", "Courses")}
          </Button>
          <Button 
            variant={view === "resources" ? "default" : "outline"} 
            onClick={() => setView("resources")}
            className="flex items-center"
          >
            <span className="material-icons mr-2 text-sm">library_books</span>
            {t("education.resourcesView", "Resources")}
          </Button>
        </div>
      </div>
      
      {view === "topics" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-lg p-4 sticky top-4">
              <h3 className="text-lg font-medium mb-4">{t("education.categories", "Categories")}</h3>
              <div className="space-y-2">
                {educationCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedTab === category.id ? "default" : "ghost"}
                    className={`w-full justify-start ${selectedTab === category.id ? '' : 'text-gray-400'}`}
                    onClick={() => setSelectedTab(category.id)}
                  >
                    <span className="material-icons mr-2">{category.icon}</span>
                    {category.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {educationCategories.map((category) => (
              category.id === selectedTab && (
                <div key={category.id} className="space-y-6">
                  <div className="bg-secondary rounded-lg p-6">
                    <div className="flex items-start mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                        <span className="material-icons text-primary text-2xl">{category.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{category.title}</h3>
                        <p className="text-gray-400">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {category.content.map((item, index) => (
                        <Card key={`${category.id}-${index}`} className="border border-gray-800">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-md flex items-center">
                                  {item.question}
                                  {completedTopics.includes(item.id) && (
                                    <span className="material-icons text-emerald-500 ml-2 text-sm">check_circle</span>
                                  )}
                                </CardTitle>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleAccordion(item.id)}
                                className="h-8 w-8"
                              >
                                <span className="material-icons">
                                  {expandedAccordions[item.id] ? 'expand_less' : 'expand_more'}
                                </span>
                              </Button>
                            </div>
                          </CardHeader>
                          
                          {expandedAccordions[item.id] && (
                            <>
                              <CardContent>
                                <div 
                                  className="text-gray-300 text-sm space-y-2" 
                                  dangerouslySetInnerHTML={{ __html: item.answer }}
                                ></div>
                              </CardContent>
                              
                              <CardFooter className="flex justify-end pt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => markAsCompleted(item.id)}
                                  className={completedTopics.includes(item.id) ? "bg-emerald-500/20 text-emerald-500 border-emerald-600" : ""}
                                >
                                  <span className="material-icons mr-1 text-sm">
                                    {completedTopics.includes(item.id) ? 'task_alt' : 'check_circle_outline'}
                                  </span>
                                  {completedTopics.includes(item.id) 
                                    ? t("education.markAsIncomplete", "Mark as Incomplete") 
                                    : t("education.markAsComplete", "Mark as Complete")}
                                </Button>
                              </CardFooter>
                            </>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      
      {view === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-secondary border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="mr-2">
                        {course.level}
                      </Badge>
                      <span className="text-xs text-gray-400">{course.duration}</span>
                    </div>
                    <CardTitle>{course.title}</CardTitle>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-icons text-primary">{course.image}</span>
                  </div>
                </div>
                <CardDescription className="mt-2">{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t("education.progress", "Progress")}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-gray-400">{t("education.lessons", "Lessons")}: {course.lessons}</span>
                    <div className="flex flex-wrap gap-1">
                      {course.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-primary">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full">
                  {course.progress > 0 
                    ? t("education.continueCourse", "Continue Course") 
                    : t("education.startCourse", "Start Course")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {view === "resources" && (
        <div>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.map((resource) => (
                <Card key={resource.id} className="bg-secondary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md flex-1">{resource.title}</CardTitle>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {resource.type}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleBookmark(resource.id)}
                          className="h-8 w-8"
                        >
                          <span className="material-icons text-gray-400 hover:text-primary">
                            {bookmarkedResources.includes(resource.id) ? 'bookmark' : 'bookmark_border'}
                          </span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center pt-0">
                    <a 
                      href={resource.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline flex items-center"
                    >
                      {t("education.readMore", "Read More")}
                      <span className="material-icons text-xs ml-1">open_in_new</span>
                    </a>
                    <span className="material-icons text-primary">{resource.icon}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {bookmarkedResources.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">{t("education.bookmarkedResources", "Your Bookmarked Resources")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredResources
                  .filter(resource => bookmarkedResources.includes(resource.id))
                  .map((resource) => (
                    <Card key={`bookmarked-${resource.id}`} className="bg-gray-800 border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-md flex-1">{resource.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleBookmark(resource.id)}
                            className="h-8 w-8"
                          >
                            <span className="material-icons text-primary">bookmark</span>
                          </Button>
                        </div>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <a 
                          href={resource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline flex items-center"
                        >
                          {t("education.readMore", "Read More")}
                          <span className="material-icons text-xs ml-1">open_in_new</span>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EducationHub;
