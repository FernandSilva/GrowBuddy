// ✅ POSTCARD.TSX — FINAL PATCHED
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, Pagination } from "swiper/modules";
import { Models } from "appwrite";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";

type PostCardProps = {
  post: Models.Document;
  disableCommentClick?: boolean;
};

const PostCard = ({ post, disableCommentClick = false }: PostCardProps) => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);

  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post.imageUrl.forEach((url: string) => {
      const typeStartIndex = url.indexOf("?type=");
      let typeMatch = "unknown";
      if (typeStartIndex !== -1) {
        const typeEndIndex = url.indexOf("&", typeStartIndex);
        typeMatch = typeEndIndex !== -1
          ? url.substring(typeStartIndex + 6, typeEndIndex)
          : url.substring(typeStartIndex + 6);
      }

      types.push(typeMatch.split("/")[0]);
      const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
      urls.push(cleanUrl);
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [post.imageUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const { target, isIntersecting } = entry;
        const index = parseInt(target.getAttribute("data-index") || "0", 10);
        if (isIntersecting) {
          videoRefs.current[index]?.play().catch((error) => {
            console.error("Error playing video:", error);
          });
        } else {
          videoRefs.current[index]?.pause();
        }
      });
    }, { threshold: 0.5 });

    cleanUrls.forEach((_, index) => {
      const element = videoRefs.current[index];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [cleanUrls]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/update-post/${post.$id}`);
  };

  return (
    <div className="post-card sm:max-w-screen-sm">
      <Link to={`/posts/${post.$id}`} className="block">
        <div className="flex-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.creator.$id}`} onClick={(e) => e.stopPropagation()}>
              <img
                src={post.creator?.imageUrl || "/assets/icons/profile-placeholder1.svg"}
                alt="creator"
                className="w-12 lg:h-12 rounded-full"
              />
            </Link>

            <div className="flex flex-col">
              <p className="base-medium lg:body-bold text-black">
                {post.creator.name}
              </p>
              <div className="flex-center gap-2 text-light-3">
                <p className="subtle-semibold lg:small-regular">
                  {multiFormatDateString(post.$createdAt)}
                </p>
                •
                <p className="subtle-semibold lg:small-regular">
                  {post.location}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Fixed: No nested Link here. Only action */}
          {user.id === post.creator.$id && (
            <img
              src="/assets/icons/edit.svg"
              alt="edit"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={handleEditClick}
            />
          )}
        </div>

        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <Swiper
          modules={[A11y, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination
          onInit={(swiper) => setActiveIndex(swiper.activeIndex)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {cleanUrls.map((url, index) => (
            <SwiperSlide key={index}>
              {fileTypes[index] === "video" ? (
                <video
                  className="post-card_img"
                  loop
                  preload="auto"
                  ref={(el) => (videoRefs.current[index] = el)}
                  data-index={index}
                >
                  <source src={url} />
                </video>
              ) : fileTypes[index] === "image" ? (
                <img
                  className="post-card_img"
                  src={url}
                  alt="File preview"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              ) : (
                <p>Unknown file type</p>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </Link>

      <PostStats
        post={post}
        userId={user.id}
        showComments={!disableCommentClick}
        disableCommentClick={disableCommentClick}
      />
    </div>
  );
};

export default PostCard;
