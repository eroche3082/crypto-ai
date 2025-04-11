import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Award, BookOpen, PlayCircle, Star, Bookmark, BookmarkCheck } from "lucide-react";

export interface Course {
  id: string;
  title: string;
  provider: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  duration: string;
  description: string;
  longDescription?: string;
  lessons: number;
  progress: number;
  rating: number;
  reviews: number;
  tags: string[];
  image: string;
  instructor?: string;
  certification?: boolean;
  features?: string[];
  price?: string;
  syllabus?: {
    title: string;
    items: string[];
  }[];
  enrollmentLink?: string;
}

export const realCourses: Course[] = [
  {
    id: "blockchain-foundations",
    title: "Blockchain Foundations & Cryptoeconomics",
    provider: "MIT",
    level: "Beginner",
    duration: "6 weeks",
    description: "Learn the fundamentals of blockchain technology, cryptography, and the economic models that power cryptocurrencies.",
    longDescription: "This comprehensive course from MIT explores the technical foundations of blockchain systems while delving into the economic theories that make cryptocurrencies viable. You'll gain an understanding of distributed ledger technology, consensus mechanisms, and the incentive structures that maintain blockchain networks.",
    lessons: 24,
    progress: 0,
    rating: 4.8,
    reviews: 1254,
    tags: ["Blockchain", "Economics", "Cryptography"],
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=300",
    instructor: "Gary Gensler",
    certification: true,
    features: [
      "Self-paced learning",
      "Hands-on exercises",
      "Case studies of major cryptocurrencies",
      "Certificate of completion"
    ],
    price: "Free (Certificate: $149)",
    syllabus: [
      {
        title: "Week 1: Cryptography Basics",
        items: [
          "Public/Private Key Cryptography",
          "Hash Functions",
          "Digital Signatures"
        ]
      },
      {
        title: "Week 2: Blockchain Structure",
        items: [
          "Distributed Ledgers",
          "Blocks and Chains",
          "Merkle Trees"
        ]
      },
      {
        title: "Week 3: Consensus Mechanisms",
        items: [
          "Proof of Work",
          "Proof of Stake",
          "Alternative Consensus Methods"
        ]
      },
      {
        title: "Week 4: Cryptoeconomics",
        items: [
          "Game Theory in Blockchains",
          "Token Economics",
          "Incentive Structures"
        ]
      },
      {
        title: "Week 5: Blockchain Applications",
        items: [
          "Smart Contracts",
          "Decentralized Finance",
          "Supply Chain Management"
        ]
      },
      {
        title: "Week 6: Future of Blockchain",
        items: [
          "Scalability Solutions",
          "Interoperability",
          "Regulatory Considerations"
        ]
      }
    ],
    enrollmentLink: "https://ocw.mit.edu/courses/sloan-school-of-management/15-s12-blockchain-and-money-fall-2018/"
  },
  {
    id: "defi-masterclass",
    title: "DeFi Masterclass: From Basics to Yield Farming",
    provider: "Binance Academy",
    level: "Intermediate",
    duration: "4 weeks",
    description: "Master decentralized finance protocols, including lending, borrowing, liquidity provision, and advanced yield strategies.",
    longDescription: "This practical DeFi course takes you from understanding basic financial primitives to implementing complex yield farming strategies. You'll learn how to interact with major protocols like Aave, Compound, and Uniswap while understanding the risks and opportunities in the DeFi ecosystem.",
    lessons: 16,
    progress: 0,
    rating: 4.6,
    reviews: 870,
    tags: ["DeFi", "Ethereum", "Yield Farming"],
    image: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=300",
    instructor: "Daniel Wang",
    certification: true,
    features: [
      "Interactive protocol interfaces",
      "Risk assessment frameworks",
      "Live demonstrations",
      "Portfolio simulations"
    ],
    price: "Free",
    syllabus: [
      {
        title: "Week 1: DeFi Fundamentals",
        items: [
          "Traditional Finance vs. DeFi",
          "Smart Contract Architecture",
          "Risk Management in DeFi"
        ]
      },
      {
        title: "Week 2: Lending and Borrowing",
        items: [
          "Aave Protocol Deep Dive",
          "Compound Finance",
          "Collateralization Strategies"
        ]
      },
      {
        title: "Week 3: Liquidity and Trading",
        items: [
          "Automated Market Makers",
          "Uniswap v3 Position Management",
          "Impermanent Loss Explained"
        ]
      },
      {
        title: "Week 4: Advanced Yield Strategies",
        items: [
          "Yield Aggregators",
          "Multi-protocol Strategies",
          "Risk-adjusted Returns"
        ]
      }
    ],
    enrollmentLink: "https://academy.binance.com/"
  },
  {
    id: "technical-analysis-mastery",
    title: "Crypto Technical Analysis Mastery",
    provider: "TradingView",
    level: "All Levels",
    duration: "8 weeks",
    description: "Comprehensive technical analysis course for cryptocurrency markets, covering chart patterns, indicators, and trading strategies.",
    longDescription: "This hands-on course teaches you how to analyze cryptocurrency price action using proven technical analysis methods. You'll learn to identify patterns, use indicators effectively, and develop trading strategies tailored to the volatile crypto markets. Includes practice with live market analysis.",
    lessons: 32,
    progress: 0,
    rating: 4.7,
    reviews: 1893,
    tags: ["Trading", "Technical Analysis", "Charts"],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=300",
    instructor: "Peter Brandt",
    certification: true,
    features: [
      "Interactive charting exercises",
      "Trading strategy development",
      "Risk management frameworks",
      "Portfolio backtesting tools"
    ],
    price: "$199",
    syllabus: [
      {
        title: "Week 1-2: Chart Basics",
        items: [
          "Candlestick Patterns",
          "Support and Resistance",
          "Trend Analysis"
        ]
      },
      {
        title: "Week 3-4: Technical Indicators",
        items: [
          "Moving Averages",
          "RSI, MACD, and Stochastics",
          "Volume Analysis"
        ]
      },
      {
        title: "Week 5-6: Trading Strategies",
        items: [
          "Swing Trading Setups",
          "Breakout Strategies",
          "Mean Reversion Techniques"
        ]
      },
      {
        title: "Week 7-8: Advanced Analysis",
        items: [
          "Fibonacci Applications",
          "Elliott Wave Theory",
          "Market Cycles in Crypto"
        ]
      }
    ],
    enrollmentLink: "https://www.tradingview.com/education/"
  },
  {
    id: "nft-creation-collection",
    title: "NFT Creation & Collection Building",
    provider: "Ethereum Foundation",
    level: "Intermediate",
    duration: "3 weeks",
    description: "Learn to create, mint, and market NFT collections, understanding metadata standards and marketplace dynamics.",
    longDescription: "This practical NFT course covers the entire lifecycle of non-fungible tokens, from artistic creation to smart contract deployment and collection management. Ideal for creators, developers, and entrepreneurs looking to launch NFT projects on Ethereum and other chains.",
    lessons: 12,
    progress: 0,
    rating: 4.5,
    reviews: 620,
    tags: ["NFT", "Creation", "Smart Contracts"],
    image: "https://images.unsplash.com/photo-1646548851235-0321e69f812f?q=80&w=300",
    instructor: "DCL Blogger",
    certification: false,
    features: [
      "Step-by-step NFT creation",
      "Smart contract templates",
      "Marketplace integration guides",
      "Community building strategies"
    ],
    price: "Free",
    syllabus: [
      {
        title: "Week 1: NFT Fundamentals",
        items: [
          "Token Standards (ERC-721, ERC-1155)",
          "Metadata Standards",
          "Storage Solutions (IPFS)"
        ]
      },
      {
        title: "Week 2: Creation & Minting",
        items: [
          "Digital Asset Creation",
          "Smart Contract Deployment",
          "Minting Processes"
        ]
      },
      {
        title: "Week 3: Marketplaces & Community",
        items: [
          "Marketplace Strategies",
          "Collection Marketing",
          "Community Building"
        ]
      }
    ],
    enrollmentLink: "https://ethereum.org/learn/"
  },
  {
    id: "web3-development",
    title: "Web3 Development with JavaScript",
    provider: "ConsenSys Academy",
    level: "Advanced",
    duration: "10 weeks",
    description: "Comprehensive course on building decentralized applications using JavaScript, Web3.js, Ethers.js and popular development frameworks.",
    longDescription: "This developer-focused course covers everything you need to build professional dApps on Ethereum and EVM-compatible blockchains. You'll learn Web3 libraries, smart contract integration, wallet connectivity, and best practices for decentralized application architecture.",
    lessons: 40,
    progress: 0,
    rating: 4.9,
    reviews: 756,
    tags: ["Development", "JavaScript", "dApps"],
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=300",
    instructor: "Austin Griffith",
    certification: true,
    features: [
      "Hands-on coding projects",
      "GitHub repository access",
      "Developer community access",
      "Code reviews"
    ],
    price: "$349",
    syllabus: [
      {
        title: "Week 1-2: Web3 Foundations",
        items: [
          "Blockchain Interaction Models",
          "Web3.js & Ethers.js Basics",
          "Provider & Signer Concepts"
        ]
      },
      {
        title: "Week 3-4: Smart Contract Integration",
        items: [
          "ABI & Contract Interactions",
          "Event Listening & Subscriptions",
          "Transaction Management"
        ]
      },
      {
        title: "Week 5-6: Frontend Integration",
        items: [
          "React with Web3",
          "Wallet Connect Implementations",
          "UI/UX for Blockchain Apps"
        ]
      },
      {
        title: "Week 7-8: Advanced Topics",
        items: [
          "Gas Optimization",
          "ENS Integration",
          "IPFS & Decentralized Storage"
        ]
      },
      {
        title: "Week 9-10: Project Development",
        items: [
          "Architecture Planning",
          "Full dApp Implementation",
          "Testing & Deployment"
        ]
      }
    ],
    enrollmentLink: "https://consensys.net/academy/"
  },
  {
    id: "tokenomics-design",
    title: "Tokenomics Design & Implementation",
    provider: "Outlier Ventures",
    level: "Advanced",
    duration: "5 weeks",
    description: "Learn to design, model, and implement effective token economic systems for blockchain projects.",
    longDescription: "This specialized course focuses on the economic design of token systems, covering monetary policy, token distribution strategies, incentive mechanisms, and governance models. Ideal for project founders, economists, and protocol designers.",
    lessons: 20,
    progress: 0,
    rating: 4.7,
    reviews: 341,
    tags: ["Tokenomics", "Economics", "Governance"],
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=300",
    instructor: "Dr. Lisa JY Tan",
    certification: true,
    features: [
      "Economic modeling tools",
      "Case studies of successful tokenomics",
      "Simulation frameworks",
      "Expert guest lectures"
    ],
    price: "$499",
    syllabus: [
      {
        title: "Week 1: Token Economics Foundations",
        items: [
          "Monetary Theory for Tokens",
          "Token Classification",
          "Value Capture Mechanisms"
        ]
      },
      {
        title: "Week 2: Supply Mechanisms",
        items: [
          "Inflation/Deflation Models",
          "Bonding Curves",
          "Algorithmic Supply Control"
        ]
      },
      {
        title: "Week 3: Distribution Strategies",
        items: [
          "Fair Launch Methods",
          "Vesting Schedules",
          "Liquidity Management"
        ]
      },
      {
        title: "Week 4: Incentive Design",
        items: [
          "Staking Mechanics",
          "Network Participation Rewards",
          "Preventing Economic Attacks"
        ]
      },
      {
        title: "Week 5: Governance & Evolution",
        items: [
          "DAO Structure Design",
          "Voting Mechanisms",
          "Progressive Decentralization"
        ]
      }
    ],
    enrollmentLink: "https://outlierventures.io/academy/"
  },
  {
    id: "crypto-security",
    title: "Cryptocurrency Security Fundamentals",
    provider: "Chainalysis",
    level: "All Levels",
    duration: "4 weeks",
    description: "Essential security practices for safely managing cryptocurrency assets and preventing common attacks.",
    longDescription: "This security-focused course teaches you best practices for protecting your crypto assets. Topics include wallet security, exchange safety, scam prevention, and recovery strategies. Essential knowledge for anyone holding or managing digital assets.",
    lessons: 16,
    progress: 0,
    rating: 4.8,
    reviews: 903,
    tags: ["Security", "Wallets", "Protection"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=300",
    instructor: "Andreas M. Antonopoulos",
    certification: true,
    features: [
      "Security assessment tools",
      "Practical security exercises",
      "Case studies of major hacks",
      "Recovery planning templates"
    ],
    price: "$149",
    syllabus: [
      {
        title: "Week 1: Wallet Security",
        items: [
          "Private Key Management",
          "Hardware vs. Software Wallets",
          "Seed Phrase Protection"
        ]
      },
      {
        title: "Week 2: Transaction Security",
        items: [
          "Address Verification",
          "Network Fee Considerations",
          "Multi-signature Setups"
        ]
      },
      {
        title: "Week 3: Exchange & DeFi Security",
        items: [
          "Exchange Evaluation",
          "Smart Contract Risks",
          "Phishing Prevention"
        ]
      },
      {
        title: "Week 4: Recovery & Inheritance",
        items: [
          "Backup Strategies",
          "Inheritance Planning",
          "Lost Asset Recovery"
        ]
      }
    ],
    enrollmentLink: "https://www.chainalysis.com/education/"
  },
  {
    id: "metaverse-development",
    title: "Metaverse Development & Design",
    provider: "Decentraland",
    level: "Intermediate",
    duration: "8 weeks",
    description: "Learn to build immersive experiences, games, and applications for blockchain-based metaverse platforms.",
    longDescription: "This immersive course teaches you the technical and creative skills needed to build in the metaverse. Focusing on Decentraland, you'll learn 3D modeling, scene scripting, NFT integration, and monetization strategies for virtual worlds.",
    lessons: 32,
    progress: 0,
    rating: 4.5,
    reviews: 487,
    tags: ["Metaverse", "3D Design", "Virtual Worlds"],
    image: "https://images.unsplash.com/photo-1634096381330-d39b95e208fe?q=80&w=300",
    instructor: "Jin",
    certification: true,
    features: [
      "3D design toolkit",
      "SDK access",
      "Virtual land sandboxes",
      "Community showcases"
    ],
    price: "$279",
    syllabus: [
      {
        title: "Week 1-2: Metaverse Foundations",
        items: [
          "Metaverse Platforms Overview",
          "3D Space Concepts",
          "Asset Creation Basics"
        ]
      },
      {
        title: "Week 3-4: Scene Development",
        items: [
          "3D Modeling for Metaverse",
          "Scene Optimization",
          "Environment Design"
        ]
      },
      {
        title: "Week 5-6: Interactivity",
        items: [
          "Scripting Interactions",
          "User Experience Design",
          "NPC & AI Integration"
        ]
      },
      {
        title: "Week 7-8: Monetization & Deployment",
        items: [
          "NFT Integration",
          "Virtual Economy Design",
          "Land Development Strategies"
        ]
      }
    ],
    enrollmentLink: "https://decentraland.org/learn/"
  }
];

interface RealCoursesProps {
  onEnroll?: (courseId: string) => void;
  onBookmark?: (courseId: string) => void;
  bookmarkedCourses?: string[];
}

export default function RealCourses({ onEnroll, onBookmark, bookmarkedCourses = [] }: RealCoursesProps) {
  const { t } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filter, setFilter] = useState<string>("all");
  
  const filteredCourses = realCourses.filter(course => {
    if (filter === "all") return true;
    if (filter === "beginner" && course.level === "Beginner") return true;
    if (filter === "intermediate" && course.level === "Intermediate") return true;
    if (filter === "advanced" && course.level === "Advanced") return true;
    if (filter === "certification" && course.certification) return true;
    if (filter === "free" && course.price?.startsWith("Free")) return true;
    return false;
  });
  
  const handleEnroll = (courseId: string) => {
    if (onEnroll) {
      onEnroll(courseId);
    } else {
      // Default behavior if no handler provided
      const course = realCourses.find(c => c.id === courseId);
      if (course?.enrollmentLink) {
        window.open(course.enrollmentLink, '_blank');
      }
    }
  };
  
  const handleBookmark = (courseId: string) => {
    if (onBookmark) {
      onBookmark(courseId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">{t("education.realCourses.title", "Featured Courses")}</h2>
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filter === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            {t("education.realCourses.filters.all", "All Courses")}
          </Badge>
          <Badge 
            variant={filter === "beginner" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("beginner")}
          >
            {t("education.realCourses.filters.beginner", "Beginner")}
          </Badge>
          <Badge 
            variant={filter === "intermediate" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("intermediate")}
          >
            {t("education.realCourses.filters.intermediate", "Intermediate")}
          </Badge>
          <Badge 
            variant={filter === "advanced" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("advanced")}
          >
            {t("education.realCourses.filters.advanced", "Advanced")}
          </Badge>
          <Badge 
            variant={filter === "certification" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("certification")}
          >
            {t("education.realCourses.filters.certification", "With Certification")}
          </Badge>
          <Badge 
            variant={filter === "free" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("free")}
          >
            {t("education.realCourses.filters.free", "Free")}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden border-gray-800 hover:border-primary/50 transition-colors">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1621504450181-5eadc9313d79?q=80&w=300";
                }}
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute top-2 right-2 flex gap-2">
                {course.certification && (
                  <Badge variant="secondary" className="bg-green-700/20 text-green-400 border-green-700">
                    <Award className="w-3 h-3 mr-1" />
                    {t("education.realCourses.certification", "Certification")}
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                  onClick={() => handleBookmark(course.id)}
                >
                  {bookmarkedCourses.includes(course.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge variant="outline" className="bg-background/80">
                  {course.level}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-1 text-gray-400">
                {course.provider}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {course.lessons} {t("education.realCourses.lessons", "lessons")}
                </div>
              </div>
              
              <p className="text-sm text-gray-300 line-clamp-3">
                {course.description}
              </p>
              
              <div className="flex items-center mt-4 text-sm">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                  <span className="ml-1 font-medium">{course.rating.toFixed(1)}</span>
                </div>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-400">{course.reviews} {t("education.realCourses.reviews", "reviews")}</span>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    {t("education.realCourses.details", "Details")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">{course.title}</DialogTitle>
                    <DialogDescription>
                      {t("education.realCourses.by", "By")} {course.provider} • {course.level} • {course.duration}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">{t("education.realCourses.aboutCourse", "About This Course")}</h3>
                        <p className="text-gray-300">{course.longDescription || course.description}</p>
                      </div>
                      
                      <Tabs defaultValue="syllabus">
                        <TabsList>
                          <TabsTrigger value="syllabus">{t("education.realCourses.syllabus", "Syllabus")}</TabsTrigger>
                          <TabsTrigger value="features">{t("education.realCourses.features", "Features")}</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="syllabus" className="space-y-4 mt-4">
                          {course.syllabus?.map((section, idx) => (
                            <div key={`syllabus-${idx}`}>
                              <h4 className="font-medium mb-2">{section.title}</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {section.items.map((item, itemIdx) => (
                                  <li key={`item-${itemIdx}`} className="text-gray-300">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </TabsContent>
                        
                        <TabsContent value="features" className="mt-4">
                          <ul className="list-disc pl-5 space-y-2">
                            {course.features?.map((feature, idx) => (
                              <li key={`feature-${idx}`} className="text-gray-300">{feature}</li>
                            ))}
                          </ul>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">{t("education.realCourses.price", "Price")}</h4>
                          <p className="text-lg font-bold">{course.price || "Free"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">{t("education.realCourses.instructor", "Instructor")}</h4>
                          <p>{course.instructor || course.provider}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">{t("education.realCourses.tags", "Tags")}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {course.tags.map((tag) => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button className="w-full" onClick={() => handleEnroll(course.id)}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {t("education.realCourses.enroll", "Enroll Now")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="flex-1" onClick={() => handleEnroll(course.id)}>
                {course.progress > 0 
                  ? t("education.realCourses.continue", "Continue") 
                  : t("education.realCourses.enroll", "Enroll")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}