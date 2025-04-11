import Header from "@/components/Header";
import AlertSystem from "@/components/AlertSystem";

const Alerts = () => {
  return (
    <>
      <Header />
      <div className="h-[calc(100vh-66px)] overflow-auto">
        <AlertSystem />
      </div>
    </>
  );
};

export default Alerts;
