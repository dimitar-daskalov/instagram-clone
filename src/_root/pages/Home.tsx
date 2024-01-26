import { Loader, PostCard } from "@/components/shared";
import { toast } from "@/components/ui";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const { ref, inView } = useInView();
  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useGetRecentPosts();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const recentPosts = pages?.pages.flatMap((page) => page?.documents);

  const shouldShowRecentPosts = recentPosts?.length === 0;

  if (isError) {
    toast({ title: "Something went wrong." });

    return;
  }

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="flex gap-2 w-full max-w-5xl">
          <img
            src={"/assets/icons/home.svg"}
            alt="home"
            width={36}
            height={36}
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
        </div>

        {shouldShowRecentPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          <ul className="flex flex-col flex-1 gap-9 w-full">
            {recentPosts?.map((post: Models.Document) => (
              <PostCard key={post?.caption} post={post} />
            ))}
          </ul>
        )}

        {hasNextPage && (
          <div ref={ref} className="mt-10">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
