import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "my-app",
});

// Sync Clerk User Creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [
      {
        event: "clerk/user.created",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses?.[0]?.email_address ?? "",
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        image: data.image_url,
      },
    });
  }
);

// Sync Clerk User Update
const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-update-from-clerk",
    triggers: [
      {
        event: "clerk/user.updated",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data.email_addresses?.[0]?.email_address ?? "",
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        image: data.image_url,
      },
    });
  }
);

// Sync Clerk User Deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete-from-clerk",
    triggers: [
      {
        event: "clerk/user.deleted",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// Workspace Creation
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
    triggers: [
      {
        event: "clerk/organization.created",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  }
);

// Workspace Update
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "sync-workspace-update-from-clerk",
    triggers: [
      {
        event: "clerk/organization.updated",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  }
);

// Workspace Deletion
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "sync-workspace-delete-from-clerk",
    triggers: [
      {
        event: "clerk/organization.deleted",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// Workspace Member Creation
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-from-clerk",
    triggers: [
      {
        event: "clerk/organizationMembership.created",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspaceMember.create({
      data: {
        userId: data.public_user_data.user_id,
        workspaceId: data.organization.id,
        role: String(data.role).replace("org:", "").toUpperCase(),
      },
    });
  }
);

// Workspace Member Deletion
const syncWorkspaceMemberDeletion = inngest.createFunction(
  {
    id: "sync-workspace-member-delete-from-clerk",
    triggers: [
      {
        event: "clerk/organizationMembership.deleted",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspaceMember.deleteMany({
      where: {
        userId: data.public_user_data.user_id,
        workspaceId: data.organization.id,
      },
    });
  }
);

// Export Functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  syncWorkspaceMemberDeletion,
];