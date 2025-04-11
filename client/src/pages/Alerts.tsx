import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import AlertSystem from "@/components/AlertSystem";

const Alerts = () => {
  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="h-[calc(100vh-132px)] overflow-auto">
        <AlertSystem />
      </div>
    </>
  );
};

export default Alerts;
