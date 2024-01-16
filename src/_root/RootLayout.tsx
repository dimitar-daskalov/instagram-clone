import BottomBar from "@/components/ui/shared/BottomBar";
import LeftSidebar from "@/components/ui/shared/LeftSidebar";
import TopBar from "@/components/ui/shared/TopBar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <TopBar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <BottomBar />
    </div>
  );
};

export default RootLayout;
