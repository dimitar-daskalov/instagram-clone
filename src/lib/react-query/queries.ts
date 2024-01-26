/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  deletePost,
  likePost,
  getUserById,
  updateUser,
  getInfinitePosts,
  searchPosts,
  savePost,
  deleteSavedPost,
  getInfiniteUsers,
  getInfiniteRecentPosts,
  getUsers,
} from "@/lib/appwrite/api";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

type SignInAccountProps = {
  email: string;
  password: string;
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: SignInAccountProps) => signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFITINE_RECENT_POSTS],
    queryFn: getInfiniteRecentPosts as any,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      const lastId = lastPage?.documents[lastPage.documents.length - 1]?.$id;
      return lastId;
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFITINE_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

type DeletePostProps = {
  postId?: string;
  imageId?: string;
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: DeletePostProps) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFITINE_RECENT_POSTS],
      });
    },
  });
};

type LikePostProps = {
  postId: string;
  likesArray: string[];
};

// TODO: - there is a problem with the invalidation of some of the queries that needs to be fixed
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, likesArray }: LikePostProps) =>
      likePost(postId, likesArray),
    onSuccess: (data) =>
      Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.GET_POST_BY_ID, data?.$id]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_INFINITE_POSTS]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_INFITINE_RECENT_POSTS]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_CURRENT_USER]),
      ]),
  });
};

type SavePostProps = {
  userId: string;
  postId: string;
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: SavePostProps) => savePost(userId, postId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.GET_INFINITE_POSTS]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_INFITINE_RECENT_POSTS]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_CURRENT_USER]),
      ]),
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.GET_INFINITE_POSTS]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_INFITINE_RECENT_POSTS]),
        queryClient.invalidateQueries([QUERY_KEYS.GET_CURRENT_USER]),
      ]),
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
  });
};

export const useGetInfiniteUsers = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_USERS],
    queryFn: getInfiniteUsers as any,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};
