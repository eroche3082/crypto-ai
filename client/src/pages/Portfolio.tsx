import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import PortfolioSimulator from "@/components/PortfolioSimulator";

const Portfolio = () => {
  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="h-[calc(100vh-132px)] overflow-auto">
        <PortfolioSimulator />
      </div>
    </>
  );
};

export default Portfolio;
