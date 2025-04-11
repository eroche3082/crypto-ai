import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import PortfolioSimulator from "@/components/PortfolioSimulator";
import ChatContainer from "@/components/ChatContainer";

const Portfolio = () => {
  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="flex flex-col md:flex-row h-[calc(100vh-132px)] overflow-hidden">
        <div className="w-full md:w-1/2 overflow-auto">
          <PortfolioSimulator />
        </div>
        <div className="w-full md:w-1/2 border-l border-gray-800">
          <ChatContainer />
        </div>
      </div>
    </>
  );
};

export default Portfolio;
