import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  jest,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import authRoutes from "../../modules/auth/routes/auth.routes.js";
import errorHandler from "../../middleware/errorHandler.js";

/**
 * The upload routes call out to real Cloudinary via services/upload.service.js.
 * We mock that service so tests don't need real Cloudinary credentials/network.
 * Must be registered BEFORE the routes/service are imported - hence the
 * dynamic imports below rather than static top-level imports for these two.
 */
jest.unstable_mockModule("../../services/upload.service.js", () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue({
    url: "https://res.cloudinary.com/demo/image/upload/v1/fake.png",
    publicId: "ecommerce/misc/fake",
  }),
  uploadMultipleImageBuffers: jest.fn().mockResolvedValue([
    {
      url: "https://res.cloudinary.com/demo/image/upload/v1/fake1.png",
      publicId: "ecommerce/product-images/fake1",
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/v1/fake2.png",
      publicId: "ecommerce/product-images/fake2",
    },
  ]),
  deleteImageIfOwner: jest.fn().mockResolvedValue(undefined),
}));

const { default: uploadRoutes } =
  await import("../../modules/upload/routes/upload.routes.js");
const { uploadImageBuffer, uploadMultipleImageBuffers, deleteImageIfOwner } =
  await import("../../services/upload.service.js");

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use(errorHandler);
  return app;
};

const app = buildTestApp();

const registerAndLogin = async (email) => {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name: "Test User", email, password: "password123" });
  return agent;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  process.env.NODE_ENV = "test";
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeTestDB();
});

describe("POST /api/upload/shop-logo", () => {
  test("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/upload/shop-logo")
      .attach("image", Buffer.from("fake-bytes"), {
        filename: "a.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(401);
  });

  test("uploads a logo and returns a url + publicId", async () => {
    const agent = await registerAndLogin("uploader1@example.com");

    const res = await agent
      .post("/api/upload/shop-logo")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "logo.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.url).toMatch(/^https:\/\//);
    expect(res.body.publicId).toBeDefined();
    expect(uploadImageBuffer).toHaveBeenCalledTimes(1);
    // Folder is hardcoded server-side to "shop-logos" for this route -
    // confirm the controller passed exactly that, not something client-controlled
    expect(uploadImageBuffer.mock.calls[0][1]).toBe("shop-logos");
  });

  test("rejects a non-image file type", async () => {
    const agent = await registerAndLogin("uploader2@example.com");

    const res = await agent
      .post("/api/upload/shop-logo")
      .attach("image", Buffer.from("not an image"), {
        filename: "doc.txt",
        contentType: "text/plain",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/JPEG, PNG, WEBP, or GIF/i);
    expect(uploadImageBuffer).not.toHaveBeenCalled();
  });

  test("rejects when no file is attached", async () => {
    const agent = await registerAndLogin("uploader3@example.com");
    const res = await agent.post("/api/upload/shop-logo");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no image file/i);
  });

  test("rejects a file over the 5MB size limit", async () => {
    const agent = await registerAndLogin("uploader4@example.com");
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024);

    const res = await agent
      .post("/api/upload/shop-logo")
      .attach("image", oversizedBuffer, {
        filename: "big.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/too large/i);
  });
});

describe("POST /api/upload/shop-banner and /api/upload/avatar", () => {
  test("uploads a banner to the correct folder", async () => {
    const agent = await registerAndLogin("uploader5@example.com");

    await agent
      .post("/api/upload/shop-banner")
      .attach("image", Buffer.from("banner"), {
        filename: "b.png",
        contentType: "image/png",
      });

    expect(uploadImageBuffer.mock.calls[0][1]).toBe("shop-banners");
  });

  test("uploads an avatar to the correct folder", async () => {
    const agent = await registerAndLogin("uploader6@example.com");

    await agent
      .post("/api/upload/avatar")
      .attach("image", Buffer.from("avatar"), {
        filename: "a.png",
        contentType: "image/png",
      });

    expect(uploadImageBuffer.mock.calls[0][1]).toBe("avatars");
  });
});

describe("POST /api/upload/product-images", () => {
  test("uploads multiple images and returns an array of results", async () => {
    const agent = await registerAndLogin("uploader7@example.com");

    const res = await agent
      .post("/api/upload/product-images")
      .attach("images", Buffer.from("img1"), {
        filename: "a.png",
        contentType: "image/png",
      })
      .attach("images", Buffer.from("img2"), {
        filename: "b.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveLength(2);
    expect(uploadMultipleImageBuffers).toHaveBeenCalledTimes(1);
    expect(uploadMultipleImageBuffers.mock.calls[0][1]).toBe("product-images");
  });

  test("rejects more than 5 images in one request", async () => {
    const agent = await registerAndLogin("uploader8@example.com");

    let req = agent.post("/api/upload/product-images");
    for (let i = 0; i < 6; i++) {
      req = req.attach("images", Buffer.from(`img${i}`), {
        filename: `${i}.png`,
        contentType: "image/png",
      });
    }
    const res = await req;

    expect(res.statusCode).toBe(400);
  });

  test("rejects when no files are attached", async () => {
    const agent = await registerAndLogin("uploader9@example.com");
    const res = await agent.post("/api/upload/product-images");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no image files/i);
  });
});

describe("DELETE /api/upload/image", () => {
  test("deletes an image by publicId, passing the requester for ownership check", async () => {
    const agent = await registerAndLogin("uploader10@example.com");

    const res = await agent
      .delete("/api/upload/image")
      .send({ publicId: "ecommerce/misc/fake" });

    expect(res.statusCode).toBe(200);
    expect(deleteImageIfOwner).toHaveBeenCalledWith(
      "ecommerce/misc/fake",
      expect.objectContaining({ email: "uploader10@example.com" }),
    );
  });

  test("rejects a missing publicId", async () => {
    const agent = await registerAndLogin("uploader11@example.com");
    const res = await agent.delete("/api/upload/image").send({});

    expect(res.statusCode).toBe(400);
  });

  test("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .delete("/api/upload/image")
      .send({ publicId: "ecommerce/misc/fake" });
    expect(res.statusCode).toBe(401);
  });

  test("propagates a 403 when the service reports the requester doesn't own the image", async () => {
    const agent = await registerAndLogin("uploader12@example.com");
    const { ForbiddenError } = await import("../../exceptions/ApiError.js");
    deleteImageIfOwner.mockRejectedValueOnce(
      new ForbiddenError("You are not allowed to delete this image"),
    );

    const res = await agent
      .delete("/api/upload/image")
      .send({ publicId: "someone-elses-image" });

    expect(res.statusCode).toBe(403);
  });
});
