import { GridPostList, Loader, UserCard } from "@/components/shared";
import { Input } from "@/components/ui";
import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import {
  useFollowStatus,
  useFollowUser,
  useGetUserById,
  useGetUserRelationships,
  useSignOutAccount,
  useUnfollowUser,
  useCreateNotification,
} from "@/lib/react-query/queries";
import { TbLogout2 } from "react-icons/tb";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Following from "./Following";
import Follower from "./Follower";
import LikedPosts from "./LikedPosts";
import { useUserContext } from "@/context/AuthContext";
import { BiMessageDetail } from "react-icons/bi";
import { Button } from "@/components/ui";
import { INITIAL_USER } from "@/types";

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, setUser, setIsAuthenticated } = useUserContext();
  const { pathname } = useLocation();
  const { data: currentUser } = useGetUserById(id || "");
  const { data: userRelationships } = useGetUserRelationships(id);
  const { mutate: signOut } = useSignOutAccount();
  const isOwnProfile = user?.id === currentUser?.$id;
  const { data: followStatusData } = useFollowStatus(user?.id, id);
  const [isFollowing, setIsFollowing] = useState(false);

  const { mutate: createNotification } = useCreateNotification();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  useEffect(() => {
    setIsFollowing(!!followStatusData);
  }, [followStatusData]);

  const handleFollow = () => {
    if (!isFollowing) {
      followMutation.mutate(
        { userId: user?.id, followsUserId: id },
        {
          onSuccess: () => {
            setIsFollowing(true);
            createNotification({
              userId: id || "",
              senderId: user?.id || "",
              type: "follow",
              relatedId: id || "",
              referenceId: user?.id || "",
              content: `${user?.name} started following you.`,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user?.name || "",
              senderImageUrl: user?.imageUrl || "",
            });
          },
        }
      );
    }
  };

  const handleUnfollow = () => {
    if (isFollowing && followStatusData) {
      unfollowMutation.mutate(followStatusData.$id, {
        onSuccess: () => {
          setIsFollowing(false);
          createNotification({
            userId: id || "",
            senderId: user?.id || "",
            type: "unfollow",
            relatedId: id || "",
            referenceId: user?.id || "",
            content: `${user?.name} unfollowed you.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            senderName: user?.name || "",
            senderImageUrl: user?.imageUrl || "",
          });
        },
        onError: (error) => {
          console.error("Failed to unfollow user:", error);
        },
      });
    }
  };

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(INITIAL_USER);
      navigate("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigateToSettings = () => {
    navigate("/settings");
  };

  const MessageActive = pathname === "/Chat";

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="flex flex-col xl:flex-row max-xl:items-center lg:gap-7 lg:justify-between">
        <div className="flex lg:gap-6 gap-2">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-[4rem] h-[4rem] lg:h-[6rem] lg:w-[6rem] rounded-full hidden md:inline"
          />
          <div className="md:hidden flex flex-col gap-1">
            <img
              src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="w-[4rem] h-[4rem] lg:h-[6rem] lg:w-[6rem] rounded-full"
            />
            <div className="md:hidden">
              <h1 className="lg:text-center xl:text-left !text-[14px] w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium !text-[12px] text-light-3">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:mt-2">
            <div className="hidden md:flex flex-col w-full">
              <h1 className="lg:text-center xl:text-left md:!text-[32px] h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium !text-[14px] text-light-3 lg:text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>
            <div className="flex flex-row mt-[10px] md:mt-[0px] gap-2 md:gap-8 pt-[10px] lg:pt-[20px] items-center justify-center xl:justify-start">
              <Link to={`/profile/${id}`} className="flex-center gap-1 md:gap-2 cursor-pointer">
                <p className="small-semibold lg:body-bold text-green-500">
                  {currentUser.posts.length}
                </p>
                <p className="small-medium lg:base-medium text-light-3">Posts</p>
              </Link>
              <Link to={`/profile/${id}/followers`} className="flex-center gap-1 md:gap-2 cursor-pointer">
                <p className="small-semibold lg:body-bold text-green-500">
                  {userRelationships?.followers || 0}
                </p>
                <p className="small-medium lg:base-medium text-light-3">Followers</p>
              </Link>
              <Link to={`/profile/${id}/following`} className="flex-center gap-1 md:gap-2 cursor-pointer">
                <p className="small-semibold lg:body-bold text-green-500">
                  {userRelationships?.following || 0}
                </p>
                <p className="small-medium lg:base-medium text-light-3">Following</p>
              </Link>
            </div>
            <p className="small-medium md:base-medium text-center hidden md:flex xl:text-left pt-[10px] lg:pt-[20px] max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>
        </div>

        <div className="w-[100%] md:hidden pl-[10px] py-[10px]">
          <p className="text-[10px] text-[#555555]">{currentUser.bio}</p>
        </div>

        <div className="flex justify-between xl:justify-end xl:gap-4 md:mt-4 w-full">
          {isOwnProfile ? (
            <>
              <Link to={`/update-profile/${currentUser.$id}`}>
                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition">
                  <span className="md:text-sm text-[14px] font-medium">Edit Profile</span>
                </Button>
              </Link>
              <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition" onClick={handleNavigateToSettings}>
                <span className="text-sm font-medium">Settings</span>
              </Button>
              <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition" onClick={handleSignOut}>
                <TbLogout2 className="h-[14px] w-[14px]" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex justify-center gap-4 mt-4">
              {isFollowing ? (
                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-green-500 rounded-md transition" onClick={handleUnfollow}>
                  Unfollow
                </Button>
              ) : (
                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-green-500 rounded-md transition" onClick={handleFollow}>
                  Follow
                </Button>
              )}
              <Button className={`inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md transition bg-white hover:bg-green-500 ${MessageActive ? "bg-green-500 text-white" : ""}`} onClick={() => navigate("/Chat")}>
                <BiMessageDetail />
                <p className="text-sm">Message</p>
              </Button>
            </div>
          )}
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex justify-center max-w-5xl w-full my-4 border-b border-gray-300 gap-8">
          <Link to={`/profile/${id}`} className={`flex items-center gap-2 px-0.5 py-2 ${pathname === `/profile/${id}` ? "text-green-500 border-b-2 border-green-500" : "text-gray-600 hover:text-green-500"}`}>
            <img src="/assets/icons/posts.svg" alt="posts" className="w-5 h-5" />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <Link to={`/profile/${id}/liked-posts`} className={`flex items-center gap-2 px-0.5 py-2 ${pathname === `/profile/${id}/liked-posts` ? "text-green-500 border-b-2 border-green-500" : "text-gray-600 hover:text-green-500"}`}>
            <img src="/assets/icons/like.svg" alt="like" className="w-5 h-5" />
            <span className="hidden md:inline">Liked Posts</span>
          </Link>
          <Link to={`/Chat`} className={`flex items-center gap-2 px-0.5 py-2 ${pathname.includes(`/Chat`) ? "text-green-500 border-b-2 border-green-500" : "text-gray-600 hover:text-green-500"}`}>
            <img src="/assets/icons/message.svg" alt="comments" className="w-5 h-5" />
            <span className="hidden md:inline">Messages</span>
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={
            <GridPostList
                posts={[...(currentUser.posts || [])].reverse()}
                showUser={false}
                disableCommentClick={true}
                isExplorePage={false} // ✅ Explicit for clarity
              />

          }
        />
        <Route path="/liked-posts" element={<LikedPosts />} />
        <Route path="/following" element={<Following />} />
        <Route path="/followers" element={<Follower />} />
      </Routes>

      <Outlet />
    </div>
  );
};

export default Profile;
