import Loader from "./Loader";
import { useGetUsers } from "@/lib/react-query/queries";
import { UserCard } from ".";

const RightSidebar = () => {
  const { data: creators, isFetching } = useGetUsers();

  const shouldShowNoCreators = creators?.documents.length === 0;

  if (isFetching) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <section className="rightsidebar">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">Top Creators</h2>
        {shouldShowNoCreators ? (
          <p className="text-light-4 mt-10 text-center w-full">
            No top creators found
          </p>
        ) : (
          <ul className="user-grid">
            {creators?.documents.map((creator) => (
              <li key={creator?.$id} className="min-w-[200px] w-full">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default RightSidebar;
