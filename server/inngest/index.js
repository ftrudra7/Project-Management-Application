import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({
  id: "forge",
});

// ================= USER CREATED =================

const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    trigger: {
      event: "clerk/user.created",
    },
  },
  async ({ event, step }) => {
    await step.run("create-user", async () => {
      const { data } = event;

      await prisma.user.upsert({
        where: {
          id: data.id,
        },
        update: {
          email: data.email_addresses?.[0]?.email_address ?? "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url ?? "",
        },
        create: {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address ?? "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url ?? "",
        },
      });
    });
  }
);

// ================= USER UPDATED =================

const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-update-from-clerk",
    trigger: {
      event: "clerk/user.updated",
    },
  },
  async ({ event, step }) => {
    await step.run("update-user", async () => {
      const { data } = event;

      await prisma.user.update({
        where: {
          id: data.id,
        },
        data: {
          email: data.email_addresses?.[0]?.email_address ?? "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url ?? "",
        },
      });
    });
  }
);

// ================= USER DELETED =================

const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete-from-clerk",
    trigger: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event, step }) => {
    await step.run("delete-user", async () => {
      const { data } = event;

      await prisma.user.deleteMany({
        where: {
          id: data.id,
        },
      });
    });
  }
);

// ================= WORKSPACE CREATED =================

const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
    trigger: {
      event: "clerk/organization.created",
    },
  },
  async ({ event, step }) => {
    await step.run("create-workspace", async () => {
      const { data } = event;

      await prisma.workspace.upsert({
        where: {
          id: data.id,
        },
        update: {
          name: data.name,
          slug: data.slug,
          imageUrl: data.image_url ?? "",
          ownerId: data.created_by ?? "",
        },
        create: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          imageUrl: data.image_url ?? "",
          ownerId: data.created_by ?? "",
        },
      });

      if (data.created_by) {
        await prisma.workspaceMember.upsert({
          where: {
            userId_workspaceId: {
              userId: data.created_by,
              workspaceId: data.id,
            },
          },
          update: {
            role: "ADMIN",
          },
          create: {
            userId: data.created_by,
            workspaceId: data.id,
            role: "ADMIN",
          },
        });
      }
    });
  }
);

// ================= WORKSPACE UPDATED =================

const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "sync-workspace-update-from-clerk",
    trigger: {
      event: "clerk/organization.updated",
    },
  },
  async ({ event, step }) => {
    await step.run("update-workspace", async () => {
      const { data } = event;

      await prisma.workspace.update({
        where: {
          id: data.id,
        },
        data: {
          name: data.name,
          slug: data.slug,
          imageUrl: data.image_url ?? "",
        },
      });
    });
  }
);

// ================= WORKSPACE DELETED =================

const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "sync-workspace-delete-from-clerk",
    trigger: {
      event: "clerk/organization.deleted",
    },
  },
  async ({ event, step }) => {
    await step.run("delete-workspace", async () => {
      const { data } = event;

      await prisma.workspace.deleteMany({
        where: {
          id: data.id,
        },
      });
    });
  }
);

// ================= MEMBER CREATED =================

const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-from-clerk",
    trigger: {
      event: "clerk/organizationMembership.created",
    },
  },
  async ({ event, step }) => {
    await step.run("create-workspace-member", async () => {
      const { data } = event;

      const role = data.role === "org:admin" ? "ADMIN" : "MEMBER";

      await prisma.workspaceMember.upsert({
        where: {
          userId_workspaceId: {
            userId: data.public_user_data.user_id,
            workspaceId: data.organization.id,
          },
        },
        update: {
          role,
        },
        create: {
          userId: data.public_user_data.user_id,
          workspaceId: data.organization.id,
          role,
        },
      });
    });
  }
);

// ================= MEMBER DELETED =================

const syncWorkspaceMemberDeletion = inngest.createFunction(
  {
    id: "sync-workspace-member-delete-from-clerk",
    trigger: {
      event: "clerk/organizationMembership.deleted",
    },
  },
  async ({ event, step }) => {
    await step.run("delete-workspace-member", async () => {
      const { data } = event;

      await prisma.workspaceMember.deleteMany({
        where: {
          userId: data.public_user_data.user_id,
          workspaceId: data.organization.id,
        },
      });
    });
  }
);

// ================= EXPORT =================

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