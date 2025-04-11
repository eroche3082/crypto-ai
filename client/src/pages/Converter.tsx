import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import CryptoConverter from "@/components/CryptoConverter";

const Converter = () => {
  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="h-[calc(100vh-132px)] overflow-auto">
        <CryptoConverter />
      </div>
    </>
  );
};

export default Converter;
