import { Loader, UserCard } from "@/components/shared";
import { useToast } from "@/components/ui";
import { useGetUsers } from "@/lib/react-query/queries";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const AllUsers = () => {
  const { toast } = useToast();
  const { ref, inView } = useInView();
  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useGetUsers();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const creators = pages?.pages.flatMap((page) => page.documents);

  const shouldShowUsers = creators?.length === 0;

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
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {shouldShowUsers ? (
          <p className="text-light-4 mt-10 text-center w-full">End of users</p>
        ) : (
          <ul className="user-grid">
            {creators?.map((creator) => (
              <li key={creator?.$id} className="flex-1 min-w-[200px] w-full">
                <UserCard user={creator} />
              </li>
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

export default AllUsers;
