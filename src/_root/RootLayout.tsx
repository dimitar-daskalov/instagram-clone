import { LeftSidebar, BottomBar, TopBar } from "@/components/shared";
import RightSidebar from "@/components/shared/RightSidebar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <TopBar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <RightSidebar />
      <BottomBar />
    </div>
  );
};

export default RootLayout;
