import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import EducationHub from "@/components/EducationHub";

const Education = () => {
  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="h-[calc(100vh-132px)] overflow-auto">
        <EducationHub />
      </div>
    </>
  );
};

export default Education;
