import { rest } from "msw";

export const handlers = [
  rest.post(/\/signup$/i, async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ message: "User created", user: { id: "123", ...body } })
    );
  }),
];
