import { ReactNode } from "react";

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption?: string;
  file?: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption?: string;
  imageId: string;
  imageUrl?: URL;
  file?: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};


// For general use in following and unfollowing
export type IUserRelationship = {
  userId: string;       // The ID of the user who is performing the action
  followsUserId: string; // The ID of the user who is being followed or unfollowed
};

// If needed, you could also define types for actions that require more information
export type IFollowUser = IUserRelationship;

export type IUnfollowUser = {
  documentId: string; // Assuming unfollowing requires a document ID that represents the relationship
};



export interface IComment {
  postId: string;
  userId: string;
  text: string;
}

export interface ICreateComment {
  postId: string;
  userId: string;
  text: string;
}

export interface IDeleteComment {
  commentId: string;
}


// types/index.ts

export interface User {
  id: any;
  $id: string;
  username: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  bio?: string;
}

export interface Message {
  text: ReactNode;
  id:string,
  $id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  recipientId: string
}




// Continue with existing types...
