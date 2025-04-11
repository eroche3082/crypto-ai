import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import NewsFeed from "@/components/NewsFeed";
import ChatContainer from "@/components/ChatContainer";

const News = () => {
  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="flex flex-col md:flex-row h-[calc(100vh-132px)] overflow-hidden">
        <div className="w-full md:w-1/2 overflow-auto">
          <NewsFeed />
        </div>
        <div className="w-full md:w-1/2 border-l border-gray-800">
          <ChatContainer />
        </div>
      </div>
    </>
  );
};

export default News;
