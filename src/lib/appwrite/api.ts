import { ID, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

// Authentication
export const createUserAccount = async (user: INewUser) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) {
      throw Error;
    }

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.error(error);
    return error;
  }
};

type SaveUserToDBProps = {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
};

const saveUserToDB = async (user: SaveUserToDBProps) => {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.error(error);
  }
};

type SignInAccountProps = {
  email: string;
  password: string;
};

export const signInAccount = async (user: SignInAccountProps) => {
  try {
    const session = await account.createEmailSession(user.email, user.password);

    return session;
  } catch (error) {
    console.error(error);
  }
};

const getAccount = async () => {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) {
      throw Error;
    }

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) {
      throw Error;
    }

    return currentUser.documents[0];
  } catch (error) {
    return null;
  }
};

export const signOutAccount = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.error(error);
  }
};

// Posts CRUD
export const createPost = async (post: INewPost) => {
  try {
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) {
      throw Error;
    }

    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.error(error);
  }
};

const uploadFile = async (file: File) => {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.error(error);
  }
};

const getFilePreview = (fileId: string) => {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) {
      throw Error;
    }

    return fileUrl;
  } catch (error) {
    console.error(error);
  }
};

const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.error(error);
  }
};

export const searchPosts = async (searchTerm: string) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) {
      throw Error;
    }

    return posts;
  } catch (error) {
    console.error(error);
  }
};

type InfiniteProps = {
  pageParam: number;
};

export const getInfinitePosts = async ({ pageParam }: InfiniteProps) => {
  // Expected posts could be structured differently, so any is suitable.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      queries
    );

    if (!posts) {
      throw Error;
    }

    return posts;
  } catch (error) {
    console.error(error);
  }
};

export const getPostById = async (postId: string) => {
  if (!postId) {
    throw Error;
  }

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );

    if (!post) {
      throw Error;
    }

    return post;
  } catch (error) {
    console.error(error);
  }
};

export const updatePost = async (post: IUpdatePost) => {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      throw Error;
    }

    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.error(error);
  }
};

export const deletePost = async (postId?: string, imageId?: string) => {
  if (!postId || !imageId) {
    return;
  }

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );

    if (!statusCode) {
      throw Error;
    }

    await deleteFile(imageId);

    return { status: "ok" };
  } catch (error) {
    console.error(error);
  }
};

export const likePost = async (postId: string, likesArray: string[]) => {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) {
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.error(error);
  }
};

export const savePost = async (userId: string, postId: string) => {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) {
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.error(error);
  }
};

export const deleteSavedPost = async (savedRecordId: string) => {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) {
      throw Error;
    }

    return { status: "ok" };
  } catch (error) {
    console.error(error);
  }
};

export const getUserPosts = async (userId: string) => {
  if (!userId) {
    return;
  }

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) {
      throw Error;
    }

    return post;
  } catch (error) {
    console.error(error);
  }
};

export const getInfiniteRecentPosts = async ({ pageParam }: InfiniteProps) => {
  // Expected posts could be structured differently, so any is suitable.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = [Query.orderDesc("$createdAt"), Query.limit(20)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      queries
    );

    if (!posts) {
      throw Error;
    }

    return posts;
  } catch (error) {
    console.error(error);
  }
};

// Users CRUD
export const getInfiniteUsers = async ({ pageParam }: InfiniteProps) => {
  // Expected users could be structured differently, so any is suitable.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = [Query.orderDesc("$createdAt"), Query.limit(20)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      queries
    );

    if (!users) {
      throw Error;
    }

    return users;
  } catch (error) {
    console.error(error);
  }
};

export const getUsers = async () => {
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(10)]
    );

    if (!users) {
      throw Error;
    }

    return users;
  } catch (error) {
    console.log(error);
  }
};

export const getUserById = async (userId: string) => {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId
    );

    if (!user) {
      throw Error;
    }

    return user;
  } catch (error) {
    console.error(error);
  }
};

export const updateUser = async (user: IUpdateUser) => {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      throw Error;
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error(error);
  }
};
