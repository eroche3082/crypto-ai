import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EducationHub = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("basics");
  
  const educationCategories = [
    {
      id: "basics",
      icon: "school",
      title: t("education.basics.title"),
      description: t("education.basics.description"),
      content: [
        {
          question: t("education.basics.what.question"),
          answer: t("education.basics.what.answer"),
        },
        {
          question: t("education.basics.blockchain.question"),
          answer: t("education.basics.blockchain.answer"),
        },
        {
          question: t("education.basics.wallet.question"),
          answer: t("education.basics.wallet.answer"),
        },
        {
          question: t("education.basics.mining.question"),
          answer: t("education.basics.mining.answer"),
        },
      ],
    },
    {
      id: "defi",
      icon: "account_balance",
      title: t("education.defi.title"),
      description: t("education.defi.description"),
      content: [
        {
          question: t("education.defi.what.question"),
          answer: t("education.defi.what.answer"),
        },
        {
          question: t("education.defi.differ.question"),
          answer: t("education.defi.differ.answer"),
        },
        {
          question: t("education.defi.protocols.question"),
          answer: t("education.defi.protocols.answer"),
        },
        {
          question: t("education.defi.risks.question"),
          answer: t("education.defi.risks.answer"),
        },
      ],
    },
    {
      id: "nft",
      icon: "filter_none",
      title: t("education.nft.title"),
      description: t("education.nft.description"),
      content: [
        {
          question: t("education.nft.what.question"),
          answer: t("education.nft.what.answer"),
        },
        {
          question: t("education.nft.work.question"),
          answer: t("education.nft.work.answer"),
        },
        {
          question: t("education.nft.use.question"),
          answer: t("education.nft.use.answer"),
        },
      ],
    },
    {
      id: "trading",
      icon: "candlestick_chart",
      title: t("education.trading.title"),
      description: t("education.trading.description"),
      content: [
        {
          question: t("education.trading.analysis.question"),
          answer: t("education.trading.analysis.answer"),
        },
        {
          question: t("education.trading.strategy.question"),
          answer: t("education.trading.strategy.answer"),
        },
        {
          question: t("education.trading.risk.question"),
          answer: t("education.trading.risk.answer"),
        },
      ],
    },
  ];
  
  const featuredResources = [
    {
      title: t("education.resources.bitcoin"),
      icon: "menu_book",
      description: t("education.resources.bitcoinDesc"),
      link: "https://bitcoin.org/bitcoin.pdf",
    },
    {
      title: t("education.resources.ethereum"),
      icon: "menu_book",
      description: t("education.resources.ethereumDesc"),
      link: "https://ethereum.org/en/whitepaper/",
    },
    {
      title: t("education.resources.defiPrimer"),
      icon: "web",
      description: t("education.resources.defiPrimerDesc"),
      link: "https://blog.coinbase.com/a-beginners-guide-to-decentralized-finance-defi-574c68ff43c4",
    },
  ];
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("education.title")}</h2>
        <p className="text-sm text-gray-400">{t("education.subtitle")}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              {educationCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                  <span className="material-icons text-sm mr-1">{category.icon}</span>
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {educationCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="bg-secondary p-6 rounded-lg">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">{category.title}</h3>
                    <p className="text-sm text-gray-400">{category.description}</p>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.content.map((item, index) => (
                      <AccordionItem key={`${category.id}-${index}`} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: item.answer }}></div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">{t("education.featuredResources")}</h3>
          <div className="space-y-4">
            {featuredResources.map((resource, index) => (
              <Card key={index} className="bg-secondary border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">{resource.title}</CardTitle>
                    <span className="material-icons text-primary">{resource.icon}</span>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline flex items-center"
                  >
                    {t("education.readMore")}
                    <span className="material-icons text-xs ml-1">open_in_new</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationHub;
